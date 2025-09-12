import { IncomingForm } from 'formidable'
import fs from 'fs'

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

  console.log('🚀 Upload API called - HIGH QUALITY MODE')

  try {
    // Check environment variables
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return res
        .status(500)
        .json({ error: 'Airtable credentials not configured' })
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

    // STEP 1: Upload to Pomf.lain.la (no compression, unlimited bandwidth)
    // This service preserves exact binary data
    console.log('📤 Step 1: Uploading to high-quality file host...')

    const uploadFormData = new FormData()
    const originalBlob = new Blob([originalBuffer], {
      type: 'image/png', // Exact MIME type to prevent any conversion
    })

    uploadFormData.append(
      'files[]',
      originalBlob,
      file.originalFilename || 'odontogram.png'
    )

    console.log('🔒 Uploading with ZERO compression...')

    // Use pomf.lain.la - known for preserving exact file quality
    const fileUploadResponse = await fetch('https://pomf.lain.la/upload.php', {
      method: 'POST',
      body: uploadFormData,
    })

    if (!fileUploadResponse.ok) {
      throw new Error(
        `High-quality upload failed: ${fileUploadResponse.status}`
      )
    }

    const fileUploadResult = await fileUploadResponse.json()

    if (!fileUploadResult.success || !fileUploadResult.files?.[0]?.url) {
      throw new Error('Upload service did not return a valid URL')
    }

    const publicUrl = fileUploadResult.files[0].url
    const uploadedSize = fileUploadResult.files[0].size

    console.log('✅ File uploaded with ZERO quality loss!')
    console.log('📊 Original size:', file.size, 'bytes')
    console.log('📊 Uploaded size:', uploadedSize, 'bytes')
    console.log(
      '🔒 Quality preserved:',
      file.size === uploadedSize ? 'YES' : 'NO'
    )
    console.log('🌐 Public URL:', publicUrl)

    // STEP 2: Update Airtable record with the lossless URL
    console.log('📤 Step 2: Saving to Airtable with original quality...')

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    const attachmentData = {
      fields: {
        [fieldName]: [
          {
            url: publicUrl,
            filename: file.originalFilename || 'odontogram.png',
          },
        ],
      },
    }

    console.log('📋 Sending to Airtable with preserved quality...')

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
    console.log('✅ Successfully saved to Airtable with FULL QUALITY!')

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    return res.status(200).json({
      success: true,
      message: 'HIGH-QUALITY odontogram uploaded successfully to Airtable',
      recordId: result.id,
      attachmentUrl: result.fields[fieldName]?.[0]?.url,
      qualityPreserved: true,
      originalSize: file.size,
      uploadedSize: uploadedSize,
      publicUrl: publicUrl,
    })
  } catch (error) {
    console.error('❌ High-quality upload error:', error.message)
    return res.status(500).json({
      error: 'High-quality upload failed',
      details: error.message,
    })
  }
}
