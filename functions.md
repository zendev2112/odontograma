Functions in jquery.odontogram.js
Here's a comprehensive list of all the functions in the jquery.odontogram.js file:

Shape Classes and Their Render Methods

Polygon() - Base shape class
Polygon.prototype.render() - Renders a polygon
AMF() - Amalgam filling class
AMF.prototype.render() - Renders amalgam filling
COF() - Composite filling class
COF.prototype.render() - Renders composite filling
FIS() - Fissure sealant class
FIS.prototype.render() - Renders fissure sealant
NVT() - Non-vital tooth class
NVT.prototype.render() - Renders non-vital tooth symbol
RCT() - Root canal treatment class
RCT.prototype.render() - Renders root canal treatment
NON() - Non-existent tooth class
NON.prototype.render() - Renders NEX text
UNE() - Unerupted tooth class
UNE.prototype.render() - Renders NER text
PRE() - Partially erupted tooth class
PRE.prototype.render() - Renders PER text
ANO() - Anomaly class
ANO.prototype.render() - Renders ANO text
CARIES() - Caries class
CARIES.prototype.render() - Renders caries marking
CFR() - Fracture class
CFR.prototype.render() - Renders fracture symbol
FMC() - Full metal crown class
FMC.prototype.render() - Renders full metal crown
POC() - Porcelain crown class
POC.prototype.render() - Renders porcelain crown
RRX() - Root remnant class
RRX.prototype.render() - Renders root remnant symbol
MIS() - Missing tooth class
MIS.prototype.render() - Renders missing tooth symbol
IPX() - Implant + porcelain class
IPX.prototype.render() - Renders IPP text
FRM_ACR() - Partial/full denture class
FRM_ACR.prototype.render() - Renders PPC text
BRIDGE() - Bridge class
BRIDGE.prototype.render() - Renders bridge
HAPUS() - Delete/erase class
HAPUS.prototype.render() - Renders deletion overlay
Arrow Classes

ARROW_TOP_LEFT() - Top left arrow class
ARROW_TOP_LEFT.prototype.render() - Renders top left arrow
ARROW_TOP_RIGHT() - Top right arrow class
ARROW_TOP_RIGHT.prototype.render() - Renders top right arrow
ARROW_TOP_TURN_LEFT() - Top turn left arrow class
ARROW_TOP_TURN_LEFT.prototype.render() - Renders top turn left arrow
ARROW_TOP_TURN_RIGHT() - Top turn right arrow class
ARROW_TOP_TURN_RIGHT.prototype.render() - Renders top turn right arrow
ARROW_BOTTOM_LEFT() - Bottom left arrow class
ARROW_BOTTOM_LEFT.prototype.render() - Renders bottom left arrow
ARROW_BOTTOM_RIGHT() - Bottom right arrow class
ARROW_BOTTOM_RIGHT.prototype.render() - Renders bottom right arrow
ARROW_BOTTOM_TURN_LEFT() - Bottom turn left arrow class
ARROW_BOTTOM_TURN_LEFT.prototype.render() - Renders bottom turn left arrow
ARROW_BOTTOM_TURN_RIGHT() - Bottom turn right arrow class
ARROW_BOTTOM_TURN_RIGHT.prototype.render() - Renders bottom turn right arrow
Main Odontogram Class and Methods

Odontogram() - Main odontogram class constructor
Odontogram.prototype.setMode() - Sets the current drawing mode
Odontogram.prototype.\_sideTeeth() - Draws side teeth
Odontogram.prototype.\_centerTeeth() - Draws center teeth
Odontogram.prototype.\_drawBackground() - Draws the teeth layout background
Odontogram.prototype.redraw() - Redraws the canvas
Odontogram.prototype.setGeometry() - Sets geometry data
Odontogram.prototype.search() - Searches for teeth by properties
Odontogram.prototype.setGeometryByPos() - Sets geometry by position
Odontogram.prototype.getDataURL() - Gets the canvas as data URL
Arrow Drawing Functions

top_leftArrow() - Draws a top left arrow
top_rightArrow() - Draws a top right arrow
top_turnLeftArrow() - Draws a top turn left arrow
top_turnRightArrow() - Draws a top turn right arrow
bottom_leftArrow() - Draws a bottom left arrow
bottom_rightArrow() - Draws a bottom right arrow
bottom_turnLeftArrow() - Draws a bottom turn left arrow
bottom_turnRightArrow() - Draws a bottom turn right arrow
jQuery Plugin Functions

$.fn.odontogram() - Main jQuery plugin method
initialize() - Initializes the odontogram
setMode() - Sets the current mode
redraw() - Redraws the odontogram
checkOdontogram() - Validates if an element is an odontogram
Helper Functions

convertGeom() - Converts geometry to specific mode
convertGeomFromObject() - Converts object to appropriate geometry class
getHoverShapeOnTeeth() - Gets hover shape on teeth
isRectIntersect() - Checks if rectangles intersect
isPolyIntersect() - Checks if a point is inside a polygon
parseKeyCoord() - Parses coordinate key string
joinShapeTeeth() - Joins shapes on teeth
\_joinShapeTeeth() - Helper for joining shapes with rules
getMouse() - Gets mouse coordinates from event
Event Handlers

\_on_mouse_move() - Handles mouse movement
\_on_mouse_click() - Handles mouse clicks
