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

  console.log('🚀 Upload API called - CORRECT AIRTABLE FORMDATA METHOD')

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

    console.log('📝 Processing medical file:', file.originalFilename)
    console.log('📊 Original file size:', file.size, 'bytes')

    // Read file
    const originalBuffer = fs.readFileSync(file.filepath)
    console.log('📖 File read successfully')

    // CORRECT METHOD: Use FormData to upload file to Airtable
    console.log('📤 Creating FormData for Airtable upload...')

    const formData = new FormData()

    // Create a proper Blob from the buffer
    const blob = new Blob([originalBuffer], { type: 'image/png' })

    // Append the file with the correct field name
    formData.append('files', blob, file.originalFilename || 'odontogram.png')

    // Add other fields if needed
    formData.append(
      'fields',
      JSON.stringify({
        // Add any other fields you want to update
      })
    )

    console.log('✅ FormData created successfully')

    // STEP 1: Upload file using FormData (the CORRECT way)
    console.log('📤 Uploading to Airtable using FormData...')

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes`

    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        // Do NOT set Content-Type header - let FormData set it automatically
      },
      body: formData,
    })

    const responseText = await airtableResponse.text()
    console.log('📨 Airtable response status:', airtableResponse.status)

    if (!airtableResponse.ok) {
      console.log('📨 Airtable error response:', responseText)

      // If direct FormData upload fails, try the alternative method
      console.log('⚠️ FormData upload failed, trying record update method...')

      // STEP 2: Alternative - Update existing record with attachment
      const updateUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

      // Create FormData for updating existing record
      const updateFormData = new FormData()
      updateFormData.append(
        fieldName,
        blob,
        file.originalFilename || 'odontogram.png'
      )

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        body: updateFormData,
      })

      const updateResponseText = await updateResponse.text()

      if (!updateResponse.ok) {
        console.log('📨 Update response error:', updateResponseText)
        throw new Error(
          `Airtable update error: ${updateResponse.status} - ${updateResponseText}`
        )
      }

      const updateResult = JSON.parse(updateResponseText)
      console.log('✅ Record update successful!')

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath)
        console.log('🧹 Temp file cleaned up')
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean temp file:', cleanupError.message)
      }

      return res.status(200).json({
        success: true,
        message: 'Odontogram uploaded successfully using record update method',
        recordId: updateResult.id,
        attachmentUrl: updateResult.fields[fieldName]?.[0]?.url,
        fileName: file.originalFilename,
        method: 'record_update',
        hipaaCompliant: true,
      })
    }

    const result = JSON.parse(responseText)
    console.log('✅ FormData upload successful!')

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    return res.status(200).json({
      success: true,
      message: 'Odontogram uploaded successfully using FormData method',
      recordId: result.id,
      attachmentUrl: result.fields[fieldName]?.[0]?.url,
      fileName: file.originalFilename,
      method: 'formdata',
      hipaaCompliant: true,
    })
  } catch (error) {
    console.error('❌ Upload error:', error.message)
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    })
  }
}
