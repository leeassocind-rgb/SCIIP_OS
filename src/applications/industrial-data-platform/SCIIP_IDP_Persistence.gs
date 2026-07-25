/** Append-only Apps Script persistence adapter. */
var SCIIP_IDP_PERSISTENCE_V7 = SCIIP_IDP_PERSISTENCE_V7 || {};
SCIIP_IDP_PERSISTENCE_V7.ensureSheet = function(name,headers){
  var ss=SpreadsheetApp.getActiveSpreadsheet(), sheet=ss.getSheetByName(name);
  if(!sheet)sheet=ss.insertSheet(name);
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,headers.length).setValues([headers]);
  return sheet;
};
SCIIP_IDP_PERSISTENCE_V7.appendObject = function(sheetName,headers,obj){
  var sheet=SCIIP_IDP_PERSISTENCE_V7.ensureSheet(sheetName,headers);
  sheet.appendRow(headers.map(function(h){var v=obj[h]; return v==null?'':v;}));
  return obj;
};
SCIIP_IDP_PERSISTENCE_V7.appendHistory = function(jobId,eventType,status,actor,details){
  return SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.HISTORY,SCIIP_IDP_RELEASE2_V7.HEADERS.HISTORY,{eventId:SCIIP_IDP_RELEASE2_V7.id('EVT'),jobId:jobId,eventType:eventType,status:status,actor:actor||'UNKNOWN',occurredAt:SCIIP_IDP_RELEASE2_V7.now(),detailsJson:SCIIP_IDP_RELEASE2_V7.json(details||{})});
};
