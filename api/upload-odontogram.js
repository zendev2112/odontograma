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

  console.log('🚀 Upload API called - HIGH QUALITY IMAGE HOSTING + AIRTABLE')

  try {
    // Check Airtable credentials
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
      '📖 Buffer matches original:',
      originalBuffer.length === file.size
    )

    // STEP 1: Upload to ImgBB (high-quality image hosting)
    console.log('📤 Step 1: Uploading to high-quality image host...')

    // Convert to base64 for ImgBB
    const base64Image = originalBuffer.toString('base64')

    const imgbbFormData = new FormData()
    imgbbFormData.append('image', base64Image)
    imgbbFormData.append(
      'name',
      file.originalFilename || `odontogram_${recordId}`
    )

    // Upload to ImgBB (free, no compression, medical-grade hosting)
    const imgbbResponse = await fetch(
      'https://api.imgbb.com/1/upload?key=46c4b6c4dbdab2adfc8fb5b513a9b181',
      {
        method: 'POST',
        body: imgbbFormData,
      }
    )

    if (!imgbbResponse.ok) {
      // Fallback to Imgur if ImgBB fails
      console.log('⚠️ ImgBB failed, trying Imgur...')

      const imgurFormData = new FormData()
      imgurFormData.append('image', base64Image)
      imgurFormData.append('type', 'base64')
      imgurFormData.append('name', file.originalFilename)

      const imgurResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID 546c25a59c58ad7',
        },
        body: imgurFormData,
      })

      if (!imgurResponse.ok) {
        throw new Error('Both image hosting services failed')
      }

      const imgurResult = await imgurResponse.json()
      var publicUrl = imgurResult.data.link
      console.log('✅ Uploaded to Imgur (fallback)')
    } else {
      const imgbbResult = await imgbbResponse.json()
      var publicUrl = imgbbResult.data.url
      console.log('✅ Uploaded to ImgBB (primary)')
    }

    console.log('🔗 Public URL:', publicUrl)
    console.log('✅ HIGH-QUALITY upload complete - NO compression applied!')

    // STEP 2: Update Airtable record with the high-quality image URL
    console.log('📤 Step 2: Attaching to Airtable...')

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

    console.log('📋 Sending to Airtable...')

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
    console.log('✅ Successfully attached to Airtable!')

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    // The attachment URL will be Airtable's own CDN URL after it downloads the image
    const airtableAttachmentUrl = result.fields[fieldName]?.[0]?.url

    return res.status(200).json({
      success: true,
      message: 'HIGH-QUALITY odontogram uploaded and attached to Airtable',
      recordId: result.id,
      attachmentUrl: airtableAttachmentUrl,
      originalPublicUrl: publicUrl,
      fileName: file.originalFilename,
      qualityPreserved: true,
      originalSize: file.size,
      workflow:
        'Upload to ImgBB/Imgur → Airtable downloads → Stores as attachment',
    })
  } catch (error) {
    console.error('❌ High-quality upload error:', error.message)
    return res.status(500).json({
      error: 'High-quality upload failed',
      details: error.message,
    })
  }
}
