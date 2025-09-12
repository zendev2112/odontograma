import { IncomingForm } from 'formidable'
import Airtable from 'airtable'
import fs from 'fs'

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  // Set CORS headers
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
    if (!process.env.AIRTABLE_API_KEY) {
      console.error('❌ AIRTABLE_API_KEY not found')
      return res.status(500).json({ error: 'AIRTABLE_API_KEY not configured' })
    }

    if (!process.env.AIRTABLE_BASE_ID) {
      console.error('❌ AIRTABLE_BASE_ID not found')
      return res.status(500).json({ error: 'AIRTABLE_BASE_ID not configured' })
    }

    console.log('✅ Environment variables found')

    // Parse form data
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
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
    console.log('✅ Form parsed successfully')

    // Extract data
    const recordId = fields.recordId?.[0] || fields.recordId
    const fieldName = fields.fieldName?.[0] || fields.fieldName
    const file = files.file?.[0] || files.file

    console.log('📝 Extracted data:')
    console.log('- Record ID:', recordId)
    console.log('- Field name:', fieldName)
    console.log('- File:', file ? 'Present' : 'Missing')

    if (!recordId || !fieldName || !file) {
      return res.status(400).json({
        error: 'Missing required fields',
        received: {
          recordId: !!recordId,
          fieldName: !!fieldName,
          file: !!file,
        },
      })
    }

    // Verify we're uploading to the correct field
    if (fieldName !== 'odontograma-adjunto') {
      console.warn('⚠️ Field name is not odontograma-adjunto:', fieldName)
    }

    // Read file and convert to base64
    console.log('📖 Reading file...')
    const fileBuffer = fs.readFileSync(file.filepath)
    console.log('✅ File read, buffer size:', fileBuffer.length)

    // Convert to base64 - REQUIRED by Airtable API
    const base64String = fileBuffer.toString('base64')
    console.log('✅ Converted to base64, length:', base64String.length)

    // Configure Airtable
    console.log('🔧 Configuring Airtable...')
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID)

    // Create attachment object in correct Airtable format
    const attachmentObject = {
      filename: file.originalFilename || 'odontogram.png',
      content: base64String, // Note: 'content' not 'contents'
    }

    console.log('📤 Uploading to Airtable...')
    console.log('- Record ID:', recordId)
    console.log('- Field name:', fieldName)
    console.log('- Filename:', attachmentObject.filename)
    console.log('- Content type: base64 string')
    console.log('- Content length:', base64String.length)

    // Update the 'odontograma-adjunto' field with the attachment
    const updateData = {
      [fieldName]: [attachmentObject],
    }

    console.log(
      '📋 Update data structure:',
      JSON.stringify(updateData, null, 2)
    )

    // Update Airtable record
    const updatedRecord = await base('Pacientes').update(recordId, updateData)

    console.log('✅ Upload successful to odontograma-adjunto field!')
    console.log('✅ Updated record ID:', updatedRecord.id)

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up temp file:', cleanupError.message)
    }

    // Return success with attachment URL
    const attachmentUrl = updatedRecord.fields[fieldName]?.[0]?.url

    return res.status(200).json({
      success: true,
      message: 'Odontogram uploaded successfully to odontograma-adjunto field',
      recordId: updatedRecord.id,
      fieldName: fieldName,
      attachmentUrl: attachmentUrl,
      filename: attachmentObject.filename,
    })
  } catch (error) {
    console.error('❌ API Error:', error.message)
    console.error('❌ Error details:', error)
    console.error('❌ Stack:', error.stack)

    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
      type: error.constructor.name,
    })
  }
}
