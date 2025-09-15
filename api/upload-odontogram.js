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

  console.log('🚀 Upload API called - CLOUDINARY + AIRTABLE + FORMATTED TEXT')

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

    // NEW: Get JSON data and field name
    const jsonData = fields.jsonData?.[0] || fields.jsonData
    const jsonFieldName =
      fields.jsonFieldName?.[0] ||
      fields.jsonFieldName ||
      'notas-odontograma-paciente'

    if (!recordId || !fieldName || !file) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log('📝 Processing file:', file.originalFilename)
    console.log('📊 Original file size:', file.size, 'bytes')
    console.log('📋 JSON data included:', jsonData ? 'YES' : 'NO')
    console.log('📋 JSON field name:', jsonFieldName)

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

    // STEP 2: Get existing record data from Airtable (for both attachments and notes)
    console.log('📋 Getting existing data from Airtable...')

    const getRecordUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    const getResponse = await fetch(getRecordUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    })

    let existingAttachments = []
    let existingNotes = ''

    if (getResponse.ok) {
      const currentRecord = await getResponse.json()
      existingAttachments = currentRecord.fields[fieldName] || []
      existingNotes = currentRecord.fields[jsonFieldName] || ''
      console.log('📋 Found existing attachments:', existingAttachments.length)
      console.log('📋 Found existing notes length:', existingNotes.length)
    } else {
      console.warn(
        '⚠️ Could not fetch existing data, proceeding with new data only'
      )
    }

    // STEP 3: Append new attachment to existing ones
    const newAttachment = {
      url: uploadResult.secure_url,
      filename: file.originalFilename || 'odontogram.png',
    }

    const allAttachments = [...existingAttachments, newAttachment]
    console.log('📋 Total attachments after upload:', allAttachments.length)

    // STEP 4: Format JSON data exactly like PNG text format
    let finalNotesText = existingNotes

    if (jsonData && jsonFieldName) {
      console.log('📋 Formatting JSON data for text field...')

      // Parse the JSON data to format it properly
      const parsedData = JSON.parse(jsonData)

      // Create a timestamp header for the new entry
      const now = new Date()
      const timestamp = now.toLocaleString('es-ES')

      // Format the text exactly like the PNG
      let formattedText = `\n\n=============================\nODONTOGRAMA GENERADO: ${timestamp}\n=============================\n\n`

      // Header information
      formattedText += `PACIENTE: ${parsedData.nombre}\n`
      formattedText += `FECHA: ${parsedData.fecha}\n\n`

      if (parsedData.piezas && parsedData.piezas.length > 0) {
        formattedText += `TRATAMIENTOS Y OBSERVACIONES:\n\n`

        parsedData.piezas.forEach((pieza) => {
          formattedText += `PIEZA ${pieza.pieza}:\n`

          // Condiciones (existing conditions)
          if (pieza.condiciones && pieza.condiciones.length > 0) {
            formattedText += `  • Condiciones:\n`
            pieza.condiciones.forEach((condicion) => {
              formattedText += `    - ${condicion}\n`
            })
          }

          // Prestaciones Preexistentes
          if (
            pieza.prestacion_preexistente &&
            pieza.prestacion_preexistente.length > 0
          ) {
            formattedText += `  • Prestaciones Preexistentes:\n`
            pieza.prestacion_preexistente.forEach((prestacion) => {
              formattedText += `    - ${prestacion}\n`
            })
          }

          // Prestaciones Requeridas
          if (
            pieza.prestacion_requerida &&
            pieza.prestacion_requerida.length > 0
          ) {
            formattedText += `  • Prestaciones Requeridas:\n`
            pieza.prestacion_requerida.forEach((prestacion) => {
              formattedText += `    - ${prestacion}\n`
            })
          }

          // Notas específicas
          if (pieza.notas && pieza.notas.trim() !== '') {
            formattedText += `  • Notas: ${pieza.notas}\n`
          }

          formattedText += `\n` // Space between teeth
        })
      } else {
        formattedText += `Sin hallazgos registrados.\n\n`
      }

      // Append to existing notes
      finalNotesText = finalNotesText + formattedText

      console.log('📋 Text formatted for appending')
    }

    // STEP 5: Update Airtable with all data (IMAGE + FORMATTED TEXT)
    console.log('📤 Updating Airtable with all data...')

    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`

    // Build fields object
    const updateFields = {
      [fieldName]: allAttachments, // Image attachments
    }

    // ADD FORMATTED TEXT TO TEXT FIELD
    if (jsonData && jsonFieldName) {
      updateFields[jsonFieldName] = finalNotesText
      console.log('📋 Adding formatted text data to field:', jsonFieldName)
    }

    const attachmentData = {
      fields: updateFields,
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
    console.log('✅ Success! All data updated in Airtable')
    console.log('📷 Image uploaded and appended')
    console.log('📋 Formatted text appended to existing notes')

    // Clean up
    try {
      fs.unlinkSync(file.filepath)
      console.log('🧹 Temp file cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean temp file:', cleanupError.message)
    }

    return res.status(200).json({
      success: true,
      message: `Complete odontogram data uploaded! Image + formatted text appended.`,
      recordId: result.id,
      attachmentUrl: result.fields[fieldName]?.[0]?.url,
      cloudinaryUrl: uploadResult.secure_url,
      fileName: file.originalFilename,
      service: 'Cloudinary FREE',
      totalAttachments: allAttachments.length,
      jsonAppended: jsonData ? true : false,
      jsonFieldName: jsonFieldName,
    })
  } catch (error) {
    console.error('❌ Upload error:', error.message)
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    })
  }
}
