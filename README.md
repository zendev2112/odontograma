# Dental Odontogram — Clinical Charting Web App

Lightweight clinical odontogram web application for dental charting and documentation.  
Supports per‑tooth annotations, dual annotation layers, JSON export and professional A4‑style PNG report generation.

## Key features

- Dual annotation layers: Pre‑existente (red) and Requerido (blue)
- Surface‑aware treatments (FDI‑based anatomical mapping).FDI‑based anatomical mapping maps canvas positions (top/bottom/left/right/middle) to dental surfaces (vestibular, palatina/lingual, mesial, distal, oclusal/incisal) according to the tooth's FDI quadrant so mesial/distal orientation is correct.
- Per‑tooth notes with auto‑save and manual save/clear
- Export structured JSON (fecha, nombre, piezas)
- Generate A4 PNG report (odontogram + treatments + notes)
- Backend upload hook: POST to /api/upload-odontogram (PNG + JSON)

## Quick start

1. Ensure project files are served from a web server (e.g. python3 -m http.server).
2. Open the app in a browser (http://localhost:8000).
3. Verify dientes_fdi_completo.json is available next to the app.
4. Use the UI to mark treatments, add notes, export JSON or generate the PNG.

## Notes & configuration

- PNG teeth limit, column layout, fonts and odontogram scale are configurable inside generateProfessionalPNG() in dental-app.js.
- Patient name is read from the DOM or URL (recordId / id) for uploads.
- Review and implement the backend endpoint /api/upload-odontogram to handle file + JSON.

## Attribution

This project extends and is based on the jQuery odontogram plugin by Adhiana46:  
https://github.com/Adhiana46/jquery-odontogram

Please review the original repository license before redistribution.
