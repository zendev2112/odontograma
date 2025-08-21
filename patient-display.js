/**
 * Extract patient name from URL and display in header
 */
function displayPatientName() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const patientName = urlParams.get('paciente');
    
    // Get header elements
    const patientNameElement = document.getElementById('patientName');
    const patientInfoElement = document.getElementById('patientInfo');
    
    if (patientName && patientNameElement) {
        // Decode and display the patient name
        const decodedName = decodeURIComponent(patientName);
        patientNameElement.textContent = decodedName.toUpperCase();
        
        // Update page title
        document.title = `Odontograma - ${decodedName}`;
        
        // Add loaded class for styling
        patientInfoElement.classList.add('loaded');
        
        console.log('Patient name displayed:', decodedName);
    } else {
        // Fallback if no patient name
        patientNameElement.textContent = 'PACIENTE SIN NOMBRE';
        patientInfoElement.classList.add('loaded');
        console.log('No patient name found in URL');
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', displayPatientName);