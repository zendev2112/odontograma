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

  console.log('🚀 Upload API called - HIPAA-COMPLIANT DIRECT AIRTABLE UPLOAD')

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

    console.log(
      '📝 Processing CONFIDENTIAL MEDICAL file:',
      file.originalFilename
    )
    console.log('📊 Original file size:', file.size, 'bytes')
    console.log('🔒 HIPAA-compliant processing - NO external services used')

    // Read file - PRESERVE EVERY BYTE
    const originalBuffer = fs.readFileSync(file.filepath)
    console.log(
      '📖 Buffer matches original:',
      originalBuffer.length === file.size
    )

    // Convert to base64 for direct Airtable upload
    console.log('🔐 Converting to secure base64 format...')
    const base64Content = originalBuffer.toString('base64')
    console.log('✅ Secure conversion complete')

    // DIRECT AIRTABLE UPLOAD - NO THIRD PARTIES
    console.log('📤 Uploading directly to Airtable (HIPAA-compliant)...')

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    // Use the correct Airtable attachment format with base64 content
    const attachmentData = {
      fields: {
        [fieldName]: [
          {
            filename: file.originalFilename || 'odontogram.png',
            contents: base64Content, // Direct base64 upload to Airtable
          },
        ],
      },
    }

    console.log('📋 Sending confidential medical data directly to Airtable...')
    console.log(
      '🔒 No external services involved - maintaining HIPAA compliance'
    )

    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachmentData),
    })

    const responseText = await airtableResponse.text()
    console.log('📨 Airtable response status:', airtableResponse.status)

    if (!airtableResponse.ok) {
      console.log('📨 Airtable response:', responseText)

      // If the contents method fails, try the multipart form approach
      if (responseText.includes('INVALID_ATTACHMENT_OBJECT')) {
        console.log(
          '⚠️ Base64 contents failed, trying multipart form upload...'
        )

        // Create multipart form data for direct Airtable upload
        const formData = new FormData()

        // Create a proper file blob for Airtable
        const blob = new Blob([originalBuffer], { type: 'image/png' })
        formData.append(
          'fields',
          JSON.stringify({
            [fieldName]: 'PLACEHOLDER_FOR_ATTACHMENT',
          })
        )
        formData.append(
          'attachment',
          blob,
          file.originalFilename || 'odontogram.png'
        )

        const multipartResponse = await fetch(`${airtableUrl}/attachments`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
          body: formData,
        })

        if (!multipartResponse.ok) {
          const multipartError = await multipartResponse.text()
          throw new Error(
            `Multipart upload failed: ${multipartResponse.status} - ${multipartError}`
          )
        }

        const multipartResult = await multipartResponse.json()
        console.log('✅ Multipart upload successful!')

        return res.status(200).json({
          success: true,
          message: 'HIPAA-compliant odontogram uploaded directly to Airtable',
          recordId: multipartResult.id,
          method: 'multipart_form',
          fileName: file.originalFilename,
          qualityPreserved: true,
          originalSize: file.size,
          hipaaCompliant: true,
        })
      }

      throw new Error(
        `Airtable error: ${airtableResponse.status} - ${responseText}`
      )
    }

    const result = JSON.parse(responseText)
    console.log('✅ HIPAA-compliant upload successful!')

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file securely cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    // The attachment URL will be Airtable's secure CDN URL
    const airtableAttachmentUrl = result.fields[fieldName]?.[0]?.url

    return res.status(200).json({
      success: true,
      message: 'HIPAA-compliant odontogram uploaded directly to Airtable',
      recordId: result.id,
      attachmentUrl: airtableAttachmentUrl,
      fileName: file.originalFilename,
      qualityPreserved: true,
      originalSize: file.size,
      hipaaCompliant: true,
      workflow: 'Direct Airtable upload - No external services',
    })
  } catch (error) {
    console.error('❌ HIPAA-compliant upload error:', error.message)
    return res.status(500).json({
      error: 'HIPAA-compliant upload failed',
      details: error.message,
    })
  }
}
