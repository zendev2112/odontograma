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

// Global variable for storing notes
let toothNotes = {}

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

  // Ensure FDI is treated as number for proper matching
  const fdiNumber = parseInt(fdi)
  return dentalData.dientes.find((tooth) => tooth.fdi === fdiNumber)
}

function displayToothInfo(fdi) {
  const toothInfo = getToothInfo(fdi)
  const infoElement = document.getElementById('toothInfo')

  if (toothInfo) {
    const surfaceNames = {
      vestibular: 'Vestibular',
      palatina: 'Palatina',
      lingual: 'Lingual',
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
 * Save note for specific tooth
 */
function saveToothNote(toothNum, noteText) {
  toothNotes[toothNum] = noteText
  
  // Visual feedback for save
  const noteElement = $(`#notes-${toothNum}`)
  noteElement.addClass('note-saved')
  
  setTimeout(() => {
    noteElement.removeClass('note-saved')
  }, 1000)
  
  console.log(`📝 Note saved for tooth ${toothNum}:`, noteText)
}

/**
 * Load note for specific tooth
 */
function loadToothNote(toothNum) {
  return toothNotes[toothNum] || ''
}

/**
 * Enhanced updateOdontogramData with proper note loading
 */
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

      // Extract FDI number from odontogram teeth data
      for (const [teethKey, teethData] of Object.entries(instance.teeth)) {
        if (teethKey === key) {
          toothNum = teethData.num
          break
        }
      }

      if (toothNum) {
        // Link to JSON data using FDI code
        const toothInfo = getToothInfo(toothNum)

        // Use the "nombre" property from JSON as specified
        const toothName = toothInfo ? toothInfo.nombre : `Diente ${toothNum}`

        html += `<div class="tooth-data-group">`
        html += `<h4>Pieza: ${toothNum} - ${toothName}</h4>`

        // Remove notes from here - will add below after all treatment sections

        // Group treatments by type and collect surfaces
        function groupTreatmentsBySurface(treatmentList) {
          const grouped = {}
          
          treatmentList.forEach((treatment) => {
            const treatmentName = getTreatmentName(treatment.name)
            const withSides = ['CARIES', 'CARIES_UNTREATABLE', 'REF', 'SIL', 'RES', 'AMF', 'COF', 'INC']
            
            if (!grouped[treatment.name]) {
              grouped[treatment.name] = {
                name: treatmentName,
                surfaces: [],
                layer: treatment.layer || 'pre',
                usesSides: withSides.includes(treatment.name)
              }
            }

            // Only collect surface info for treatments that use sides
            if (withSides.includes(treatment.name) && treatment.pos && toothInfo) {
              let surfaceCode = null

              // Handle different position formats from the odontogram plugin
              if (treatment.pos.includes('-')) {
                const parts = treatment.pos.split('-')
                surfaceCode = parts[1]
              } else if (typeof treatment.pos === 'string' && treatment.pos.length <= 2) {
                surfaceCode = treatment.pos
              }

              // Map single letter codes to full canvas position names
              const canvasPositionMap = {
                T: 'top', B: 'bottom', L: 'left', R: 'right', M: 'middle',
                top: 'top', bottom: 'bottom', left: 'left', right: 'right', middle: 'middle',
              }

              const fullCanvasPosition = canvasPositionMap[surfaceCode]

              // USE CORRECTED SURFACE MAPPING BASED ON FDI RULES
              if (fullCanvasPosition) {
                const correctMapping = getCorrectSurfaceMapping(toothNum)
                const anatomical = correctMapping[fullCanvasPosition]
                
                if (anatomical && !grouped[treatment.name].surfaces.includes(anatomical)) {
                  grouped[treatment.name].surfaces.push(anatomical)
                }
              }
            }

            totalTreatments++
          })

          return grouped
        }

        // Filter treatments for conditions only
        const conditionTreatments = treatments.filter((treatment) => {
          const treatmentCode = treatment.name
          const wholeTooth = ['PRE', 'MIS', 'NVT', 'UNE']
          const withSides = ['CARIES', 'CARIES_UNTREATABLE', 'REF']
          return wholeTooth.includes(treatmentCode) || withSides.includes(treatmentCode)
        })

        if (conditionTreatments.length > 0) {
          html += `<div class="conditions-section">`
          html += `<h5>Condiciones:</h5>`

          const groupedConditions = groupTreatmentsBySurface(conditionTreatments)

          Object.values(groupedConditions).forEach((condition) => {
            let surfaceDisplay = ''
            if (condition.usesSides && condition.surfaces.length > 0) {
              surfaceDisplay = ` - Cara/s: ${condition.surfaces.join(', ')}`
            }

            // Count for layer stats
            if (typeof shouldUseLayerColor !== 'undefined' && shouldUseLayerColor(Object.keys(groupedConditions).find(key => groupedConditions[key] === condition))) {
              treatmentsByLayer[condition.layer]++
            } else {
              treatmentsByLayer.condiciones++
            }

            html += `
              <div class="treatment-item">
                <div class="treatment-details">
                  <span class="treatment-name">${condition.name}${surfaceDisplay}</span>
                </div>
              </div>
            `
          })

          html += `</div>`
        }

        // Add Prestaciones sections
        const prestacionTreatments = treatments.filter((treatment) => {
          const treatmentCode = treatment.name
          const wholeTooth = ['CFR', 'FRM_ACR', 'BRIDGE', 'ORT', 'POC', 'FMC', 'IPX','RCT']
          const withSides = ['SIL', 'RES', 'AMF', 'COF', 'INC']
          return wholeTooth.includes(treatmentCode) || withSides.includes(treatmentCode)
        })

        if (prestacionTreatments.length > 0) {
          // Separate by layer
          const preExistentes = prestacionTreatments.filter(t => t.layer === 'pre')
          const requeridas = prestacionTreatments.filter(t => t.layer === 'req' || !t.layer)

          // Prestaciones Preexistentes (red)
          if (preExistentes.length > 0) {
            html += `<div class="prestaciones-section pre-existentes">`
            html += `<h5 style="color: #FF0000;">Prestaciones Preexistentes:</h5>`

            const groupedPreExistentes = groupTreatmentsBySurface(preExistentes)

            Object.values(groupedPreExistentes).forEach((prestacion) => {
              let surfaceDisplay = ''
              if (prestacion.usesSides && prestacion.surfaces.length > 0) {
                surfaceDisplay = ` - Cara/s: ${prestacion.surfaces.join(', ')}`
              }

              treatmentsByLayer.pre++

              html += `
                <div class="treatment-item pre-existente">
                  <div class="treatment-details">
                    <span class="treatment-name" style="color: #FF0000;">${prestacion.name}${surfaceDisplay}</span>
                  </div>
                </div>
              `
            })

            html += `</div>`
          }

          // Prestaciones Requeridas (blue)
          if (requeridas.length > 0) {
            html += `<div class="prestaciones-section requeridas">`
            html += `<h5 style="color: #0066FF;">Prestaciones Requeridas:</h5>`

            const groupedRequeridas = groupTreatmentsBySurface(requeridas)

            Object.values(groupedRequeridas).forEach((prestacion) => {
              let surfaceDisplay = ''
              if (prestacion.usesSides && prestacion.surfaces.length > 0) {
                surfaceDisplay = ` - Cara/s: ${prestacion.surfaces.join(', ')}`
              }

              treatmentsByLayer.req++

              html += `
                <div class="treatment-item requerida">
                  <div class="treatment-details">
                    <span class="treatment-name" style="color: #0066FF;">${prestacion.name}${surfaceDisplay}</span>
                  </div>
                </div>
              `
            })

            html += `</div>`
          }
        }

        // ADD NOTES SECTION AT THE END - BELOW ALL TOOTH DATA
        const existingNote = loadToothNote(toothNum)
        html += `
          <div class="tooth-notes-section">
            <div class="notes-header">
              <label for="notes-${toothNum}">Notas:</label>
              <div class="notes-controls">
                <button type="button" class="save-note-btn" data-tooth="${toothNum}" title="Guardar nota">
                  💾
                </button>
                <button type="button" class="clear-note-btn" data-tooth="${toothNum}" title="Limpiar nota">
                  🗑️
                </button>
              </div>
            </div>
            <textarea 
              id="notes-${toothNum}" 
              class="tooth-notes" 
              placeholder="Agregar notas clínicas para diente ${toothNum}..."
              rows="3"
              data-tooth="${toothNum}">${existingNote}</textarea>
            <div class="note-status" id="status-${toothNum}"></div>
          </div>
        `

        html += `</div>` // Close tooth-data-group
      }
    }
  }

  // ADD THE MISSING SUMMARY HTML GENERATION
  let summaryHtml = `<div class="data-summary">`
  summaryHtml += `<h4>📊 Resumen de Tratamientos (${totalTreatments} total)</h4>`

  // Layer summary following dental standards
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
  const instance = $('#odontogram').data('odontogram')
  
  // Comprehensive dental data export following odontogram standards
  const exportData = {
    metadatos: {
      fecha_creacion: now.toISOString().split('T')[0],
      hora_creacion: now.toTimeString().split(' ')[0],
      tipo_denticion: currentOdontogramType === 'children' ? 'temporal' : 'permanente',
      version_aplicacion: '2.1',
      sistema_numeracion: 'FDI',
      capa_activa: currentAnnotationLayer,
      total_tratamientos: 0,
      total_dientes_afectados: 0,
      exportado_por: 'Sistema Odontograma Dental'
    },
    
    // Patient information (placeholder for future Airtable integration)
    paciente: {
      nombre: 'PACIENTE - [A obtener de Airtable]',
      fecha_examen: now.toISOString().split('T')[0],
      denticion: currentOdontogramType === 'children' ? 'Temporal' : 'Permanente'
    },
    
    // Layer-based treatment summary
    resumen_por_capa: { pre: 0, req: 0, condiciones: 0 },
    
    // Detailed treatment data
    tratamientos: currentGeometry,
    
    // Clinical notes per tooth
    notas_clinicas: toothNotes,
    
    // Detailed breakdown by dental categories
    analisis_dental: {
      condiciones: {},
      prestaciones_preexistentes: {},
      prestaciones_requeridas: {},
      dientes_con_notas: Object.keys(toothNotes).length
    },
    
    // FDI tooth mapping for reference
    mapa_fdi: {},
    
    // Export statistics
    estadisticas: {
      total_tratamientos_por_tipo: {},
      total_superficies_afectadas: 0,
      distribucion_por_cuadrante: {
        cuadrante_1: 0, // 18-11
        cuadrante_2: 0, // 21-28  
        cuadrante_3: 0, // 31-38
        cuadrante_4: 0  // 41-48
      }
    }
  }

  // Count treatments by layer and analyze dental data
  let totalTreatments = 0
  let affectedTeeth = 0
  const layerCount = { pre: 0, req: 0, condiciones: 0 }
  const treatmentTypeCount = {}

  for (const [key, treatments] of Object.entries(currentGeometry)) {
    if (treatments && treatments.length > 0) {
      affectedTeeth++
      
      // Get tooth number for FDI mapping
      let toothNum = null
      if (instance && instance.teeth) {
        for (const [teethKey, teethData] of Object.entries(instance.teeth)) {
          if (teethKey === key) {
            toothNum = teethData.num
            break
          }
        }
      }
      
      // Add to FDI mapping
      if (toothNum) {
        const toothInfo = getToothInfo(toothNum)
        exportData.mapa_fdi[toothNum] = {
          posicion_canvas: key,
          informacion_dental: toothInfo || { fdi: toothNum, nombre: `Diente ${toothNum}` }
        }
        
        // Count by quadrant for statistics
        const fdiNum = parseInt(toothNum)
        if (fdiNum >= 11 && fdiNum <= 18) exportData.estadisticas.distribucion_por_cuadrante.cuadrante_1++
        else if (fdiNum >= 21 && fdiNum <= 28) exportData.estadisticas.distribucion_por_cuadrante.cuadrante_2++
        else if (fdiNum >= 31 && fdiNum <= 38) exportData.estadisticas.distribucion_por_cuadrante.cuadrante_3++
        else if (fdiNum >= 41 && fdiNum <= 48) exportData.estadisticas.distribucion_por_cuadrante.cuadrante_4++
      }

      treatments.forEach((treatment) => {
        totalTreatments++
        
        // Count by treatment type
        const treatmentCode = treatment.name
        treatmentTypeCount[treatmentCode] = (treatmentTypeCount[treatmentCode] || 0) + 1
        
        // Count surfaces
        if (treatment.pos && treatment.pos.includes('-')) {
          exportData.estadisticas.total_superficies_afectadas++
        }
        
        // Categorize treatments following dental standards
        const condiciones = ['PRE', 'MIS', 'NVT', 'UNE', 'CARIES', 'CARIES_UNTREATABLE', 'REF']
        const prestacionesSurface = ['SIL', 'RES', 'AMF', 'COF', 'INC']
        const prestacionesWhole = ['CFR', 'FRM_ACR', 'BRIDGE', 'ORT', 'POC', 'FMC', 'IPX', 'RCT']
        
        if (condiciones.includes(treatmentCode)) {
          exportData.analisis_dental.condiciones[treatmentCode] = 
            (exportData.analisis_dental.condiciones[treatmentCode] || 0) + 1
          layerCount.condiciones++
        } else if (prestacionesSurface.includes(treatmentCode) || prestacionesWhole.includes(treatmentCode)) {
          if (treatment.layer === 'pre') {
            exportData.analisis_dental.prestaciones_preexistentes[treatmentCode] = 
              (exportData.analisis_dental.prestaciones_preexistentes[treatmentCode] || 0) + 1
            layerCount.pre++
          } else {
            exportData.analisis_dental.prestaciones_requeridas[treatmentCode] = 
              (exportData.analisis_dental.prestaciones_requeridas[treatmentCode] || 0) + 1
            layerCount.req++
          }
        }
        
        // Use the global shouldUseLayerColor function from jquery.odontogram.js
        if (typeof shouldUseLayerColor !== 'undefined' && shouldUseLayerColor(treatment.name)) {
          const layer = treatment.layer || 'pre'
          layerCount[layer] = layerCount[layer] || 0
          layerCount[layer]++
        }
      })
    }
  }

  // Update metadata with calculated values
  exportData.metadatos.total_tratamientos = totalTreatments
  exportData.metadatos.total_dientes_afectados = affectedTeeth
  exportData.resumen_por_capa = layerCount
  exportData.estadisticas.total_tratamientos_por_tipo = treatmentTypeCount

  // Create and download JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `odontograma_completo_${exportData.metadatos.fecha_creacion}_${exportData.metadatos.hora_creacion.replace(/:/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)

  console.log('📋 Complete dental data exported:', exportData)
  return exportData
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

    // Enhanced notes handling with save functionality
    $(document).on('input', '.tooth-notes', function() {
        const toothNum = $(this).data('tooth')
        const noteText = $(this).val()
        
        // Auto-save after 2 seconds of no typing
        clearTimeout($(this).data('saveTimeout'))
        const saveTimeout = setTimeout(() => {
            saveToothNote(toothNum, noteText)
            $(`#status-${toothNum}`).text('✅ Guardado automáticamente').addClass('auto-saved')
            setTimeout(() => {
                $(`#status-${toothNum}`).removeClass('auto-saved').text('')
            }, 2000)
        }, 2000)
        
        $(this).data('saveTimeout', saveTimeout)
        $(`#status-${toothNum}`).text('✏️ Editando...').removeClass('auto-saved')
    })

    // Manual save button for notes
    $(document).on('click', '.save-note-btn', function() {
        const toothNum = $(this).data('tooth')
        const noteText = $(`#notes-${toothNum}`).val()
        
        saveToothNote(toothNum, noteText)
        $(`#status-${toothNum}`).text('💾 Nota guardada manualmente').addClass('manual-saved')
        
        setTimeout(() => {
            $(`#status-${toothNum}`).removeClass('manual-saved').text('')
        }, 3000)
    })

    // Clear note button
    $(document).on('click', '.clear-note-btn', function() {
        const toothNum = $(this).data('tooth')
        
        if (confirm(`¿Está seguro que desea eliminar la nota del diente ${toothNum}?`)) {
            $(`#notes-${toothNum}`).val('')
            delete toothNotes[toothNum]
            $(`#status-${toothNum}`).text('🗑️ Nota eliminada').addClass('note-deleted')
            
            setTimeout(() => {
                $(`#status-${toothNum}`).removeClass('note-deleted').text('')
            }, 2000)
            
            console.log(`🗑️ Note cleared for tooth ${toothNum}`)
        }
    })

    // Enhanced export dental data button
    $("#exportData").click(function() {
        const treatmentCount = Object.values(currentGeometry)
            .reduce((sum, treatments) => sum + (treatments?.length || 0), 0);
        const notesCount = Object.keys(toothNotes).length;
        
        if (treatmentCount === 0 && notesCount === 0) {
            alert('❌ No hay tratamientos ni notas registradas para exportar.');
            return;
        }
        
        try {
            const exportedData = exportOdontogramData();
            alert(`✅ Datos exportados exitosamente!`);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('❌ Error al exportar los datos. Verifique la consola para más detalles.');
        }
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

/**
 * Get correct surface mapping based on FDI quadrant rules
 * Following international dental standards for surface orientation
 */
function getCorrectSurfaceMapping(fdi) {
  const fdiNumber = parseInt(fdi)
  
  // Determine if upper or lower tooth for vestibular/lingual mapping
  const isUpperTooth = (fdiNumber >= 11 && fdiNumber <= 18) || 
                       (fdiNumber >= 21 && fdiNumber <= 28) ||
                       (fdiNumber >= 51 && fdiNumber <= 55) ||
                       (fdiNumber >= 61 && fdiNumber <= 65)
  
  const isLowerTooth = (fdiNumber >= 31 && fdiNumber <= 38) || 
                       (fdiNumber >= 41 && fdiNumber <= 48) ||
                       (fdiNumber >= 71 && fdiNumber <= 75) ||
                       (fdiNumber >= 81 && fdiNumber <= 85)
  
  // Base mapping for upper/lower according to dental anatomy
  const baseMapping = {
    top: isUpperTooth ? 'vestibular' : 'lingual',
    bottom: isUpperTooth ? 'palatina' : 'vestibular',
    middle: 'oclusal' // Will be adjusted for incisors/canines
  }
  
  // Determine mesial/distal based on FDI quadrant rules
  // Following dental coding instructions for surface orientation
  let mesialSide, distalSide
  
  if (
    // Adult teeth: 11-18 and 41-48 (right quadrants)
    (fdiNumber >= 11 && fdiNumber <= 18) ||
    (fdiNumber >= 41 && fdiNumber <= 48) ||
    // Primary teeth: 55-51 and 85-81 (right quadrants)  
    (fdiNumber >= 51 && fdiNumber <= 55) ||
    (fdiNumber >= 81 && fdiNumber <= 85)
  ) {
    // RIGHT QUADRANTS: mesial = right, distal = left
    mesialSide = 'right'
    distalSide = 'left'
  } else if (
    // Adult teeth: 21-28 and 31-38 (left quadrants)
    (fdiNumber >= 21 && fdiNumber <= 28) ||
    (fdiNumber >= 31 && fdiNumber <= 38) ||
    // Primary teeth: 61-65 and 71-75 (left quadrants)
    (fdiNumber >= 61 && fdiNumber <= 65) ||
    (fdiNumber >= 71 && fdiNumber <= 75)
  ) {
    // LEFT QUADRANTS: mesial = left, distal = right
    mesialSide = 'left'
    distalSide = 'right'
  }
  
  // Assign mesial/distal to correct sides
  if (mesialSide && distalSide) {
    baseMapping[mesialSide] = 'mesial'
    baseMapping[distalSide] = 'distal'
  }
  
  // Adjust middle surface for incisors and canines (incisal instead of oclusal)
  const toothInfo = getToothInfo(fdiNumber)
  if (toothInfo && (toothInfo.tipo.includes('incisivo') || toothInfo.tipo.includes('canino'))) {
    baseMapping.middle = 'incisal'
  }
  
  return baseMapping
}
