/** Apps Script adapter for Build 2 representative SuperSheet preview. */
var SCIIP_PROPERTY_CONTEXT_SERVICE_V7 = SCIIP_PROPERTY_CONTEXT_SERVICE_V7 || {};
SCIIP_PROPERTY_CONTEXT_SERVICE_V7.previewActiveSheet=function(){
  var sheet=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return SCIIP_PROPERTY_CONTEXT_ENGINE_V7.preview(sheet.getDataRange().getValues(),{sourceName:sheet.getName(),jobId:'PREVIEW-'+new Date().getTime()});
};
SCIIP_PROPERTY_CONTEXT_SERVICE_V7.previewAndRefresh=function(selectedPropertyId){var preview=this.previewActiveSheet();return {preview:preview,workspace:SCIIP_PROPERTY_CONTEXT_ENGINE_V7.commandRefresh(preview,selectedPropertyId)};};
SCIIP_PROPERTY_CONTEXT_SERVICE_V7.stageActiveSheet=function(){
  var preview=this.previewActiveSheet();if(preview.summary.errors>0)return {status:'REVIEW_REQUIRED',preview:preview,job:null,commitAllowed:false,destructiveCommitEnabled:false};
  var staged=sciipCreateIndustrialDataImportJobFromActiveSheet();
  return {status:'STAGED_FOR_REVIEW',preview:preview,job:staged.job,commitAllowed:false,nextAction:'OPEN_DATA_SOURCES_REVIEW',destructiveCommitEnabled:false,reviewRequired:true};
};
function sciipPreviewEpic5SuperSheetPropertyContext(){return SCIIP_PROPERTY_CONTEXT_SERVICE_V7.previewActiveSheet();}
function sciipPreviewAndRefreshEpic5PropertyCommand(selectedPropertyId){return SCIIP_PROPERTY_CONTEXT_SERVICE_V7.previewAndRefresh(selectedPropertyId);}
function sciipStageEpic5SuperSheetForReview(){return SCIIP_PROPERTY_CONTEXT_SERVICE_V7.stageActiveSheet();}
