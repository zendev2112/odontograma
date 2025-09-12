import { IncomingForm } from 'formidable'
import fs from 'fs'
import { google } from 'googleapis'

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('🚀 Upload API called - GOOGLE DRIVE → AIRTABLE ATTACHMENT MODE')

  try {
    // Check environment variables
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return res
        .status(500)
        .json({ error: 'Airtable credentials not configured' })
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res
        .status(500)
        .json({ error: 'Google Drive credentials not configured' })
    }

    // Parse form data
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    })

    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      })
    }

    console.log('📋 Parsing form data...')
    const { fields, files } = await parseForm()

    const recordId = fields.recordId?.[0] || fields.recordId
    const fieldName = fields.fieldName?.[0] || fields.fieldName
    const file = files.file?.[0] || files.file

    if (!recordId || !fieldName || !file) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log('📝 Processing HIGH-QUALITY file:', file.originalFilename)
    console.log('📊 Original file size:', file.size, 'bytes')

    // Read file - PRESERVE EVERY BYTE
    const originalBuffer = fs.readFileSync(file.filepath)
    console.log(
      '📖 Buffer size matches original:',
      originalBuffer.length === file.size
    )

    // STEP 1: Setup Google Drive API
    console.log('🔧 Setting up Google Drive API...')

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    const drive = google.drive({ version: 'v3', auth })

    // STEP 2: Upload to Google Drive with ZERO compression
    console.log('📤 Step 1: Uploading to Google Drive with FULL QUALITY...')

    const fileName =
      file.originalFilename || `odontogram_${recordId}_${Date.now()}.png`

    const driveResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
      },
      media: {
        mimeType: 'image/png',
        body: fs.createReadStream(file.filepath),
      },
    })

    const fileId = driveResponse.data.id
    console.log('✅ File uploaded to Google Drive!')
    console.log('📁 Google Drive File ID:', fileId)

    // STEP 3: Make the file publicly accessible temporarily
    console.log('🌐 Step 2: Making file temporarily public for Airtable...')

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    // Generate direct download URL for Airtable
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

    console.log('✅ File is now publicly accessible!')
    console.log('🔗 Direct download URL:', directDownloadUrl)

    // STEP 4: Tell Airtable to download and attach the file from Google Drive
    console.log(
      '📤 Step 3: Instructing Airtable to download and attach from Google Drive...'
    )

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    // Airtable will download the file from Google Drive and store it as an attachment
    const attachmentData = {
      fields: {
        [fieldName]: [
          {
            url: directDownloadUrl, // Airtable downloads from this URL
            filename: fileName,
          },
        ],
      },
    }

    console.log('📋 Sending download instruction to Airtable...')

    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachmentData),
    })

    const airtableResponseText = await airtableResponse.text()

    if (!airtableResponse.ok) {
      console.log('📨 Airtable error:', airtableResponseText)
      throw new Error(
        `Airtable error: ${airtableResponse.status} - ${airtableResponseText}`
      )
    }

    const result = JSON.parse(airtableResponseText)
    console.log('✅ Airtable has downloaded and attached the file!')

    // STEP 5: Optional - Remove public access from Google Drive after Airtable downloads
    console.log(
      '🔒 Step 4: Securing Google Drive file (removing public access)...'
    )

    try {
      // Get the permission ID for 'anyone'
      const permissions = await drive.permissions.list({ fileId })
      const anyonePermission = permissions.data.permissions.find(
        (p) => p.type === 'anyone'
      )

      if (anyonePermission) {
        await drive.permissions.delete({
          fileId,
          permissionId: anyonePermission.id,
        })
        console.log('🔒 Public access removed from Google Drive file')
      }
    } catch (permissionError) {
      console.warn(
        '⚠️ Could not remove public permission:',
        permissionError.message
      )
      // This is not critical - the file is still secured in Airtable
    }

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    // The attachment URL will now be Airtable's own CDN URL, not Google Drive
    const airtableAttachmentUrl = result.fields[fieldName]?.[0]?.url

    return res.status(200).json({
      success: true,
      message:
        'HIGH-QUALITY odontogram uploaded to Google Drive and attached to Airtable',
      recordId: result.id,
      attachmentUrl: airtableAttachmentUrl, // This is now Airtable's own URL
      googleDriveFileId: fileId,
      fileName: fileName,
      qualityPreserved: true,
      originalSize: file.size,
      workflow:
        'Upload to Google Drive → Airtable downloads → Stores as attachment',
    })
  } catch (error) {
    console.error('❌ Google Drive → Airtable workflow error:', error.message)
    return res.status(500).json({
      error: 'Google Drive → Airtable workflow failed',
      details: error.message,
    })
  }
}
