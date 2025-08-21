/**
 * Vercel serverless function to fetch patient data from Airtable
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get record ID from query parameters
  const { recordId } = req.query

  if (!recordId) {
    return res.status(400).json({ error: 'recordId is required' })
  }

  try {
    // Validate environment variables
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('Missing Airtable environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Fetch patient data from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Pacientes/${recordId}`
    
    console.log('Fetching patient data for record:', recordId)

    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText)
      return res.status(response.status).json({ 
        error: 'Failed to fetch patient data',
        details: `Airtable API returned ${response.status}`
      })
    }

    const patientData = await response.json()
    
    // Extract patient name from the response
    const patientName = patientData.fields['Nombre Completo']
    
    if (!patientName) {
      return res.status(404).json({ error: 'Patient name not found in record' })
    }

    console.log('Successfully fetched patient:', patientName)

    // Return patient information
    res.status(200).json({
      success: true,
      patient: {
        name: patientName,
        recordId: recordId
      }
    })

  } catch (error) {
    console.error('Error fetching patient data:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}