/**
 * Dental Odontogram Application
 * Main application logic for the dental charting system
 */

// Global variables
let currentOdontogramType = 'adult'
let dentalData = null
let currentGeometry = {}
let currentAnnotationLayer = 'pre'

// NOTE: LAYER_COLORS and PATHOLOGY_TREATMENTS are already declared in jquery.odontogram.js
// Don't redeclare them here to avoid "already declared" error

/**
 * Load dental data from JSON file
 */
async function loadDentalData() {
  try {
    const response = await fetch('./dientes_fdi_completo.json')
    dentalData = await response.json()
    console.log('Dental data loaded successfully')
  } catch (error) {
    console.error('Error loading dental data:', error)
  }
}

/**
 * Get tooth information by FDI number
 */
function getToothInfo(fdi) {
  if (!dentalData || !dentalData.dientes) return null
  return dentalData.dientes.find((tooth) => tooth.fdi === fdi)
}

/**
 * Display tooth information in the info panel
 */
function displayToothInfo(fdi) {
  const toothInfo = getToothInfo(fdi)
  const infoElement = document.getElementById('toothInfo')

  if (toothInfo) {
    const surfaceNames = {
      vestibular: 'Vestibular',
      palatina: 'Palatina/Lingual',
      mesial: 'Mesial',
      distal: 'Distal',
      incisal: 'Incisal',
      oclusal: 'Oclusal',
    }

    const surfaces = toothInfo.caras
      .map((cara) => surfaceNames[cara] || cara)
      .join(', ')

    infoElement.innerHTML = `
            <div class="tooth-details-card">
                <h4>Diente ${toothInfo.fdi}</h4>
                <div class="tooth-detail-row">
                    <span class="label">Tipo:</span>
                    <span class="value">${toothInfo.tipo}</span>
                </div>
                <div class="tooth-detail-row">
                    <span class="label">Ubicación:</span>
                    <span class="value">${toothInfo.nombre}</span>
                </div>
                <div class="tooth-detail-row">
                    <span class="label">Arco:</span>
                    <span class="value">${toothInfo.arco} - ${toothInfo.lado}</span>
                </div>
                <div class="tooth-detail-row">
                    <span class="label">Caras:</span>
                    <span class="value">${surfaces}</span>
                </div>
            </div>
        `
  } else {
    infoElement.innerHTML = `
            <div class="tooth-details-card">
                <h4>Diente ${fdi}</h4>
                <p>Información no disponible para este diente</p>
            </div>
        `
  }
}

/**
 * Get treatment name from code
 */
function getTreatmentName(code) {
  const treatments = {
    CARIES: 'Caries Curable',
    CFR: 'Extracción',
    AMF: 'Obturación Amalgama',
    COF: 'Obturación Acrílico/Composite',
    POC: 'Corona',
    INC: 'Incrustación',
    FMC: 'Prótesis Removible',
    IPX: 'Implante',
    NVT: 'Surco Profundo',
    UNE: 'Pieza No Erupcionada',
    RCT: 'Tratamiento de Conducto',
    CARIES_UNTREATABLE: 'Caries Incurable',
    MIS: 'Diente Ausente',
    SIL: 'Obturación Silicato',
    PRE: 'Paradentosis',
    FRM_ACR: 'Pivot',
    BRIDGE: 'Puente',
    ORT: 'Ortodoncia',
    RES: 'Restauración',
    REF: 'Restauración Filtrada',
  }
  return treatments[code] || code
}

/**
 * Get treatment icon
 */
function getTreatmentIcon(code) {
  const icons = {
    CARIES: '●',
    CARIES_UNTREATABLE: '●',
    CFR: '=',
    AMF: '/A',
    COF: '/Ac',
    SIL: '/S',
    POC: '○',
    INC: 'I',
    FMC: '□',
    IPX: 'IM',
    NVT: '∇',
    UNE: 'NER',
    RCT: '▼',
    MIS: 'X',
    PRE: 'Pd',
    FRM_ACR: 'P',
    BRIDGE: 'Π',
    ORT: '~',
    RES: 'Δ',
    REF: '/Rf',
  }
  return icons[code] || '•'
}

/**
 * Get layer information for display
 */
function getLayerInfo(layer) {
  const layerInfo = {
    pre: { name: 'Pre-existente', color: '#FF0000', badge: 'PRE' },
    req: { name: 'Requerido', color: '#0066FF', badge: 'REQ' },
  }
  return (
    layerInfo[layer] || { name: 'Desconocido', color: '#000', badge: '???' }
  )
}

// Update initializeOdontogram to always start clean
function initializeOdontogram(type) {
    console.log('🦷 Initializing odontogram with type:', type);
    
    // Verify jQuery and plugin are available
    if (typeof $ === 'undefined') {
        console.error('❌ jQuery is not loaded');
        return;
    }
    
    if (typeof $.fn.odontogram === 'undefined') {
        console.error('❌ Odontogram plugin is not loaded');
        return;
    }
    
    // Check if canvas element exists
    const $canvas = $("#odontogram");
    if ($canvas.length === 0) {
        console.error('❌ Canvas element #odontogram not found');
        return;
    }
    
    // Clear existing odontogram instance
    $canvas.off('mousemove click').removeData('odontogram');

    // Configure odontogram options following dental standards
    const options = {
        width: "900px",
        height: "450px",
        toothType: type === 'children' ? 'primary' : 'permanent'
    };

    console.log('🔧 Odontogram options:', options);

    try {
        // Initialize the odontogram using jQuery plugin
        $canvas.odontogram('init', options);
        
        // ALWAYS START CLEAN - no default treatments
        $canvas.odontogram('clearAll');
        $canvas.odontogram('setMode', ODONTOGRAM_MODE_DEFAULT);
        
        // Reset all UI state
        $(".controls-panel button").removeClass("active");
        currentGeometry = {};
        updateOdontogramData({});
        
        console.log('✅ Odontogram initialized successfully - CLEAN START');
        
    } catch (error) {
        console.error('❌ Error initializing odontogram:', error);
    }
}

/**
 * Update teeth range display
 */
function updateTeethRangeDisplay(type) {
  const teethRangeElement = document.getElementById('teethRange')
  if (type === 'children') {
    teethRangeElement.textContent =
      '55-51, 61-65, 85-81, 71-75 (Dentición Temporal)'
  } else {
    teethRangeElement.textContent =
      '18-11, 21-28, 48-41, 31-38 (Dentición Permanente)'
  }
}

/**
 * Update layer toggle UI and description
 */
function updateLayerUI() {
  const descriptionElement = document.getElementById('layer-description-text')
  if (currentAnnotationLayer === 'pre') {
    descriptionElement.innerHTML =
      'Nuevas anotaciones se marcarán como <strong>pre-existentes</strong> en rojo'
  } else {
    descriptionElement.innerHTML =
      'Nuevas anotaciones se marcarán como <strong>requeridas</strong> en azul'
  }
}

/**
 * Update odontogram data display with layer information
 */
function updateOdontogramData(geometry) {
  currentGeometry = geometry
  const dataElement = document.getElementById('odontogramData')

  if (!geometry || Object.keys(geometry).length === 0) {
    dataElement.innerHTML = '<p>No hay datos de tratamiento registrados</p>'
    return
  }

  const treatmentsByLayer = { pre: 0, req: 0, pathology: 0 }
  let totalTreatments = 0

  let html = '<div class="odontogram-data-summary">'

  for (const [key, treatments] of Object.entries(geometry)) {
    if (treatments && treatments.length > 0) {
      const instance = $('#odontogram').data('odontogram')
      let toothNum = null

      for (const [teethKey, teethData] of Object.entries(instance.teeth)) {
        if (teethKey === key) {
          toothNum = teethData.num
          break
        }
      }

      if (toothNum) {
        html += `<div class="tooth-data-group">`
        html += `<h4>🦷 Diente ${toothNum}</h4>`

        treatments.forEach((treatment) => {
          const treatmentName = getTreatmentName(treatment.name)
          const icon = getTreatmentIcon(treatment.name)
          let location = 'Diente completo'

          if (treatment.pos && treatment.pos.includes('-')) {
            const surface = treatment.pos.split('-')[1]
            location = `Superficie ${surface}`
          }

          totalTreatments++

          // Determine layer and styling
          let layerBadge = ''
          let layerClass = ''

          // Use the global shouldUseLayerColor function from jquery.odontogram.js
          if (
            typeof shouldUseLayerColor !== 'undefined' &&
            shouldUseLayerColor(treatment.name)
          ) {
            const layer = treatment.layer || 'pre'
            const layerInfo = getLayerInfo(layer)
            layerBadge = `<span class="layer-badge" style="background-color: ${layerInfo.color}">${layerInfo.badge}</span>`
            layerClass = `layer-${layer}`
            treatmentsByLayer[layer]++
          } else {
            layerBadge = `<span class="layer-badge pathology">PAT</span>`
            layerClass = 'pathology'
            treatmentsByLayer.pathology++
          }

          html += `
                        <div class="treatment-item ${layerClass}">
                            <span class="treatment-icon">${icon}</span>
                            <div class="treatment-details">
                                <span class="treatment-name">${treatmentName} ${layerBadge}</span>
                                <span class="treatment-location">${location}</span>
                            </div>
                        </div>
                    `
        })

        html += `</div>`
      }
    }
  }

  // Add enhanced summary with layer breakdown
  let summaryHtml = `<div class="data-summary">`
  summaryHtml += `<h4>📊 Resumen de Tratamientos (${totalTreatments} total)</h4>`

  // Layer summary
  summaryHtml += `<div class="layer-summary">`
  summaryHtml += `<span class="layer-count pre">Pre-existentes: ${treatmentsByLayer.pre}</span>`
  summaryHtml += `<span class="layer-count req">Requeridos: ${treatmentsByLayer.req}</span>`
  summaryHtml += `<span class="layer-count pathology">Patologías: ${treatmentsByLayer.pathology}</span>`
  summaryHtml += `</div>`
  summaryHtml += `</div>`

  html = summaryHtml + html + '</div>'
  dataElement.innerHTML = html
}

/**
 * Export odontogram data with layer information
 */
function exportOdontogramData() {
  const now = new Date()
  const data = {
    metadatos: {
      fecha_creacion: now.toISOString().split('T')[0],
      hora_creacion: now.toTimeString().split(' ')[0],
      tipo_denticion:
        currentOdontogramType === 'children' ? 'temporal' : 'permanente',
      version_aplicacion: '2.1',
      capa_activa: currentAnnotationLayer,
      total_tratamientos: 0,
    },
    resumen_por_capa: { pre: 0, req: 0, pathology: 0 },
    tratamientos: currentGeometry,
  }

  // Count treatments by layer
  let totalTreatments = 0
  const layerCount = { pre: 0, req: 0, pathology: 0 }

  for (const [key, treatments] of Object.entries(currentGeometry)) {
    if (treatments && treatments.length > 0) {
      treatments.forEach((treatment) => {
        totalTreatments++
        // Use the global shouldUseLayerColor function from jquery.odontogram.js
        if (
          typeof shouldUseLayerColor !== 'undefined' &&
          shouldUseLayerColor(treatment.name)
        ) {
          const layer = treatment.layer || 'pre'
          layerCount[layer]++
        } else {
          layerCount.pathology++
        }
      })
    }
  }

  data.metadatos.total_tratamientos = totalTreatments
  data.resumen_por_capa = layerCount

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `odontograma_capas_${data.metadatos.fecha_creacion}.json`
  a.click()
  URL.revokeObjectURL(url)

  console.log('Layered odontogram data exported:', data)
}

/**
 * Generate and print patient dental report
 */
function generatePatientReport() {
  const reportData = {
    paciente: {
      nombre: "PACIENTE - [A obtener de Airtable]", // Placeholder for Airtable data
      fecha: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    piezas: [],
    resumen: {
      total_piezas_afectadas: 0,
      condiciones_encontradas: {}
    }
  }

  // Process current odontogram geometry
  const odontogramInstance = $('#odontogram').data('odontogram')
  if (odontogramInstance && odontogramInstance.geometry) {
    currentGeometry = odontogramInstance.geometry
  }

  // Extract relevant conditions based on your specifications
  const relevantConditions = ['PRE', 'MIS', 'NVT', 'UNE', 'CARIES', 'CARIES_UNTREATABLE']

  for (const [toothKey, treatments] of Object.entries(currentGeometry)) {
    if (treatments && treatments.length > 0) {
      const toothNumber = parseInt(toothKey.split('-')[0])
      const toothInfo = getToothInfoByFDI(toothNumber)
      
      if (toothInfo) {
        const piezaData = {
          fdi: toothInfo.fdi,
          nombre: toothInfo.nombre,
          condiciones: []
        }

        // Filter treatments for relevant conditions only
        treatments.forEach(treatment => {
          const treatmentCode = treatment.name || treatment.mode || 'UNKNOWN'
          
          if (relevantConditions.includes(treatmentCode)) {
            const conditionName = getTreatmentName(treatmentCode)
            piezaData.condiciones.push({
              codigo: treatmentCode,
              nombre: conditionName,
              superficie: getSurfaceFromTreatment(treatment, toothInfo)
            })

            // Update summary
            if (!reportData.resumen.condiciones_encontradas[treatmentCode]) {
              reportData.resumen.condiciones_encontradas[treatmentCode] = 0
            }
            reportData.resumen.condiciones_encontradas[treatmentCode]++
          }
        })

        // Only include teeth with relevant conditions
        if (piezaData.condiciones.length > 0) {
          reportData.piezas.push(piezaData)
          reportData.resumen.total_piezas_afectadas++
        }
      }
    }
  }

  // Generate and print the report
  printDentalReport(reportData)
  
  return reportData
}

/**
 * Get tooth information by FDI number
 */
function getToothInfoByFDI(fdiNumber) {
  if (!dentalData.dientes) return null
  return dentalData.dientes.find(tooth => tooth.fdi === fdiNumber)
}

/**
 * Get surface information from treatment
 */
function getSurfaceFromTreatment(treatment, toothInfo) {
  if (treatment.pos && treatment.pos.includes('-')) {
    const [toothNum, surfaceCode] = treatment.pos.split('-')
    const anatomicalSurface = getAnatomicalSurface(surfaceCode, toothInfo)
    return {
      codigo: surfaceCode,
      anatomica: anatomicalSurface
    }
  }
  return {
    codigo: 'whole',
    anatomica: 'Diente completo'
  }
}

/**
 * Print the dental report
 */
function printDentalReport(reportData) {
  // Create print window
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  const reportHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Dental - ${reportData.paciente.nombre}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                color: #333;
                line-height: 1.6;
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .header h1 {
                color: #2c3e50;
                margin: 0 0 10px 0;
                font-size: 28px;
            }
            
            .patient-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 5px solid #3498db;
            }
            
            .patient-info h2 {
                color: #2c3e50;
                margin: 0 0 15px 0;
                font-size: 20px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 16px;
            }
            
            .info-label {
                font-weight: 600;
                color: #555;
                min-width: 120px;
            }
            
            .info-value {
                color: #2c3e50;
                font-weight: 500;
            }
            
            .summary {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 5px solid #3498db;
            }
            
            .summary h3 {
                color: #2c3e50;
                margin: 0 0 15px 0;
                font-size: 18px;
            }
            
            .condition-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .condition-item {
                background: white;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid #ddd;
                text-align: center;
            }
            
            .condition-count {
                font-size: 24px;
                font-weight: bold;
                color: #e74c3c;
                display: block;
            }
            
            .condition-name {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                margin-top: 5px;
            }
            
            .teeth-details {
                margin-top: 25px;
            }
            
            .teeth-details h3 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
                margin-bottom: 20px;
                font-size: 18px;
            }
            
            .tooth-card {
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .tooth-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .tooth-fdi {
                font-size: 24px;
                font-weight: bold;
                color: #3498db;
                background: #f8f9fa;
                padding: 5px 15px;
                border-radius: 20px;
                border: 2px solid #3498db;
            }
            
            .tooth-name {
                font-size: 16px;
                color: #2c3e50;
                font-weight: 600;
                flex: 1;
                text-align: right;
            }
            
            .conditions-list {
                margin-top: 10px;
            }
            
            .conditions-title {
                font-weight: 600;
                color: #555;
                margin-bottom: 10px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .condition {
                background: #fff5f5;
                border: 1px solid #fed7d7;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .condition-info {
                flex: 1;
            }
            
            .condition-code {
                font-family: 'Courier New', monospace;
                background: #e74c3c;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-right: 10px;
            }
            
            .condition-description {
                color: #2c3e50;
                font-weight: 500;
            }
            
            .surface-info {
                color: #666;
                font-size: 12px;
                background: #f8f9fa;
                padding: 2px 6px;
                border-radius: 3px;
                border: 1px solid #ddd;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
            }
            
            @media print {
                body { margin: 0; padding: 15px; }
                .tooth-card { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📋 Reporte Dental Odontograma</h1>
            <p>Sistema de Diagnóstico Dental Profesional</p>
        </div>

        <div class="patient-info">
            <h2>👤 Información del Paciente</h2>
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${reportData.paciente.nombre}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha del Reporte:</span>
                <span class="info-value">${reportData.paciente.fecha}</span>
            </div>
        </div>

        <div class="summary">
            <h3>📊 Resumen Ejecutivo</h3>
            <div class="info-row">
                <span class="info-label">Total de Piezas Afectadas:</span>
                <span class="info-value">${reportData.resumen.total_piezas_afectadas}</span>
            </div>
            
            <div class="condition-summary">
                ${Object.entries(reportData.resumen.condiciones_encontradas)
                  .map(([code, count]) => `
                    <div class="condition-item">
                        <span class="condition-count">${count}</span>
                        <div class="condition-name">${getTreatmentName(code)}</div>
                    </div>
                  `).join('')}
            </div>
        </div>

        <div class="teeth-details">
            <h3>🦷 Detalle por Pieza Dental</h3>
            
            ${reportData.piezas.length === 0 ? 
              '<p style="text-align: center; color: #666; font-style: italic; padding: 40px;">No se encontraron condiciones relevantes en el odontograma.</p>' :
              reportData.piezas.map(pieza => `
                <div class="tooth-card">
                    <div class="tooth-header">
                        <div class="tooth-fdi">${pieza.fdi}</div>
                        <div class="tooth-name">${pieza.nombre}</div>
                    </div>
                    
                    <div class="conditions-list">
                        <div class="conditions-title">Condiciones Encontradas:</div>
                        ${pieza.condiciones.map(condicion => `
                            <div class="condition">
                                <div class="condition-info">
                                    <span class="condition-code">${condicion.codigo}</span>
                                    <span class="condition-description">${condicion.nombre}</span>
                                </div>
                                <div class="surface-info">${condicion.superficie.anatomica}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
              `).join('')}
        </div>

        <div class="footer">
            <p>Reporte generado el ${new Date().toLocaleString('es-ES')} | Sistema de Odontograma Dental</p>
            <p>Basado en Sistema FDI de Numeración Dental Internacional</p>
        </div>
        
        <script>
            // Auto-print when window loads
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>
  `

  printWindow.document.write(reportHTML)
  printWindow.document.close()
}

/**
 * Export patient report as JSON
 */
function exportPatientReport() {
  const reportData = generatePatientReport()
  
  // Create and download JSON file
  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_dental_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ...existing code...

// Update setupEventHandlers to include print functionality
function setupEventHandlers() {
    console.log('🔧 Setting up dental event handlers...');

    // Layer toggle handlers for dual-layer system
    $('input[name="annotation-layer"]').on('change', function() {
        currentAnnotationLayer = $(this).val();
        if (typeof CURRENT_ANNOTATION_LAYER !== 'undefined') {
            CURRENT_ANNOTATION_LAYER = currentAnnotationLayer;
        }
        updateLayerUI();
        console.log('🔄 Annotation layer switched to:', currentAnnotationLayer);
    });

    // Handle dentition type change
    $('#odontogramType').on('change', function () {
        const selectedType = $(this).val();
        if (selectedType !== currentOdontogramType) {
            currentOdontogramType = selectedType;
            initializeOdontogram(selectedType);
            updateTeethRangeDisplay(selectedType);
            console.log('🔄 Switched to ' + (selectedType === 'children' ? 'Primary' : 'Permanent') + ' dentition');
        }
    });

    // Handle geometry changes from odontogram
    $('#odontogram').on('change', function (_, geometry) {
        updateOdontogramData(geometry);
        console.log('📊 Geometry updated. Total treatments:', 
                   Object.values(geometry).reduce((sum, treatments) => sum + (treatments?.length || 0), 0));
    });

    // Control button active state management
    $(".controls-panel button").click(function () {
        $(".controls-panel button").removeClass("active");
        $(this).addClass("active");
        const buttonText = $(this).find('.name').text() || $(this).text();
        console.log('🎯 Treatment mode selected:', buttonText);
    });

    // Mode button handlers for all dental treatments
    $("[id^='ODONTOGRAM_MODE_']").click(function () {
        var modeName = $(this).attr('id');
        var modeValue = window[modeName];
        if (typeof modeValue !== 'undefined') {
            $("#odontogram").odontogram('setMode', modeValue);
            console.log('🔧 Mode set to:', modeName, 'Value:', modeValue);
        } else {
            console.warn('⚠️ Mode not found:', modeName);
        }
    });

    // Delete button (HAPUS) - enhanced with confirmation
    $("#ODONTOGRAM_MODE_HAPUS").click(function () {
        $(this).addClass("active");
        $("#odontogram").odontogram('setMode', ODONTOGRAM_MODE_HAPUS);
        console.log('🗑️ Delete mode activated - click on teeth to remove treatments');
    });

    // Clear all button (DEFAULT) - with confirmation dialog
    $("#ODONTOGRAM_MODE_DEFAULT").click(function () {
        const treatmentCount = Object.values(currentGeometry)
            .reduce((sum, treatments) => sum + (treatments?.length || 0), 0);
        
        if (treatmentCount > 0) {
            const confirmClear = confirm(
                `⚠️ ¿Está seguro que desea borrar todos los tratamientos?\n\n` +
                `Se eliminarán ${treatmentCount} tratamientos.\n\n` +
                `Esta acción no se puede deshacer.`
            );
            
            if (confirmClear) {
                $("#odontogram").odontogram('clearAll');
                $("#odontogram").odontogram('setMode', ODONTOGRAM_MODE_DEFAULT);
                $(".controls-panel button").removeClass("active");
                currentGeometry = {};
                updateOdontogramData({});
                
                console.log('🧹 All treatments cleared by user confirmation');
                alert('✅ Todos los tratamientos han sido eliminados exitosamente.');
            } else {
                console.log('❌ Clear all operation cancelled by user');
            }
        } else {
            $("#odontogram").odontogram('setMode', ODONTOGRAM_MODE_DEFAULT);
            $(".controls-panel button").removeClass("active");
            console.log('📋 Default mode activated - odontogram already clean');
        }
    });

    // Download odontogram image
    $("#download").click(function () {
        const dentitionType = currentOdontogramType === 'children' ? 'temporal' : 'permanente';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const link = document.createElement('a');
        link.download = `odontograma_${dentitionType}_${timestamp}.png`;
        link.href = $("#odontogram").odontogram('getDataURL');
        link.click();
        console.log('📷 Odontogram image downloaded:', link.download);
    });

    // Export dental data button
    $("#exportData").click(function() {
        const treatmentCount = Object.values(currentGeometry)
            .reduce((sum, treatments) => sum + (treatments?.length || 0), 0);
        
        if (treatmentCount === 0) {
            alert('No hay tratamientos registrados para exportar.');
            return;
        }
        
        exportOdontogramData();
        alert(`Datos con capas exportados exitosamente. ${treatmentCount} tratamientos incluidos.`);
    });

    // Add print report handler
    $('#printReport').on('click', function() {
      generatePatientReport()
    })

    // Add export report handler  
    $('#exportReport').on('click', function() {
      exportPatientReport()
    })

    console.log('✅ Dental event handlers setup completed');
}

/**
 * Initialize app when document is ready
 */
$(document).ready(function () {
  console.log('DOM ready, initializing dual-layer dental application...')
  initApp()
  setupEventHandlers()
})
