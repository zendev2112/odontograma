/**
 * Fetch and display patient name from Airtable via Vercel API
 */

async function fetchAndDisplayPatientName() {
    console.log('🔍 Starting patient name fetch from Airtable...')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', window.location.search)
    
    try {
        // Get ALL URL parameters for debugging
        const urlParams = new URLSearchParams(window.location.search)
        console.log('All URL parameters:')
        for (let [key, value] of urlParams.entries()) {
            console.log(`  ${key}: ${value}`)
        }
        
        const recordId = urlParams.get('recordId') || urlParams.get('id')
        
        console.log('Record ID from URL:', recordId)
        
        if (!recordId) {
            console.warn('⚠️ No record ID found in URL parameters')
            console.log('Available parameters:', Array.from(urlParams.keys()))
            setFallbackPatientName()
            return
        }
        
        // Show loading state
        updatePatientHeader('Cargando paciente...', false)
        
        // Call our Vercel API endpoint
        const apiUrl = `/api/patient?recordId=${encodeURIComponent(recordId)}`
        console.log('Calling API:', apiUrl)
        
        const response = await fetch(apiUrl)
        console.log('API response status:', response.status)
        
        const data = await response.json()
        console.log('API response data:', data)
        
        if (response.ok && data.success) {
            console.log('✅ Successfully fetched patient data:', data.patient)
            updatePatientHeader(data.patient.name, true)
        } else {
            console.error('❌ API error:', data.error)
            console.log('Full error response:', data)
            setFallbackPatientName()
        }
        
    } catch (error) {
        console.error('❌ Error fetching patient data:', error)
        setFallbackPatientName()
    }
}

function updatePatientHeader(patientName, isLoaded) {
  console.log('🔄 Updating header with:', patientName)

  const patientNameElement = document.getElementById('patientName')
  const patientInfoElement = document.getElementById('patientInfo')

  if (patientNameElement) {
    patientNameElement.textContent = patientName.toUpperCase()

    // Store globally for access by other scripts (ADD THIS)
    window.currentPatientName = patientName.toUpperCase()
    localStorage.setItem('currentPatientName', patientName.toUpperCase())

    console.log('✅ Header updated and name stored globally')
  } else {
    console.error('❌ patientName element not found')
  }

  if (patientInfoElement && isLoaded) {
    patientInfoElement.classList.add('loaded')
    document.title = `Odontograma - ${patientName}`
    console.log('✅ Page title updated')
  }
}

function setFallbackPatientName() {
    console.log('Setting fallback patient name')
    updatePatientHeader('PACIENTE SIN NOMBRE', true)
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting patient fetch...')
    fetchAndDisplayPatientName()
})

// Also try immediate execution in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndDisplayPatientName)
} else {
    console.log('DOM already loaded, executing immediately...')
    fetchAndDisplayPatientName()
}