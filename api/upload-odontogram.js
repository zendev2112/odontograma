import formidable from 'formidable'
import Airtable from 'airtable'
import fs from 'fs'

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID)

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📤 Processing odontogram upload...')

    // Parse the multipart form data
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      filter: ({ mimetype }) => mimetype && mimetype.includes('image/png'),
    })

    const [fields, files] = await form.parse(req)

    const recordId = Array.isArray(fields.recordId)
      ? fields.recordId[0]
      : fields.recordId
    const fieldName = Array.isArray(fields.fieldName)
      ? fields.fieldName[0]
      : fields.fieldName
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    if (!recordId || !fieldName || !uploadedFile) {
      return res.status(400).json({
        error: 'Missing required fields: recordId, fieldName, or file',
      })
    }

    console.log('Upload details:')
    console.log('- Record ID:', recordId)
    console.log('- Field name:', fieldName)
    console.log('- File:', uploadedFile.originalFilename)
    console.log('- Size:', uploadedFile.size, 'bytes')

    // Read the file
    const fileBuffer = fs.readFileSync(uploadedFile.filepath)

    // Create attachment object for Airtable
    const attachment = {
      filename: uploadedFile.originalFilename,
      contents: fileBuffer,
    }

    // Update the Airtable record with the attachment
    const updatedRecord = await base('Pacientes').update(recordId, {
      [fieldName]: [attachment],
    })

    console.log('✅ File uploaded to Airtable successfully')

    // Clean up temporary file
    fs.unlinkSync(uploadedFile.filepath)

    res.status(200).json({
      success: true,
      message: 'Odontogram uploaded successfully',
      recordId: updatedRecord.id,
      attachmentUrl: updatedRecord.fields[fieldName]?.[0]?.url,
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    res.status(500).json({
      error: 'Failed to upload odontogram',
      details: error.message,
    })
  }
}
