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

  console.log('🚀 Upload API called')

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

    console.log('📝 Processing file:', file.originalFilename)

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(file.filepath)
    const base64Content = fileBuffer.toString('base64')

    console.log('📤 Uploading to Airtable using REST API...')

    // Use Airtable REST API directly with proper attachment format
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    const attachmentData = {
      fields: {
        [fieldName]: [
          {
            filename: file.originalFilename || 'odontogram.png',
            contents: base64Content,
          },
        ],
      },
    }

    console.log('📋 Sending request to:', airtableUrl)
    console.log('📋 Field name:', fieldName)
    console.log('📋 Filename:', file.originalFilename)

    const response = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachmentData),
    })

    const responseText = await response.text()
    console.log('📨 Response status:', response.status)
    console.log('📨 Response text:', responseText)

    if (!response.ok) {
      throw new Error(
        `Airtable API error: ${response.status} - ${responseText}`
      )
    }

    const result = JSON.parse(responseText)
    console.log('✅ Upload successful!')

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    return res.status(200).json({
      success: true,
      message: 'Odontogram uploaded successfully',
      recordId: result.id,
      attachmentUrl: result.fields[fieldName]?.[0]?.url,
    })
  } catch (error) {
    console.error('❌ Upload error:', error.message)
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    })
  }
}
