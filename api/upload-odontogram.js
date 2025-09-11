import formidable from 'formidable'
import Airtable from 'airtable'
import fs from 'fs'

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  // Set JSON response headers
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📤 Starting odontogram upload process...')

    // Check environment variables first
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('❌ Missing Airtable environment variables')
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Airtable credentials not configured',
      })
    }

    // Configure Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID)

    console.log('✅ Airtable configured successfully')

    // Parse the multipart form data with better error handling
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
      filter: function ({ mimetype }) {
        console.log('File mimetype:', mimetype)
        return (
          mimetype &&
          (mimetype.includes('image/png') || mimetype.includes('image/jpeg'))
        )
      },
    })

    console.log('📋 Parsing form data...')

    let fields, files
    try {
      ;[fields, files] = await form.parse(req)
      console.log('✅ Form data parsed successfully')
      console.log('Fields:', Object.keys(fields))
      console.log('Files:', Object.keys(files))
    } catch (parseError) {
      console.error('❌ Form parsing error:', parseError)
      return res.status(400).json({
        error: 'Failed to parse form data',
        details: parseError.message,
      })
    }

    // Extract form fields
    const recordId = Array.isArray(fields.recordId)
      ? fields.recordId[0]
      : fields.recordId
    const fieldName = Array.isArray(fields.fieldName)
      ? fields.fieldName[0]
      : fields.fieldName
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    console.log('Extracted data:')
    console.log('- Record ID:', recordId)
    console.log('- Field name:', fieldName)
    console.log('- File exists:', !!uploadedFile)

    // Validate required fields
    if (!recordId) {
      return res.status(400).json({ error: 'Missing recordId' })
    }

    if (!fieldName) {
      return res.status(400).json({ error: 'Missing fieldName' })
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: 'Missing file upload' })
    }

    console.log('File details:')
    console.log('- Original filename:', uploadedFile.originalFilename)
    console.log('- Size:', uploadedFile.size, 'bytes')
    console.log('- Mimetype:', uploadedFile.mimetype)
    console.log('- Temp path:', uploadedFile.filepath)

    // Check if file exists and is readable
    if (!fs.existsSync(uploadedFile.filepath)) {
      return res.status(400).json({ error: 'Uploaded file not found' })
    }

    // Read the file
    let fileBuffer
    try {
      fileBuffer = fs.readFileSync(uploadedFile.filepath)
      console.log('✅ File read successfully, buffer size:', fileBuffer.length)
    } catch (readError) {
      console.error('❌ File read error:', readError)
      return res.status(500).json({
        error: 'Failed to read uploaded file',
        details: readError.message,
      })
    }

    // Create attachment object for Airtable
    const attachment = {
      filename: uploadedFile.originalFilename || 'odontogram.png',
      contents: fileBuffer,
    }

    console.log('📤 Uploading to Airtable...')
    console.log('- Record ID:', recordId)
    console.log('- Field:', fieldName)
    console.log('- Filename:', attachment.filename)

    // Update the Airtable record with the attachment
    let updatedRecord
    try {
      updatedRecord = await base('Pacientes').update(recordId, {
        [fieldName]: [attachment],
      })
      console.log('✅ Airtable update successful')
    } catch (airtableError) {
      console.error('❌ Airtable update error:', airtableError)

      // Clean up temp file before returning error
      try {
        fs.unlinkSync(uploadedFile.filepath)
      } catch (cleanupError) {
        console.error('Warning: Failed to cleanup temp file:', cleanupError)
      }

      return res.status(500).json({
        error: 'Failed to update Airtable record',
        details: airtableError.message,
      })
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(uploadedFile.filepath)
      console.log('✅ Temp file cleaned up')
    } catch (cleanupError) {
      console.error('Warning: Failed to cleanup temp file:', cleanupError)
      // Don't fail the request for cleanup errors
    }

    // Success response
    const response = {
      success: true,
      message: 'Odontogram uploaded successfully',
      recordId: updatedRecord.id,
      attachmentUrl: updatedRecord.fields[fieldName]?.[0]?.url || null,
    }

    console.log('✅ Upload completed successfully')
    return res.status(200).json(response)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('❌ Error stack:', error.stack)

    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      type: error.constructor.name,
    })
  }
}
