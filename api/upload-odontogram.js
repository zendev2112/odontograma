import { IncomingForm } from 'formidable'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

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

  console.log('🚀 Upload API called - CLOUDINARY FREE + AIRTABLE WITH APPEND')

  try {
    // Check credentials
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return res
        .status(500)
        .json({ error: 'Airtable credentials not configured' })
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res
        .status(500)
        .json({ error: 'Cloudinary credentials not configured' })
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

    console.log('📝 Processing file:', file.originalFilename)
    console.log('📊 Original file size:', file.size, 'bytes')

    // Read file
    const originalBuffer = fs.readFileSync(file.filepath)
    console.log('📖 File read successfully')

    // STEP 1: Upload to Cloudinary
    console.log('📤 Uploading to Cloudinary FREE...')

    const uploadOptions = {
      resource_type: 'image',
      format: 'png',
      quality: 'auto:best',
      public_id: `odontograms/${recordId}_${Date.now()}`,
      folder: 'odontograms',
      context: {
        patient_record: recordId,
        upload_date: new Date().toISOString(),
        original_name: file.originalFilename,
      },
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      uploadStream.end(originalBuffer)
    })

    console.log('✅ Uploaded to Cloudinary!')
    console.log('📁 Public ID:', uploadResult.public_id)
    console.log('🔗 Secure URL:', uploadResult.secure_url)

    // STEP 2: Get existing attachments from Airtable
    console.log('📋 Getting existing attachments from Airtable...')

    const getRecordUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    const getResponse = await fetch(getRecordUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    })

    let existingAttachments = []
    if (getResponse.ok) {
      const currentRecord = await getResponse.json()
      existingAttachments = currentRecord.fields[fieldName] || []
      console.log('📋 Found existing attachments:', existingAttachments.length)
    } else {
      console.warn(
        '⚠️ Could not fetch existing attachments, proceeding with new upload only'
      )
    }

    // STEP 3: Append new attachment to existing ones
    const newAttachment = {
      url: uploadResult.secure_url,
      filename: file.originalFilename || 'odontogram.png',
    }

    const allAttachments = [...existingAttachments, newAttachment]
    console.log('📋 Total attachments after upload:', allAttachments.length)

    // STEP 4: Update Airtable with ALL attachments (existing + new)
    console.log('📤 Updating Airtable with all attachments...')

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    const attachmentData = {
      fields: {
        [fieldName]: allAttachments,
      },
    }

    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachmentData),
    })

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text()
      throw new Error(
        `Airtable error: ${airtableResponse.status} - ${errorText}`
      )
    }

    const result = await airtableResponse.json()
    console.log('✅ Success! All attachments updated in Airtable')

    // Clean up
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    return res.status(200).json({
      success: true,
      message: `Odontogram uploaded successfully! Total: ${allAttachments.length}`,
      recordId: result.id,
      attachmentUrl: result.fields[fieldName]?.[0]?.url,
      cloudinaryUrl: uploadResult.secure_url,
      fileName: file.originalFilename,
      service: 'Cloudinary FREE',
      totalAttachments: allAttachments.length,
    })
  } catch (error) {
    console.error('❌ Upload error:', error.message)
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    })
  }
}
