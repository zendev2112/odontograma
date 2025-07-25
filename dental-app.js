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

function updateOdontogramData(geometry) {
  currentGeometry = geometry
  const dataElement = document.getElementById('odontogramData')

  if (!geometry || Object.keys(geometry).length === 0) {
    dataElement.innerHTML = '<p>No hay datos de tratamiento registrados</p>'
    return
  }

  const treatmentsByLayer = { pre: 0, req: 0, condiciones: 0 }
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

      const toothInfo = getToothInfo(toothNum)

      if (toothNum) {
        const toothName = toothInfo ? toothInfo.nombre : `Diente ${toothNum}`
        html += `<div class="tooth-data-group">`
        html += `<h4>Pieza: ${toothNum} - ${toothName}</h4>`

        // Filter treatments for conditions only
        const conditionTreatments = treatments.filter((treatment) => {
          const treatmentCode = treatment.name
          const wholeTooth = ['PRE', 'MIS', 'NVT', 'UNE']
          const withSides = ['CARIES', 'CARIES_UNTREATABLE', 'REF']
          return (
            wholeTooth.includes(treatmentCode) ||
            withSides.includes(treatmentCode)
          )
        })

        if (conditionTreatments.length > 0) {
          html += `<div class="conditions-section">`
          html += `<h5>Condiciones:</h5>`

          conditionTreatments.forEach((treatment) => {
            const treatmentName = getTreatmentName(treatment.name)
            const withSides = ['CARIES', 'CARIES_UNTREATABLE', 'REF']
            let sideLabel = ''

            if (withSides.includes(treatment.name) && treatment.pos && treatment.pos.includes('-') && toothInfo && toothInfo.mapeo_canvas) {
              // Extract surface code (canvas position)
              const surfaceCode = treatment.pos.split('-')[1]
              // Map canvas code to anatomical name using mapeo_canvas
              const anatomical = toothInfo.mapeo_canvas[surfaceCode]
              // If not found, fallback to code
              sideLabel = anatomical ? ` ${anatomical}` : ` ${surfaceCode}`
            }

            totalTreatments++

            // Determine layer and styling
            let layerBadge = ''
            let layerClass = ''

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
              layerBadge = `<span class="layer-badge condiciones">CON</span>`
              layerClass = 'condiciones'
              treatmentsByLayer.condiciones++
            }

            html += `
    <div class="treatment-item ${layerClass}">
      <div class="treatment-details">
        <span class="treatment-name">${treatmentName}${sideLabel} ${layerBadge}</span>
      </div>
    </div>
  `
          })

          html += `</div>`
        }

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
  summaryHtml += `<span class="layer-count condiciones">Condiciones: ${treatmentsByLayer.condiciones}</span>`
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
 * Initialize the entire application
 */
async function initApp() {
  console.log('Starting app initialization...')

  await loadDentalData()
  initializeOdontogram(currentOdontogramType)
  updateTeethRangeDisplay(currentOdontogramType)
  updateLayerUI()

  console.log('App initialization completed')
}

// Update setupEventHandlers function to include delete functionality
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
