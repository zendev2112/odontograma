// CONSTANTA untuk MODE Odontogram
var ODONTOGRAM_MODE_HAPUS = 100; // HAPUS
var ODONTOGRAM_MODE_DEFAULT = 0; // Do Nothing
var ODONTOGRAM_MODE_AMF = 1; // Hitam = TAMBALAN AMALGAM
var ODONTOGRAM_MODE_COF = 2; // Hijau Diarsir = TAMBALAN COMPOSITE
var ODONTOGRAM_MODE_FIS = 3; // UNGU = pit dan fissure sealant
var ODONTOGRAM_MODE_NVT = 4; // SEGITIGA DIBAWAH (seperti Akar) = gigi non-vital
var ODONTOGRAM_MODE_RCT = 5; // SEGITIGA DIBAWAH (seperti Akar) filled = Perawatan Saluran Akar
var ODONTOGRAM_MODE_NON = 6; // gigi tidak ada, tidak diketahui ada atau tidak ada. (non)
var ODONTOGRAM_MODE_UNE = 7; // Un-Erupted (une)
var ODONTOGRAM_MODE_PRE = 8; // Partial-Erupt (pre) 
var ODONTOGRAM_MODE_ANO = 9; // Anomali (ano), Pegshaped, micro, fusi, etc
var ODONTOGRAM_MODE_CARIES = 10; // Caries Tratables = filled with #FFC107
var ODONTOGRAM_MODE_CARIES_UNTREATABLE = 27; // Caries Intratables = filled with red
var ODONTOGRAM_MODE_CFR = 11; // fracture (cfr) (Tanda '#' di tengah" gigi)
var ODONTOGRAM_MODE_FMC = 12; // Full metal crown pada gigi vital (fmc)
var ODONTOGRAM_MODE_POC = 13; // Porcelain crown pada gigi vital (poc)
var ODONTOGRAM_MODE_RRX = 14; // Sisa Akar (rrx)
var ODONTOGRAM_MODE_MIS = 15; // Gigi hilang (mis)
var ODONTOGRAM_MODE_IPX = 16; // Implant + Porcelain crown (ipx - poc)
var ODONTOGRAM_MODE_FRM_ACR = 17; // Partial Denture/ Full Denture
var ODONTOGRAM_MODE_BRIDGE = 18; // BRIDGE
var ODONTOGRAM_MODE_ARROW_TOP_LEFT = 19; // TOP-LEFT ARROW
var ODONTOGRAM_MODE_ARROW_TOP_RIGHT = 20; // TOP-RIGHT ARROW
var ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT = 21; // TOP-TURN-LEFT ARROW
var ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT = 22; // TOP-TURN-RIGHT ARROW
var ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT = 23; // BOTTOM-LEFT ARROW
var ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT = 24; // BOTTOM-RIGHT ARROW
var ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT = 25; // BOTTOM-TURN-LEFT ARROW
var ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT = 26; // BOTTOM-TURN-RIGHT ARROW
var ODONTOGRAM_MODE_SIL = 28; // Sellante - displays /S symbol on surface
var ODONTOGRAM_MODE_INC = 29; // Incrustación - displays I symbol on surface
var ODONTOGRAM_MODE_ORT = 30; // Ortodoncia - displays ~ symbol on top/bottom surfaces
var ODONTOGRAM_MODE_RES = 31; // Restauración - displays // symbol on surface
var ODONTOGRAM_MODE_REF = 32; // Restauración Filtrada - displays /Rf symbol on surface
var CURRENT_ANNOTATION_LAYER = 'pre'; // Default to pre-existing

// Color definitions for layers
var LAYER_COLORS = {
  pre: '#FF0000',    // Red for pre-existing
  req: '#0066FF'     // Blue for required
};

// Define which treatments ignore layer colors (pathologies)
var PATHOLOGY_TREATMENTS = [
  'RCT',                    // Root canal treatment
  'CARIES',                 // Treatable caries
  'CARIES_UNTREATABLE',     // Untreatable caries
  'MIS',                    // Missing tooth
  'PRE',                    // Periodontitis (paradentosis)
  'NVT',                    // Deep sulcus
  'UNE'                     // Unerupted tooth
];

// Helper function to determine if treatment should use layer colors
function shouldUseLayerColor(treatmentName) {
  return !PATHOLOGY_TREATMENTS.includes(treatmentName);
}

// Helper function to get color for treatment
function getColorForTreatment(treatmentName, layer) {
  if (shouldUseLayerColor(treatmentName)) {
    return LAYER_COLORS[layer] || '#000';
  }
  return '#000'; // Default color for pathologies
}



// Create closure.
(function ($) {
  // Class Polygon
  function Polygon(vertices, options) {
    this.name = 'Polygon'
    this.vertices = vertices
    this.options = options
    return this
  }
  Polygon.prototype.render = function (ctx) {
    if (this.vertices.length <= 0) return
    ctx.fillStyle = this.options.fillStyle
    ctx.beginPath()

    var vertices = this.vertices.concat([])
    var fpos = vertices.shift()
    ctx.moveTo(fpos.x, fpos.y)

    var pos
    while (vertices.length > 0) {
      pos = vertices.shift()
      if (pos) {
        ctx.lineTo(pos.x, pos.y)
      }
    }
    ctx.lineTo(fpos.x, fpos.y)
    ctx.closePath()
    ctx.fill()
  }
// Update existing shape classes to support layers
// Class AMF = Tambalan Amalgam
function AMF(vertices, options) {
  this.name = 'AMF';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('AMF', this.layer)
  }, options);
  return this;
}

AMF.prototype.render = function (ctx) {
  var xs = this.vertices.map((v) => v.x);
  var ys = this.vertices.map((v) => v.y);
  var centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
  var centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('/A', centerX, centerY);
  ctx.restore();
};

function COF(vertices, options) {
  this.name = 'COF';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('COF', this.layer)
  }, options);
  return this;
}

COF.prototype.render = function (ctx) {
  var xs = this.vertices.map((v) => v.x);
  var ys = this.vertices.map((v) => v.y);
  var centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
  var centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('/Ac', centerX, centerY);
  ctx.restore();
};

function INC(vertices, options) {
  this.name = 'INC';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('INC', this.layer)
  }, options);
  return this;
}

INC.prototype.render = function (ctx) {
  var xs = this.vertices.map((v) => v.x);
  var ys = this.vertices.map((v) => v.y);
  var centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
  var centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('I', centerX, centerY);
  ctx.restore();
};

function RES(vertices, options) {
  this.name = 'RES';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('RES', this.layer)
  }, options);
  return this;
}

RES.prototype.render = function (ctx) {
  var xs = this.vertices.map(function (v) { return v.x; });
  var ys = this.vertices.map(function (v) { return v.y; });
  var centerX = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  var centerY = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Δ', centerX, centerY);
  ctx.restore();
};

function REF(vertices, options) {
  this.name = 'REF';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('REF', this.layer)
  }, options);
  return this;
}

REF.prototype.render = function (ctx) {
  var xs = this.vertices.map(function (v) { return v.x; });
  var ys = this.vertices.map(function (v) { return v.y; });
  var centerX = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  var centerY = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('/Rf', centerX, centerY);
  ctx.restore();
};

// Update SIL class
function SIL(vertices, options) {
  this.name = 'SIL';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 16px Arial', 
    color: getColorForTreatment('SIL', this.layer)
  }, options);
  return this;
}

SIL.prototype.render = function (ctx) {
  var xs = this.vertices.map(function (v) { return v.x; });
  var ys = this.vertices.map(function (v) { return v.y; });
  var centerX = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  var centerY = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('/S', centerX, centerY);
  ctx.restore();
};

function ORT(vertices, options) {
  this.name = 'ORT';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    font: 'bold 28px Arial', 
    color: getColorForTreatment('ORT', this.layer)
  }, options);
  return this;
}

ORT.prototype.render = function (ctx) {
  var xs = this.vertices.map(function (v) { return v.x; });
  var ys = this.vertices.map(function (v) { return v.y; });
  var centerX = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  var centerY = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;

  ctx.save();
  ctx.font = this.options.font;
  ctx.fillStyle = this.options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('~', centerX, centerY);
  ctx.restore();
};

  // Class FIS = pit dan fissure sealant
  function FIS(vertices, options) {
    this.name = 'FIS'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#ed3bed' }, options)
    return this
  }
  FIS.prototype.render = function (ctx) {
    ctx.fillStyle = this.options.fillStyle
    ctx.beginPath()

    var vertices = this.vertices.concat([])
    var fpos = vertices.shift()
    ctx.moveTo(fpos.x + 1, fpos.y + 1)

    var pos
    while (vertices.length > 0) {
      pos = vertices.shift()
      if (pos) {
        ctx.lineTo(pos.x + 1, pos.y + 1)
      }
    }
    ctx.lineTo(fpos.x + 1, fpos.y + 1)
    ctx.closePath()
    ctx.fill()
  }
  // Class NVT = SEGITIGA DIBAWAH (seperti Akar) = gigi non-vital
  function NVT(vertices, options) {
    this.name = 'NVT'
    this.vertices = vertices
    this.options = $.extend({ strokeStyle: '#333', height: 25 }, options)
    return this
  }
  NVT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x) + 1
    var x2 = parseFloat(this.vertices[1].x) + 1
    var y1 = parseFloat(this.vertices[0].y) + 1
    var y2 = parseFloat(this.vertices[1].y) + 1
    var size = x2 - x1
    var height = parseFloat(this.options.height)

    ctx.strokeStyle = this.options.strokeStyle
    ctx.beginPath()
    ctx.moveTo(x1 + size / 4, y2)
    ctx.lineTo(x1 + size / 2, y2 + height)
    ctx.lineTo(x2 - size / 4, y2)
    ctx.closePath()
    ctx.stroke()
  }
  // Class RCT = SEGITIGA DIBAWAH (seperti Akar) filled = Perawatan Saluran Akar
  function RCT(vertices, options) {
    this.name = 'RCT'
    this.vertices = vertices
    this.options = $.extend(
      { strokeStyle: '#333', fillStyle: '#333', height: 25 },
      options
    )
    return this
  }
  RCT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x) + 1
    var x2 = parseFloat(this.vertices[1].x) + 1
    var y1 = parseFloat(this.vertices[0].y) + 1
    var y2 = parseFloat(this.vertices[1].y) + 1
    var size = x2 - x1
    var height = parseFloat(this.options.height)

    ctx.strokeStyle = this.options.strokeStyle
    ctx.fillStyle = this.options.fillStyle
    ctx.beginPath()
    ctx.moveTo(x1 + size / 4, y2)
    ctx.lineTo(x1 + size / 2, y2 + height)
    ctx.lineTo(x2 - size / 4, y2)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  function NON(vertices, options) {
    this.name = 'NON'
    this.vertices = vertices
    this.options = $.extend({ font: 'bold 16px Arial', color: '#000' }, options)
    return this
  }

  NON.prototype.render = function (ctx) {
    // Draw the "/S" symbol in the center of the surface - EXACTLY like AMF and COF
    var xs = this.vertices.map(function (v) {
      return v.x
    })
    var ys = this.vertices.map(function (v) {
      return v.y
    })
    var centerX =
      xs.reduce(function (a, b) {
        return a + b
      }, 0) / xs.length
    var centerY =
      ys.reduce(function (a, b) {
        return a + b
      }, 0) / ys.length

    // Match the exact pattern from AMF and COF
    ctx.save()
    ctx.font = this.options.font
    ctx.fillStyle = this.options.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('/S', centerX, centerY)
    ctx.restore()
  }

  // Class UNE = Un-Erupted (une)
  function UNE(vertices, options) {
    this.name = 'UNE'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#555', fontsize: 12 }, options)
    return this
  }
  UNE.prototype.render = function (ctx) {
    var x = parseFloat(this.vertices[0].x)
    var y = parseFloat(this.vertices[0].y)
    var fontsize = parseInt(this.options.fontsize)

    ctx.fillStyle = '#000'
    ctx.font = 'bold ' + fontsize + 'px Arial'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('   NER', x, y) // Changed from UNE to NER
  }
  // Class PRE = Paredontosis
  function PRE(vertices, options) {
    this.name = 'PRE'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#555', fontsize: 16 }, options)
    return this
  }
  PRE.prototype.render = function (ctx) {
    var x = parseFloat(this.vertices[0].x)
    var y = parseFloat(this.vertices[0].y)
    var fontsize = parseInt(this.options.fontsize)

    ctx.fillStyle = '#000'
    ctx.font = 'bold ' + fontsize + 'px Arial'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('Pd', x, y) // Changed from PRE to PER
  }
  // Class ANO = Anomali (ano), Pegshaped, micro, fusi, etc
  function ANO(vertices, options) {
    this.name = 'ANO'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#555', fontsize: 12 }, options)
    return this
  }
  ANO.prototype.render = function (ctx) {
    var x = parseFloat(this.vertices[0].x)
    var y = parseFloat(this.vertices[0].y)
    var fontsize = parseInt(this.options.fontsize)

    ctx.fillStyle = '#000'
    ctx.font = 'bold ' + fontsize + 'px Algerian'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('   ANO', x, y)
  }
  function CARIES(vertices, options) {
    this.name = 'CARIES'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#07ff07ff' }, options)
    return this
  }
  CARIES.prototype.render = function (ctx) {
    ctx.fillStyle = this.options.fillStyle
    ctx.beginPath()

    var vertices = this.vertices.concat([])
    var fpos = vertices.shift()
    ctx.moveTo(fpos.x + 1, fpos.y + 1)

    var pos
    while (vertices.length > 0) {
      pos = vertices.shift()
      if (pos) {
        ctx.lineTo(pos.x + 1, pos.y + 1)
      }
    }
    ctx.lineTo(fpos.x + 1, fpos.y + 1)
    ctx.closePath()
    ctx.fill()
  }

  // Class CARIES_UNTREATABLE = Caries Intratables = filled with red
  function CARIES_UNTREATABLE(vertices, options) {
    this.name = 'CARIES_UNTREATABLE'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: '#FFC107' }, options)
    return this
  }
  CARIES_UNTREATABLE.prototype.render = function (ctx) {
    ctx.fillStyle = this.options.fillStyle
    ctx.beginPath()

    var vertices = this.vertices.concat([])
    var fpos = vertices.shift()
    ctx.moveTo(fpos.x + 1, fpos.y + 1)

    var pos
    while (vertices.length > 0) {
      pos = vertices.shift()
      if (pos) {
        ctx.lineTo(pos.x + 1, pos.y + 1)
      }
    }
    ctx.lineTo(fpos.x + 1, fpos.y + 1)
    ctx.closePath()
    ctx.fill()
  }
  // Class CFR = fracture (cfr) (Tanda '#' di tengah" gigi)

function CFR(vertices, options) {
  this.name = 'CFR';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    fillStyle: getColorForTreatment('CFR', this.layer)
  }, options);
  return this;
}

CFR.prototype.render = function (ctx) {
  var x1 = parseFloat(this.vertices[0].x);
  var y1 = parseFloat(this.vertices[0].y);
  var x2 = parseFloat(this.vertices[1].x);
  var y2 = parseFloat(this.vertices[1].y);
  var boxSize = x2 - x1;
  var fontsize = parseInt(boxSize);

  var x = x1 + boxSize / 2;
  var y = y1 + boxSize / 2;

  ctx.fillStyle = this.options.fillStyle;
  ctx.font = 'bold ' + fontsize + 'px Algerian';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('=', x, y);
};


function FMC(vertices, options) {
  this.name = 'FMC';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    strokeStyle: getColorForTreatment('FMC', this.layer)
  }, options);
  return this;
}

FMC.prototype.render = function (ctx) {
  var x1 = parseFloat(this.vertices[0].x) + 1;
  var y1 = parseFloat(this.vertices[0].y) + 1;
  var x2 = parseFloat(this.vertices[1].x) + 1;
  var y2 = parseFloat(this.vertices[1].y) + 1;
  var vertices = [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 },
  ];

  ctx.strokeStyle = this.options.strokeStyle;
  ctx.lineWidth = 6;
  ctx.beginPath();

  var fpos = vertices.shift();
  ctx.moveTo(fpos.x, fpos.y);

  var pos;
  while (vertices.length > 0) {
    pos = vertices.shift();
    if (pos) {
      ctx.lineTo(pos.x, pos.y);
    }
  }
  ctx.lineTo(fpos.x, fpos.y);
  ctx.closePath();
  ctx.stroke();
};


function POC(vertices, options) {
  this.name = 'POC';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    strokeStyle: getColorForTreatment('POC', this.layer), 
    fillStyle: 'transparent', 
    lineWidth: 3 
  }, options);
  return this;
}

POC.prototype.render = function (ctx) {
  var x1 = parseFloat(this.vertices[0].x) + 1;
  var y1 = parseFloat(this.vertices[0].y) + 1;
  var x2 = parseFloat(this.vertices[1].x) + 1;
  var y2 = parseFloat(this.vertices[1].y) + 1;

  var centerX = (x1 + x2) / 2;
  var centerY = (y1 + y2) / 2;
  var toothWidth = x2 - x1;
  var toothHeight = y2 - y1;
  var radius = Math.min(toothWidth, toothHeight) / 3;

  ctx.save();
  ctx.strokeStyle = this.options.strokeStyle;
  ctx.fillStyle = this.options.fillStyle;
  ctx.lineWidth = this.options.lineWidth;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  if (this.options.fillStyle !== 'transparent') {
    ctx.fill();
  }

  ctx.restore();
};
  // Class RRX = Sisa Akar (rrx)
  function RRX(vertices, options) {
    this.name = 'RRX'
    this.vertices = vertices
    this.options = $.extend({ strokeStyle: '#333' }, options)
    return this
  }
  RRX.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x) + 1
    var y1 = parseFloat(this.vertices[0].y) + 1
    var x2 = parseFloat(this.vertices[1].x) + 1
    var y2 = parseFloat(this.vertices[1].y) + 1
    var bigBoxSize = x2 - x1
    var smallBoxSize = bigBoxSize / 2
    var lines = [
      {
        x1: x1 + smallBoxSize / 3,
        y1: y1 - smallBoxSize / 2,
        x2: x1 + smallBoxSize,
        y2: y2 + smallBoxSize / 2,
      },
      {
        x1: x1 + smallBoxSize,
        y1: y2 + smallBoxSize / 2,
        x2: x1 + smallBoxSize * 2,
        y2: y1 - smallBoxSize,
      },
    ]

    ctx.strokeStyle = this.options.strokeStyle
    ctx.lineWidth = 4
    var line
    for (var i = 0; i < lines.length; i++) {
      line = lines[i]
      ctx.beginPath()
      ctx.moveTo(line.x1, line.y1)
      ctx.lineTo(line.x2, line.y2)
      ctx.stroke()
    }
  }
  // Class MIS = Gigi hilang (mis)
  function MIS(vertices, options) {
    this.name = 'MIS'
    this.vertices = vertices
    this.options = $.extend({ strokeStyle: '#333' }, options)
    return this
  }
  MIS.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x) + 1
    var y1 = parseFloat(this.vertices[0].y) + 1
    var x2 = parseFloat(this.vertices[1].x) + 1
    var y2 = parseFloat(this.vertices[1].y) + 1
    var bigBoxSize = x2 - x1
    var smallBoxSize = bigBoxSize / 2
    var lines = [
      {
        x1: x1 + smallBoxSize * 0.5,
        y1: y1 - smallBoxSize / 2,
        x2: x1 + smallBoxSize * 1.5,
        y2: y2 + smallBoxSize / 2,
      },
      {
        x1: x1 + smallBoxSize * 1.5,
        y1: y1 - smallBoxSize / 2,
        x2: x1 + smallBoxSize * 0.5,
        y2: y2 + smallBoxSize / 2,
      },
    ]

    ctx.strokeStyle = this.options.strokeStyle
    ctx.lineWidth = 4
    var line
    for (var i = 0; i < lines.length; i++) {
      line = lines[i]
      ctx.beginPath()
      ctx.moveTo(line.x1, line.y1)
      ctx.lineTo(line.x2, line.y2)
      ctx.stroke()
    }
  }

// Update IPX class
function IPX(vertices, options) {
  this.name = 'IPX';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    fillStyle: getColorForTreatment('IPX', this.layer), 
    fontsize: 12 
  }, options);
  return this;
}

IPX.prototype.render = function (ctx) {
  var x = parseFloat(this.vertices[0].x);
  var y = parseFloat(this.vertices[1].y);
  var fontsize = parseInt(this.options.fontsize);

  ctx.fillStyle = this.options.fillStyle;
  ctx.font = 'bold ' + fontsize + 'px Arial';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('IM', x, y);
};

// Update FRM_ACR class
function FRM_ACR(vertices, options) {
  this.name = 'FRM_ACR';
  this.vertices = vertices;
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    fillStyle: getColorForTreatment('FRM_ACR', this.layer), 
    fontsize: 16 
  }, options);
  return this;
}

FRM_ACR.prototype.render = function (ctx) {
  var x = parseFloat(this.vertices[0].x) + (parseFloat(this.vertices[1].x) - parseFloat(this.vertices[0].x)) / 2;
  var y = parseFloat(this.vertices[1].y) + (parseFloat(this.vertices[1].x) - parseFloat(this.vertices[0].x)) / 2 - (parseFloat(this.vertices[1].x) - parseFloat(this.vertices[0].x)) / 8;
  var fontsize = parseInt(this.options.fontsize);

  ctx.fillStyle = this.options.fillStyle;
  ctx.font = 'bold ' + fontsize + 'px Arial';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText('P', x, y);
};

// Fix BRIDGE class to support red/blue layer colors
function BRIDGE(startVert, endVert, options) {
  this.name = 'BRIDGE'
  this.startVert = startVert
  this.endVert = endVert
  this.layer = options && options.layer ? options.layer : CURRENT_ANNOTATION_LAYER;
  this.options = $.extend({ 
    strokeStyle: getColorForTreatment('BRIDGE', this.layer),
    lineWidth: 3 
  }, options)
  return this
}

BRIDGE.prototype.render = function (ctx) {
  var x1 = parseFloat(this.startVert.x1)
  var y1 = parseFloat(this.startVert.y1)
  var x2 = parseFloat(this.startVert.x2)
  var y2 = parseFloat(this.startVert.y2)
  var xx1 = parseFloat(this.endVert.x1)
  var yy1 = parseFloat(this.endVert.y1)
  var xx2 = parseFloat(this.endVert.x2)
  var yy2 = parseFloat(this.endVert.y2)

  // Calculate tooth centers
  var startCenterX = x1 + (x2 - x1) / 2
  var startCenterY = y1 + (y2 - y1) / 2
  var endCenterX = xx1 + (xx2 - xx1) / 2
  var endCenterY = yy1 + (yy2 - yy1) / 2

  // Determine if we're on upper or lower jaw
  var isUpperJaw = startCenterY < 200 // Assuming upper jaw is in upper half
  
  // Calculate bridge line position - OUTSIDE the teeth
  var bridgeY
  var startDropY, endDropY
  
  if (isUpperJaw) {
    bridgeY = Math.min(y1, yy1) - 25 // 25px above the teeth (outside)
    startDropY = y1 - 5 // Start drop 5px above tooth
    endDropY = yy1 - 5 // End drop 5px above tooth
  } else {
    bridgeY = Math.max(y2, yy2) + 25 // 25px below the teeth (outside)
    startDropY = y2 + 5 // Start drop 5px below tooth
    endDropY = yy2 + 5 // End drop 5px below tooth
  }

  ctx.save()
  ctx.strokeStyle = this.options.strokeStyle // Now uses red/blue based on layer
  ctx.lineWidth = this.options.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  
  // Draw first vertical line (from above/below tooth to bridge line)
  ctx.moveTo(startCenterX, startDropY)
  ctx.lineTo(startCenterX, bridgeY)
  
  // Draw horizontal bridge line
  ctx.lineTo(endCenterX, bridgeY)
  
  // Draw second vertical line (from bridge line to above/below end tooth)
  ctx.lineTo(endCenterX, endDropY)
  
  ctx.stroke()

  ctx.restore()
}

  // Class HAPUS
  function HAPUS(vertices, options) {
    this.name = 'HAPUS'
    this.vertices = vertices
    this.options = $.extend({ fillStyle: 'rgba(200, 200, 200, 0.8)' }, options)
    return this
  }
  HAPUS.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x) + 1
    var y1 = parseFloat(this.vertices[0].y) + 1
    var x2 = parseFloat(this.vertices[1].x) + 1
    var y2 = parseFloat(this.vertices[1].y) + 1
    var x = x1
    var y = y1
    var size = x2 - x1

    ctx.beginPath()
    ctx.fillStyle = this.options.fillStyle
    ctx.rect(x, y, size, size)
    ctx.fill()
  }
  // ARROWS
  // Class ARROW_TOP_LEFT
  function ARROW_TOP_LEFT(vertices, options) {
    this.name = 'ARROW_TOP_LEFT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_TOP_LEFT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx - 25
    toy = fromy

    // fromx = 50;
    // fromy = 20;
    // tox = 25;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_TOP_RIGHT
  function ARROW_TOP_RIGHT(vertices, options) {
    this.name = 'ARROW_TOP_RIGHT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_TOP_RIGHT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx + 25
    toy = fromy

    // fromx = 60;
    // fromy = 20;
    // tox = 90;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_TOP_TURN_LEFT
  function ARROW_TOP_TURN_LEFT(vertices, options) {
    this.name = 'ARROW_TOP_TURN_LEFT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_TOP_TURN_LEFT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx + 10
    toy = fromy

    // fromx = 180;
    // fromy = 20;
    // tox = 190;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(tox, fromy, 5, 1.5 * Math.PI, 0.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(tox, fromy - 5)
    ctx.lineTo(fromx, fromy - 5)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox - fromx)

    toy = toy - 5
    fromx = fromx - 5
    ctx.beginPath()
    ctx.moveTo(fromx, toy)
    ctx.lineTo(
      fromx + headlen * Math.cos(angle + Math.PI / 7),
      toy + headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(
      fromx + headlen * Math.cos(angle - Math.PI / 7),
      toy + headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(fromx, toy)
    ctx.lineTo(
      fromx + headlen * Math.cos(angle + Math.PI / 7),
      toy + headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_TOP_TURN_RIGHT
  function ARROW_TOP_TURN_RIGHT(vertices, options) {
    this.name = 'ARROW_TOP_TURN_RIGHT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_TOP_TURN_RIGHT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y1 - 10
    tox = fromx + 10
    toy = fromy

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 0.38 * Math.PI, 1.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(fromx, fromy - 5)
    ctx.lineTo(tox, fromy - 5)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox - fromx)

    toy = toy - 5
    tox = tox + 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_BOTTOM_LEFT
  function ARROW_BOTTOM_LEFT(vertices, options) {
    this.name = 'ARROW_BOTTOM_LEFT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_BOTTOM_LEFT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 4
    fromy = y2 + 10
    tox = fromx - 25
    toy = fromy

    // fromx = 50;
    // fromy = 20;
    // tox = 25;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_BOTTOM_RIGHT
  function ARROW_BOTTOM_RIGHT(vertices, options) {
    this.name = 'ARROW_BOTTOM_RIGHT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_BOTTOM_RIGHT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y2 + 10
    tox = fromx + 25
    toy = fromy

    // fromx = 60;
    // fromy = 20;
    // tox = 90;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_BOTTOM_TURN_LEFT
  function ARROW_BOTTOM_TURN_LEFT(vertices, options) {
    this.name = 'ARROW_BOTTOM_TURN_LEFT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_BOTTOM_TURN_LEFT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y2 + 10
    tox = fromx - 10
    toy = fromy + 5

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 1.5 * Math.PI, 0.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(fromx, toy)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox)

    toy = toy
    tox = tox - 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  // Class ARROW_BOTTOM_TURN_RIGHT
  function ARROW_BOTTOM_TURN_RIGHT(vertices, options) {
    this.name = 'ARROW_BOTTOM_TURN_RIGHT'
    this.vertices = vertices
    this.options = $.extend({}, options)
    return this
  }
  ARROW_BOTTOM_TURN_RIGHT.prototype.render = function (ctx) {
    var x1 = parseFloat(this.vertices[0].x)
    var y1 = parseFloat(this.vertices[0].y)
    var x2 = parseFloat(this.vertices[1].x)
    var y2 = parseFloat(this.vertices[1].y)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y2 + 10
    tox = fromx + 10
    toy = fromy + 5

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 0.38 * Math.PI, 1.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(fromx, toy)
    ctx.lineTo(tox, toy)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox)

    toy = toy
    tox = tox + 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  // Class Odontogram
  function Odontogram(jqEl, settings) {
    this.jquery = jqEl
    this.canvas = jqEl.get(0)
    this.context = jqEl.get(0).getContext('2d')
    this.settings = settings
    this.mode = ODONTOGRAM_MODE_DEFAULT
    this.hoverGeoms = []
    this.geometry = {}
    this.active_geometry = null // Selected Geometry
    this.mode_bridge_coords = [] 
    this.teeth = {} // Menyimpan Coordinate Gigi dengan key: x1:y1;x2:y2;cx:cy

    this._drawBackground()
    return this
  }

  Odontogram.prototype.setMode = function (mode) {
    this.mode = mode

    return this
  }

  Odontogram.prototype._sideTeeth = function (
    ctx,
    numbers,
    bigBoxSize,
    smallBoxSize,
    xpos,
    ypos
  ) {
    // Small Box
    ctx.beginPath()
    ctx.lineWidth = '2'
    ctx.strokeStyle = '#555'
    ctx.rect(
      xpos + smallBoxSize / 2,
      ypos + smallBoxSize / 2,
      smallBoxSize,
      smallBoxSize
    )
    ctx.stroke()

    // Lines
    //// Top Left
    ctx.beginPath()
    ctx.moveTo(xpos, ypos)
    ctx.lineTo(xpos + smallBoxSize / 2, ypos + smallBoxSize / 2)
    ctx.stroke()
    //// Top Right
    ctx.beginPath()
    ctx.moveTo(xpos + bigBoxSize, ypos)
    ctx.lineTo(xpos + bigBoxSize - smallBoxSize / 2, ypos + smallBoxSize / 2)
    ctx.stroke()
    //// Bottom Left
    ctx.beginPath()
    ctx.moveTo(xpos, ypos + bigBoxSize)
    ctx.lineTo(xpos + smallBoxSize / 2, ypos + bigBoxSize - smallBoxSize / 2)
    ctx.stroke()
    //// Bottom Right
    ctx.beginPath()
    ctx.moveTo(xpos + bigBoxSize, ypos + bigBoxSize)
    ctx.lineTo(
      xpos + bigBoxSize - smallBoxSize / 2,
      ypos + bigBoxSize - smallBoxSize / 2
    )
    ctx.stroke()

    // Numbers
    var num = numbers.shift()
    ctx.font = '12px Arial'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'center'
    ctx.fillText(num, xpos + bigBoxSize / 2, ypos + bigBoxSize * 1.4)

    const x1 = xpos
    const y1 = ypos
    const x2 = xpos + bigBoxSize
    const y2 = ypos + bigBoxSize
    const cx = xpos + bigBoxSize / 2
    const cy = ypos + bigBoxSize / 2
    const key = x1 + ':' + y1 + ';' + x2 + ':' + y2 + ';' + cx + ':' + cy
    this.teeth[key] = {
      num: num,
      bigBoxSize: bigBoxSize,
      smallBoxSize: smallBoxSize,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      cx: cx,
      cy: cy,
      // Coords shapes (top left, top right, bottom left, bottom right)
      top: {
        tl: { x: xpos, y: ypos },
        tr: { x: xpos + bigBoxSize, y: ypos },
        br: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + smallBoxSize / 2,
        },
        bl: { x: xpos + smallBoxSize / 2, y: ypos + smallBoxSize / 2 },
      },
      right: {
        tl: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + smallBoxSize / 2,
        },
        tr: { x: xpos + bigBoxSize, y: ypos },
        br: { x: xpos + bigBoxSize, y: ypos + bigBoxSize },
        bl: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
      },
      bottom: {
        tl: {
          x: xpos + smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
        tr: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
        br: { x: xpos + bigBoxSize, y: ypos + bigBoxSize },
        bl: { x: xpos, y: ypos + bigBoxSize },
      },
      left: {
        tl: { x: xpos, y: ypos },
        tr: { x: xpos + smallBoxSize / 2, y: ypos + smallBoxSize / 2 },
        br: {
          x: xpos + smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
        bl: { x: xpos, y: ypos + bigBoxSize },
      },
      middle: {
        tl: { x: xpos + smallBoxSize / 2, y: ypos + smallBoxSize / 2 },
        tr: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + smallBoxSize / 2,
        },
        br: {
          x: xpos + bigBoxSize - smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
        bl: {
          x: xpos + smallBoxSize / 2,
          y: ypos + bigBoxSize - smallBoxSize / 2,
        },
      },
    }
  }

  Odontogram.prototype._centerTeeth = function (
    ctx,
    numbers,
    bigBoxSize,
    smallBoxSize,
    xpos,
    ypos
  ) {
    // Small Box
    ctx.beginPath()
    ctx.lineWidth = '2'
    ctx.strokeStyle = '#555'
    ctx.rect(
      xpos + smallBoxSize / 2 + 3,
      ypos + smallBoxSize - 3,
      smallBoxSize - 6,
      0
    )
    ctx.stroke()

    // Lines
    //// Top Left
    ctx.beginPath()
    ctx.moveTo(xpos, ypos)
    ctx.lineTo(xpos + smallBoxSize / 2 + 3, ypos + smallBoxSize - 3)
    ctx.stroke()
    //// Top Right
    ctx.beginPath()
    ctx.moveTo(xpos + bigBoxSize, ypos)
    ctx.lineTo(
      xpos + bigBoxSize - smallBoxSize / 2 - 3,
      ypos + smallBoxSize - 3
    )
    ctx.stroke()
    //// Bottom Left
    ctx.beginPath()
    ctx.moveTo(xpos, ypos + bigBoxSize)
    ctx.lineTo(
      xpos + smallBoxSize / 2 + 3,
      ypos + bigBoxSize - smallBoxSize - 3
    )
    ctx.stroke()
    //// Bottom Right
    ctx.beginPath()
    ctx.moveTo(xpos + bigBoxSize, ypos + bigBoxSize)
    ctx.lineTo(
      xpos + bigBoxSize - smallBoxSize / 2 - 3,
      ypos + bigBoxSize - smallBoxSize - 3
    )
    ctx.stroke()

    // Numbers
    var num = numbers.shift()
    ctx.font = '12px Arial'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'center'
    ctx.fillText(num, xpos + bigBoxSize / 2, ypos + bigBoxSize * 1.4)

    const x1 = xpos
    const y1 = ypos
    const x2 = xpos + bigBoxSize
    const y2 = ypos + bigBoxSize
    const cx = xpos + bigBoxSize - 3
    const cy = ypos + bigBoxSize - 3
    const key = x1 + ':' + y1 + ';' + x2 + ':' + y2 + ';' + cx + ':' + cy
    this.teeth[key] = {
      num: num,
      bigBoxSize: bigBoxSize,
      smallBoxSize: smallBoxSize,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      cx: cx,
      cy: cy,
      // Coords shapes (top left, top right, bottom left, bottom right)
      top: {
        tl: { x: xpos + 1, y: ypos },
        tr: { x: xpos + bigBoxSize, y: ypos },
        br: {
          x: xpos + bigBoxSize - smallBoxSize / 2 - 3,
          y: ypos + smallBoxSize - 3,
        },
        bl: { x: xpos + smallBoxSize / 2 + 3, y: ypos + smallBoxSize - 3 },
      },
      right: {
        tl: {
          x: xpos + bigBoxSize - smallBoxSize / 2 - 2,
          y: ypos + smallBoxSize - 3,
        },
        tr: { x: xpos + bigBoxSize, y: ypos },
        br: { x: xpos + bigBoxSize, y: ypos + bigBoxSize },
        bl: {
          x: xpos + bigBoxSize - smallBoxSize / 2 - 2,
          y: ypos + smallBoxSize - 3,
        },
      },
      bottom: {
        tl: {
          x: xpos + smallBoxSize / 2 + 3,
          y: ypos + bigBoxSize - smallBoxSize - 3,
        },
        tr: {
          x: xpos + bigBoxSize - smallBoxSize / 2 - 3,
          y: ypos + bigBoxSize - smallBoxSize - 3,
        },
        br: { x: xpos + bigBoxSize - 1, y: ypos + bigBoxSize },
        bl: { x: xpos + 1, y: ypos + bigBoxSize },
      },
      left: {
        tl: { x: xpos, y: ypos },
        tr: { x: xpos + smallBoxSize / 2 + 2, y: ypos + smallBoxSize - 3 },
        br: { x: xpos + smallBoxSize / 2 + 2, y: ypos + smallBoxSize - 3 },
        bl: { x: xpos, y: ypos + bigBoxSize },
      },
      middle: {
        tl: { x: 0, y: 0 },
        tr: { x: 0, y: 0 },
        br: { x: 0, y: 0 },
        bl: { x: 0, y: 0 },
      },
    }
  }

  Odontogram.prototype._drawBackground = function () {
    var canvas = this.canvas
    var ctx = this.context

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // Clears the canvas

    var width = ctx.canvas.width
    var height = ctx.canvas.height

    var pl = 10,
      pr = 10,
      pt = 30,
      pb = 10,
      gap_per = 10,
      gap_bag = 30

    var bigBoxSize = (width - (pl + pt + gap_per * 16 + gap_bag)) / 16
    var smallBoxSize = bigBoxSize / 2

    // Determine tooth layout based on settings
    var numbers
    var layout

    if (this.settings.toothType === 'primary') {
      // Children's teeth layout (primary dentition)
      numbers = [
        '55',
        '54',
        '53',
        '52',
        '51',
        '61',
        '62',
        '63',
        '64',
        '65',
        '85',
        '84',
        '83',
        '82',
        '81',
        '71',
        '72',
        '73',
        '74',
        '75',
      ]
      layout = {
        rows: 2,
        cols: 10,
        startCol: 3, // Start from column 3 (centered)
        endCol: 12, // End at column 12
      }
    } else {
      // Adult teeth layout (permanent dentition)
      numbers = [
        '18',
        '17',
        '16',
        '15',
        '14',
        '13',
        '12',
        '11',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '48',
        '47',
        '46',
        '45',
        '44',
        '43',
        '42',
        '41',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
      ]
      layout = {
        rows: 2,
        cols: 16,
        startCol: 0,
        endCol: 15,
      }
    }

    var xpos, ypos
    var sec = 0
    var numberIndex = 0

    for (var y = 0; y < layout.rows; y++) {
      sec = 0
      for (var x = layout.startCol; x <= layout.endCol; x++) {
        if (x % 8 == 0 && x != 0) sec++

        xpos = x * bigBoxSize + pl + x * gap_per + sec * gap_bag
        ypos = y * bigBoxSize + pt + pt * y + y * 60 // Add more spacing between rows

        // Big Box
        ctx.beginPath()
        ctx.lineWidth = '2'
        ctx.strokeStyle = '#555'
        ctx.rect(xpos, ypos, bigBoxSize, bigBoxSize)
        ctx.stroke()

        // Always use sideTeeth for every tooth
        this._sideTeeth(
          ctx,
          [numbers[numberIndex++]],
          bigBoxSize,
          smallBoxSize,
          xpos,
          ypos
        )
      }
    }

    var me = this
    var img = new Image()
    img.src = this.getDataURL()
    img.onload = function () {
      me.background = {
        image: img,
        x: 1,
        y: 1,
        w: img.naturalWidth,
        h: img.naturalHeight,
      }

      me.redraw()
    }
  }

  // TOP
  function top_leftArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx - 25
    toy = fromy

    // fromx = 50;
    // fromy = 20;
    // tox = 25;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }
  function top_rightArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx + 25
    toy = fromy

    // fromx = 60;
    // fromy = 20;
    // tox = 90;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }
  function top_turnLeftArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y1 - 10
    tox = fromx + 10
    toy = fromy

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 0.38 * Math.PI, 1.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(fromx, fromy - 5)
    ctx.lineTo(tox, fromy - 5)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox - fromx)

    toy = toy - 5
    tox = tox + 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()

    //starting a new path from the head of the arrow to one of the sides of the point
    // ctx.beginPath();
    // ctx.moveTo(tox, toy);
    // ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    // ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    // ctx.lineTo(tox, toy);
    // ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    // ctx.strokeStyle = "#000000";
    // ctx.lineWidth = lineWidth;
    // ctx.stroke();
  }
  function top_turnRightArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y1 - 10
    tox = fromx + 10
    toy = fromy

    // fromx = 180;
    // fromy = 20;
    // tox = 190;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(tox, fromy, 5, 1.5 * Math.PI, 0.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(tox, fromy - 5)
    ctx.lineTo(fromx, fromy - 5)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox - fromx)

    toy = toy - 5
    fromx = fromx - 5
    ctx.beginPath()
    ctx.moveTo(fromx, toy)
    ctx.lineTo(
      fromx + headlen * Math.cos(angle + Math.PI / 7),
      toy + headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(
      fromx + headlen * Math.cos(angle - Math.PI / 7),
      toy + headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(fromx, toy)
    ctx.lineTo(
      fromx + headlen * Math.cos(angle + Math.PI / 7),
      toy + headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }
  // BOTTOM
  function bottom_leftArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 4
    fromy = y2 + 10
    tox = fromx - 25
    toy = fromy

    // fromx = 50;
    // fromy = 20;
    // tox = 25;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  function bottom_rightArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x1 + (x2 - x1) / 4
    fromy = y2 + 10
    tox = fromx + 25
    toy = fromy

    // fromx = 60;
    // fromy = 20;
    // tox = 90;
    // toy = 20;

    var headlen = 10
    var lineWidth = 2

    var angle = Math.atan2(toy - fromy, tox - fromx)

    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )

    //draws the paths created above
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  function bottom_turnLeftArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y2 + 10
    tox = fromx + 10
    toy = fromy + 5

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 0.38 * Math.PI, 1.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(fromx, toy)
    ctx.lineTo(tox, toy)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox)

    toy = toy
    tox = tox + 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  function bottom_turnRightArrow(ctx, coord) {
    var x1 = parseFloat(coord.x1)
    var y1 = parseFloat(coord.y1)
    var x2 = parseFloat(coord.x2)
    var y2 = parseFloat(coord.y2)

    var fromx, fromy, tox, toy
    fromx = x2 - (x2 - x1) / 2
    fromy = y2 + 10
    tox = fromx - 10
    toy = fromy + 5

    var headlen = 10
    var lineWidth = 2

    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.arc(fromx, fromy, 5, 1.5 * Math.PI, 0.5 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(fromx, toy)
    ctx.stroke()

    var angle = Math.atan2(toy - fromy, tox)

    toy = toy
    tox = tox - 5
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    )
    ctx.lineTo(tox, toy)
    ctx.lineTo(
      tox + headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    )
    ctx.stroke()
    ctx.fill()
  }

  Odontogram.prototype.redraw = function () {
    var canvas = this.canvas
    var ctx = this.context

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // Clears the canvas

    if (this.background) {
      // Background
      ctx.drawImage(
        this.background.image,
        this.background.x,
        this.background.y,
        ctx.canvas.width,
        ctx.canvas.height
      )
    }

    // Draw Hover Geom
    var hoverGeoms
    for (var i = 0; i < this.hoverGeoms.length; i++) {
      hoverGeoms = convertGeom(this.hoverGeoms[i], this.mode)
      hoverGeoms.render(ctx)
    }

    // Draw Geometry
    var geoms
    for (var keyCoord in this.geometry) {
      geoms = this.geometry[keyCoord]
      for (var x in geoms) {
        if (geoms[x].render) geoms[x].render(ctx)
      }
    }

    if (this.active_geometry) {
      this.active_geometry.render(ctx)
    }

    return this
  }

  Odontogram.prototype.setGeometry = function (geometry) {
    for (var keyCoord in geometry) {
      for (var i = 0; i < geometry[keyCoord].length; i++) {
        geometry[keyCoord][i] = convertGeomFromObject(geometry[keyCoord][i])
      }
    }

    this.geometry = geometry

    this.redraw()
  }

  Odontogram.prototype.search = function (key, value) {
    const obj = this.teeth
    for (let k in obj) {
      if (obj[k][key] == value) {
        return [k, obj[k]]
      }
    }
    return null
  }

  Odontogram.prototype.setGeometryByPos = function (data) {
    let geometry = {}
    for (d of data) {
      if (!d.code || !d.pos) continue
      if (d.pos.includes('-')) {
        ;[pos, sub] = d.pos.split('-')
        const t = this.search('num', pos)
        let s
        if (sub == 'L') s = t[1].left
        else if (sub == 'R') s = t[1].right
        else if (sub == 'B') s = t[1].bottom
        else if (sub == 'T') s = t[1].top
        else if (sub == 'M') s = t[1].middle

        if (['1', '2', '3'].some((a) => pos.endsWith(a)) && sub == 'M') continue

        if (!geometry[t[0]]) geometry[t[0]] = []

        geometry[t[0]].push({
          name: d.code,
          pos: d.pos,
          vertices: [s.bl, s.br, s.tr, s.tl],
        })
      } else {
        const t = this.search('num', d.pos)
        if (!geometry[t[0]]) geometry[t[0]] = []
        geometry[t[0]].push({
          name: d.code,
          pos: d.pos,
          vertices: [
            { x: t[1].x1, y: t[1].y1 },
            { x: t[1].x2, y: t[1].y2 },
          ],
        })
      }
    }
    this.setGeometry(geometry)
    return geometry
  }

  Odontogram.prototype.getDataURL = function () {
    return this.canvas.toDataURL()
  }

  $.fn.odontogram = function (mode, arg1, arg2, arg3, arg4) {
    var instance = this.data('odontogram')
    switch (mode) {
      case 'init': // Arg1 is options
        if (this.prop('nodeName') !== 'CANVAS') {
          throw Error('Odontogram must be valid `CANVAS`.')
        }

        if (instance != null) {
          throw Error("can't reinitialize odontogram.")
        }

        return initialize(this, arg1)
      case 'setMode':
        instance.active_geometry = null
        checkOdontogram(this, mode)
        setMode(this, arg1)
        break
      case 'redraw':
        checkOdontogram(this, mode)
        redraw(this)
        break
      case 'getDataURL':
        checkOdontogram(this, mode)
        return instance.getDataURL()
      case 'setGeometry':
        checkOdontogram(this, mode)
        instance.setGeometry(arg1)
        break
      case 'setGeometryByPos':
        checkOdontogram(this, mode)
        instance.setGeometryByPos(arg1)
        break
      // DLL
    }

    return this
  }

  function initialize($this, options) {
    var settings = $.extend({}, $.fn.odontogram.defaults, options)

    var canvas = $this.get(0)

    $this
      .prop('height', settings.height)
      .prop('width', settings.width)
      .css('width', settings.width)
      .css('height', settings.height)

    canvas.width = parseFloat(settings.width)
    canvas.height = parseFloat(settings.height)

    var instance = new Odontogram($this, settings)

    $this.data('odontogram', instance)

    $this.on('mousemove', _on_mouse_move).on('click', _on_mouse_click)

    return instance
  }

  function setMode($this, mode) {
    // TODO
    // switch (mode) {
    //     default:
    //         throw Error("Odontogram invalid mode `" + mode + "`");
    // }
    var instance = $this.data('odontogram')
    instance.setMode(mode)
  }

  function redraw($this) {
    var instance = $this.data('odontogram')
    instance.redraw()
  }

  function checkOdontogram($this, mode) {
    if (
      $this.data('odontogram') == null ||
      !($this.data('odontogram') instanceof Odontogram)
    ) {
      throw Error('`' + mode + '` must be valid Odontogram object.')
    }
  }

// Update convertGeom function to pass layer information
function convertGeom(geometry, mode) {
  var newGeometry;
  var layerOptions = { layer: CURRENT_ANNOTATION_LAYER };
  
  switch (mode) {
    case ODONTOGRAM_MODE_AMF:
      newGeometry = new AMF(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_COF:
      newGeometry = new COF(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_SIL:
      newGeometry = new SIL(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_ORT:
      newGeometry = new ORT(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_INC:
      newGeometry = new INC(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_RES:
      newGeometry = new RES(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_REF:
      newGeometry = new REF(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_POC:
      newGeometry = new POC(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_FMC:
      newGeometry = new FMC(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_IPX:
      newGeometry = new IPX(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_FRM_ACR:
      newGeometry = new FRM_ACR(geometry.vertices, layerOptions);
      break;
    case ODONTOGRAM_MODE_CFR:
      newGeometry = new CFR(geometry.vertices, layerOptions);
      break;
case ODONTOGRAM_MODE_BRIDGE:
  var layerOptions = { layer: CURRENT_ANNOTATION_LAYER };
  newGeometry = new BRIDGE(geometry.vertices[0], geometry.vertices[1], layerOptions);
  break;
    case ODONTOGRAM_MODE_FIS:
      newGeometry = new FIS(geometry.vertices, layerOptions);
      break;
    
    // Pathology treatments - don't use layer colors (keep original colors)
    case ODONTOGRAM_MODE_RCT:
      newGeometry = new RCT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_CARIES:
      newGeometry = new CARIES(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_CARIES_UNTREATABLE:
      newGeometry = new CARIES_UNTREATABLE(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_MIS:
      newGeometry = new MIS(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_PRE:
      newGeometry = new PRE(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_NVT:
      newGeometry = new NVT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_UNE:
      newGeometry = new UNE(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_NON:
      newGeometry = new NON(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ANO:
      newGeometry = new ANO(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_RRX:
      newGeometry = new RRX(geometry.vertices);
      break;
    
    // Arrow treatments
    case ODONTOGRAM_MODE_ARROW_TOP_LEFT:
      newGeometry = new ARROW_TOP_LEFT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_TOP_RIGHT:
      newGeometry = new ARROW_TOP_RIGHT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT:
      newGeometry = new ARROW_TOP_TURN_LEFT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT:
      newGeometry = new ARROW_TOP_TURN_RIGHT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT:
      newGeometry = new ARROW_BOTTOM_LEFT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT:
      newGeometry = new ARROW_BOTTOM_RIGHT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT:
      newGeometry = new ARROW_BOTTOM_TURN_LEFT(geometry.vertices);
      break;
    case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT:
      newGeometry = new ARROW_BOTTOM_TURN_RIGHT(geometry.vertices);
      break;
    
    // Special cases
    case ODONTOGRAM_MODE_HAPUS:
      newGeometry = new HAPUS(geometry.vertices);
      break;
    
    default:
      newGeometry = geometry;
      break;
  }
  
  // Preserve position information
  if (newGeometry.pos === undefined) {
    newGeometry.pos = geometry.pos;
  }
  
  return newGeometry;
}

// Update convertGeomFromObject to preserve layer information
function convertGeomFromObject(geometry) {
  var newGeom = null;
  var layerOptions = geometry.layer ? { layer: geometry.layer } : {};
  
  switch (geometry.name) {
    case 'Polygon':
      newGeom = new Polygon(geometry.vertices, geometry.options);
      break;
    
    // Treatments that use layer colors
    case 'AMF':
      newGeom = new AMF(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'COF':
      newGeom = new COF(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'SIL':
      newGeom = new SIL(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'ORT':
      newGeom = new ORT(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'INC':
      newGeom = new INC(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'RES':
      newGeom = new RES(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'REF':
      newGeom = new REF(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'POC':
      newGeom = new POC(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'FMC':
      newGeom = new FMC(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'IPX':
      newGeom = new IPX(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'FRM_ACR':
      newGeom = new FRM_ACR(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    case 'CFR':
      newGeom = new CFR(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
case 'BRIDGE':
  var layerOptions = geometry.layer ? { layer: geometry.layer } : {};
  newGeom = new BRIDGE(geometry.startVert, geometry.endVert, $.extend(layerOptions, geometry.options));
  break;
    case 'FIS':
      newGeom = new FIS(geometry.vertices, $.extend(layerOptions, geometry.options));
      break;
    
    // Pathology treatments - don't use layer colors
    case 'RCT':
      newGeom = new RCT(geometry.vertices, geometry.options);
      break;
    case 'CARIES':
      newGeom = new CARIES(geometry.vertices, geometry.options);
      break;
    case 'CARIES_UNTREATABLE':
      newGeom = new CARIES_UNTREATABLE(geometry.vertices, geometry.options);
      break;
    case 'MIS':
      newGeom = new MIS(geometry.vertices, geometry.options);
      break;
    case 'PRE':
      newGeom = new PRE(geometry.vertices, geometry.options);
      break;
    case 'NVT':
      newGeom = new NVT(geometry.vertices, geometry.options);
      break;
    case 'UNE':
      newGeom = new UNE(geometry.vertices, geometry.options);
      break;
    case 'NON':
      newGeom = new NON(geometry.vertices, geometry.options);
      break;
    case 'ANO':
      newGeom = new ANO(geometry.vertices, geometry.options);
      break;
    case 'RRX':
      newGeom = new RRX(geometry.vertices, geometry.options);
      break;
    
    // Arrow treatments
    case 'ARROW_TOP_LEFT':
      newGeom = new ARROW_TOP_LEFT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_TOP_RIGHT':
      newGeom = new ARROW_TOP_RIGHT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_TOP_TURN_LEFT':
      newGeom = new ARROW_TOP_TURN_LEFT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_TOP_TURN_RIGHT':
      newGeom = new ARROW_TOP_TURN_RIGHT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_BOTTOM_LEFT':
      newGeom = new ARROW_BOTTOM_LEFT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_BOTTOM_RIGHT':
      newGeom = new ARROW_BOTTOM_RIGHT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_BOTTOM_TURN_LEFT':
      newGeom = new ARROW_BOTTOM_TURN_LEFT(geometry.vertices, geometry.options);
      break;
    case 'ARROW_BOTTOM_TURN_RIGHT':
      newGeom = new ARROW_BOTTOM_TURN_RIGHT(geometry.vertices, geometry.options);
      break;
    
    // Special cases
    case 'HAPUS':
      newGeom = new HAPUS(geometry.vertices, geometry.options);
      break;
    
    default:
      console.warn('Unknown geometry type:', geometry.name);
      break;
  }
  
  // Preserve position information
  if (newGeom && geometry.pos !== undefined) {
    newGeom.pos = geometry.pos;
  }
  
  return newGeom;
}

  //// Check Hover On Teeth (return Geom)
  function getHoverShapeOnTeeth(mouse, teeth) {
    var geoms = []
    for (var key in teeth) {
      switch (key) {
        case 'middle':
        case 'top':
        case 'bottom':
        case 'left':
        case 'right':
          if (isPolyIntersect(teeth[key], mouse)) {
            geoms.push({ name: key, coord: teeth[key] })
          }
          break
      }
    }

    var polygonOpt = {
      fillStyle: 'rgba(55, 55, 55, 0.2)',
    }
    var polygons = []
    var vertices
    for (var i = 0; i < geoms.length; i++) {
      vertices = []
      for (var key in geoms[i].coord) {
        vertices.push(geoms[i].coord[key])
      }
      const pol = new Polygon(vertices, polygonOpt)
      pol.name = geoms[i].name
      polygons.push(pol)
    }

    return polygons
  }

  function isRectIntersect(rectA, rectB) {
    return (
      rectA.x1 < rectB.x2 &&
      rectA.x2 > rectB.x1 &&
      rectA.y1 < rectB.y2 &&
      rectA.y2 > rectB.y1
    )
  }

  function isPolyIntersect(polygon, point) {
    let { x, y } = point // Koordinat titik
    let vertices = Object.values(polygon) // Array titik poligon
    let intersectCount = 0 // Jumlah interseksi sinar dengan sisi poligon

    for (let i = 0; i < vertices.length; i++) {
      let v1 = vertices[i]
      let v2 = vertices[(i + 1) % vertices.length]

      // Cek apakah garis dari y=mouseY melintasi sisi v1->v2
      if (v1.y > y !== v2.y > y) {
        let intersectionX = v1.x + ((y - v1.y) * (v2.x - v1.x)) / (v2.y - v1.y)
        if (x < intersectionX) {
          intersectCount++
        }
      }
    }

    // Jika jumlah interseksi ganjil, maka titik berada di dalam poligon
    return intersectCount % 2 !== 0
  }

  function parseKeyCoord(key) {
    var x1, x2, y1, y2, cx, cy
    var keyChunks, temp

    keyChunks = key.split(';')
    for (var i = 0; i < 3; i++) {
      temp = keyChunks[i].split(':')
      if (i == 0) {
        x1 = temp[0]
        y1 = temp[1]
      } else if (i == 1) {
        x2 = temp[0]
        y2 = temp[1]
      } else {
        cx = temp[0]
        cy = temp[1]
      }
    }

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      cx: cx,
      cy: cy,
    }
  }

  // Menggabungkan, jika ada bentuk yang tidak sesuai maka akan dihapus atau diganti.
  function joinShapeTeeth(geoms1, geoms2) {
    var geometry = $.extend(true, {}, geoms1)
    var geom1, geom2
    for (var keyCoord in geoms2) {
      geom1 = geoms1[keyCoord]
      geom2 = geoms2[keyCoord]
      if (geom1 == null) {
        geometry[keyCoord] = geom2
      } else {
        geometry[keyCoord] = _joinShapeTeeth(geom1, geom2)
      }
    }

    return geometry
  }

  // Rules for treatment overlap - ALL TREATMENTS CAN OVERLAP
  function _joinShapeTeeth(geoms1, geoms2) {
    var geom1, geom2
    var geometry = []

    for (var y = 0; y < geoms2.length; y++) {
      geom2 = geoms2[y]
      geometry = [geom2] // Always add the new treatment

      for (var x = 0; x < geoms1.length; x++) {
        geom1 = geoms1[x]

        switch (true) {
          // AMF (Amalgama) - can overlap with all treatments
          case geom2 instanceof AMF:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // COF (Composite) - can overlap with all treatments
          case geom2 instanceof COF:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // SIL (Silicato) - can overlap with all treatments
          case geom2 instanceof SIL:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // ORT (Ortodoncia) - can overlap with all treatments
          case geom2 instanceof ORT:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // RES (Restauración) - can overlap with all treatments
          case geom2 instanceof RES:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // REF (Restauración Filtrada) - can overlap with all treatments
          case geom2 instanceof REF:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // INC (Incrustación) - can overlap with all treatments
          case geom2 instanceof INC:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // FIS (Sellador) - can overlap with all treatments
          case geom2 instanceof FIS:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // NVT (Surco Profundo) - can overlap with all treatments
          case geom2 instanceof NVT:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // RCT (Tratamiento de Conducto) - can overlap with all treatments
          case geom2 instanceof RCT:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // NON - can overlap with all treatments
          case geom2 instanceof NON:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // UNE (Pieza No Erupcionada) - can overlap with all treatments
          case geom2 instanceof UNE:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // PRE (Paradentosis) - can overlap with all treatments
          case geom2 instanceof PRE:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // ANO (Anomalía) - can overlap with all treatments
          case geom2 instanceof ANO:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // CARIES (Curable) - can overlap with all treatments
          case geom2 instanceof CARIES:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // CARIES_UNTREATABLE (Incurable) - can overlap with all treatments
          case geom2 instanceof CARIES_UNTREATABLE:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // CFR (Extracción) - can overlap with all treatments
          case geom2 instanceof CFR:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // FMC (Prótesis Removible) - can overlap with all treatments
          case geom2 instanceof FMC:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // POC (Corona) - can overlap with all treatments
          case geom2 instanceof POC:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // RRX (Resto Radicular) - can overlap with all treatments
          case geom2 instanceof RRX:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // MIS (Diente Ausente) - can overlap with all treatments
          case geom2 instanceof MIS:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // IPX (Implante) - can overlap with all treatments
          case geom2 instanceof IPX:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // FRM_ACR (Pivot) - can overlap with all treatments
          case geom2 instanceof FRM_ACR:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // BRIDGE (Puente) - can overlap with all treatments
          case geom2 instanceof BRIDGE:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // All Arrow types - can overlap with all treatments
          case geom2 instanceof ARROW_TOP_LEFT:
          case geom2 instanceof ARROW_TOP_RIGHT:
          case geom2 instanceof ARROW_TOP_TURN_LEFT:
          case geom2 instanceof ARROW_TOP_TURN_RIGHT:
          case geom2 instanceof ARROW_BOTTOM_LEFT:
          case geom2 instanceof ARROW_BOTTOM_RIGHT:
          case geom2 instanceof ARROW_BOTTOM_TURN_LEFT:
          case geom2 instanceof ARROW_BOTTOM_TURN_RIGHT:
            geometry.push(geom1) // Always preserve existing treatments
            break

          // HAPUS (Delete) - Special case: removes all existing treatments
          case geom2 instanceof HAPUS:
            // Don't push existing treatments - HAPUS clears everything
            break

          // Default case - allow overlap for any unlisted treatments
          default:
            geometry.push(geom1) // Always preserve existing treatments
            console.log('DEFAULT[OVERLAP_ALLOWED]', geom2.name || 'Unknown')
            break
        }
      }
    }

    return geometry
  }

  function getMouse(evt) {
    var offsetX, offsetY
    if (typeof evt.offsetX != 'undefined') {
      offsetX = evt.offsetX
      offsetY = evt.offsetY
    } else if (typeof evt.layerX != 'undefined') {
      offsetX = evt.layerX
      offsetY = evt.layerY
    }

    return { x: offsetX, y: offsetY }
  }

  // Handlers
  function _on_mouse_move(e) {
    var mouse = getMouse(e)
    var $this = $(e.target)
    var instance = $this.data('odontogram')

    instance.hoverGeoms = []

    var teeth, coord, hoverGeoms
    for (var keyCoord in instance.teeth) {
      teeth = instance.teeth[keyCoord]
      coord = parseKeyCoord(keyCoord)

      switch (instance.mode) {
        case ODONTOGRAM_MODE_NVT: // Kotak
        case ODONTOGRAM_MODE_RCT:
        case ODONTOGRAM_MODE_NON:
        case ODONTOGRAM_MODE_UNE:
        case ODONTOGRAM_MODE_PRE:
        case ODONTOGRAM_MODE_ANO:
        case ODONTOGRAM_MODE_CFR:
        case ODONTOGRAM_MODE_FMC:
        case ODONTOGRAM_MODE_POC:
        case ODONTOGRAM_MODE_RRX:
        case ODONTOGRAM_MODE_MIS:
        case ODONTOGRAM_MODE_IPX:
        case ODONTOGRAM_MODE_FRM_ACR:
        case ODONTOGRAM_MODE_HAPUS:
        case ODONTOGRAM_MODE_ARROW_TOP_LEFT:
        case ODONTOGRAM_MODE_ARROW_TOP_RIGHT:
        case ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT:
        case ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT:
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            hoverGeoms = [
              {
                vertices: [
                  { x: coord.x1, y: coord.y1 },
                  { x: coord.x2, y: coord.y2 },
                ],
              },
            ]

            instance.hoverGeoms = instance.hoverGeoms.concat(hoverGeoms)
          }
          break
// Fix BRIDGE hover in _on_mouse_move function - STOP THE BLINKING
case ODONTOGRAM_MODE_BRIDGE:
  if (
    isRectIntersect(coord, {
      x1: mouse.x,
      y1: mouse.y,
      x2: mouse.x,
      y2: mouse.y,
    })
  ) {
    // ONLY show hover when no bridge is being created
    if (instance.mode_bridge_coords.length === 0) {
      // Simple hover - just highlight the current tooth
      hoverGeoms = [
        {
          vertices: [
            { x: coord.x1, y: coord.y1 },
            { x: coord.x2, y: coord.y2 },
          ],
        },
      ];
      instance.hoverGeoms = instance.hoverGeoms.concat(hoverGeoms);
    }
    // NO HOVER when bridge creation is in progress - prevents blinking
  }
  break;

        case ODONTOGRAM_MODE_ORT:
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            // Only show hover on top and bottom surfaces
            var allHoverShapes = getHoverShapeOnTeeth(mouse, teeth)
            var filteredHoverShapes = []

            for (var i = 0; i < allHoverShapes.length; i++) {
              if (
                allHoverShapes[i].name === 'top' ||
                allHoverShapes[i].name === 'bottom'
              ) {
                filteredHoverShapes.push(allHoverShapes[i])
              }
            }

            instance.hoverGeoms =
              instance.hoverGeoms.concat(filteredHoverShapes)
          }
          break
        default: // Setiap Bagian
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            hoverGeoms = getHoverShapeOnTeeth(mouse, teeth)

            instance.hoverGeoms = instance.hoverGeoms.concat(hoverGeoms)
          }
          break
      }
    }

    if (instance.hoverGeoms.length > 0) {
      $this.css('cursor', 'pointer')
      if (instance.mode == ODONTOGRAM_MODE_HAPUS) {
        $this.css('cursor', 'move')
      }
    } else {
      $this.css('cursor', 'default')
    }

    instance.redraw()
  }

  function _on_mouse_click(e) {
    var mouse = getMouse(e)
    var $this = $(e.target)
    var instance = $this.data('odontogram')

    if (instance.mode == ODONTOGRAM_MODE_DEFAULT) return

    var teeth, coord
    var tempGeoms = {}
    var temp
    for (var keyCoord in instance.teeth) {
      teeth = instance.teeth[keyCoord]
      coord = parseKeyCoord(keyCoord)

      switch (instance.mode) {
        case ODONTOGRAM_MODE_NVT: // Kotak
        case ODONTOGRAM_MODE_RCT:
        case ODONTOGRAM_MODE_NON:
        case ODONTOGRAM_MODE_UNE:
        case ODONTOGRAM_MODE_PRE:
        case ODONTOGRAM_MODE_ANO:
        case ODONTOGRAM_MODE_CFR:
        case ODONTOGRAM_MODE_FMC:
        case ODONTOGRAM_MODE_POC:
        case ODONTOGRAM_MODE_RRX:
        case ODONTOGRAM_MODE_MIS:
        case ODONTOGRAM_MODE_IPX:
        case ODONTOGRAM_MODE_FRM_ACR:
        case ODONTOGRAM_MODE_HAPUS:
        case ODONTOGRAM_MODE_ARROW_TOP_LEFT:
        case ODONTOGRAM_MODE_ARROW_TOP_RIGHT:
        case ODONTOGRAM_MODE_ARROW_TOP_TURN_LEFT:
        case ODONTOGRAM_MODE_ARROW_TOP_TURN_RIGHT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_LEFT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_RIGHT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_LEFT:
        case ODONTOGRAM_MODE_ARROW_BOTTOM_TURN_RIGHT:
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            tempGeoms[keyCoord] = [
              convertGeom(
                {
                  vertices: [
                    { x: coord.x1, y: coord.y1 },
                    { x: coord.x2, y: coord.y2 },
                  ],
                  pos: teeth.num,
                },
                instance.mode
              ),
            ]
          }
          break
// Fix BRIDGE click handler to use layer colors
case ODONTOGRAM_MODE_BRIDGE:
  if (
    isRectIntersect(coord, {
      x1: mouse.x,
      y1: mouse.y,
      x2: mouse.x,
      y2: mouse.y,
    })
  ) {
    if (instance.mode_bridge_coords.length == 0) {
      instance.mode_bridge_coords = [coord]
      console.log('Bridge start tooth selected:', teeth.num)
    } else {
      instance.mode_bridge_coords.push(coord)
      
      // Create bridge with layer support
      var layerOptions = { layer: CURRENT_ANNOTATION_LAYER };
      var bridgeGeom = {
        vertices: instance.mode_bridge_coords,
        pos: 'bridge-' + CURRENT_ANNOTATION_LAYER
      };
      
      tempGeoms[keyCoord] = [
        convertGeom(bridgeGeom, instance.mode),
      ]
      
      console.log('Bridge completed with layer:', CURRENT_ANNOTATION_LAYER)
      instance.mode_bridge_coords = []
    }
  }
  break;
      

        // In the _on_mouse_click function, add ORT case with surface restriction:
        case ODONTOGRAM_MODE_ORT:
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            // Get hover shapes and filter for only top and bottom surfaces
            var hoverShapes = getHoverShapeOnTeeth(mouse, teeth)
            var validShapes = []

            for (var i = 0; i < hoverShapes.length; i++) {
              if (
                hoverShapes[i].name === 'top' ||
                hoverShapes[i].name === 'bottom'
              ) {
                hoverShapes[i].pos =
                  teeth.num + '-' + hoverShapes[i].name.charAt(0).toUpperCase()
                validShapes.push(convertGeom(hoverShapes[i], instance.mode))
              }
            }

            if (validShapes.length > 0) {
              tempGeoms[keyCoord] = validShapes
            }
          }
          break
        default: // Setiap Bagian
          if (
            isRectIntersect(coord, {
              x1: mouse.x,
              y1: mouse.y,
              x2: mouse.x,
              y2: mouse.y,
            })
          ) {
            tempGeoms[keyCoord] = []
            temp = getHoverShapeOnTeeth(mouse, teeth)
            for (var i = 0; i < temp.length; i++) {
              temp[i].pos =
                teeth.num + '-' + temp[i].name.charAt(0).toUpperCase()
              tempGeoms[keyCoord].push(convertGeom(temp[i], instance.mode))
            }
          }
          break
      }
    }

    if (instance.mode == ODONTOGRAM_MODE_HAPUS) {
      for (var keyCoord in tempGeoms) {
        instance.geometry[keyCoord] = []
      }
    } else {
      instance.geometry = joinShapeTeeth(instance.geometry, tempGeoms)
    }

    $this.trigger('change', [instance.geometry])
    instance.redraw()
  }

  $.fn.odontogram.defaults = {
    width: '800px',
    height: '480px',
  }
})(jQuery);