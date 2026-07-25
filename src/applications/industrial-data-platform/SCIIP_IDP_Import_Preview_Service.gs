/** Builds a non-destructive import preview. */
var SCIIP_IDP_PREVIEW_V7 = SCIIP_IDP_PREVIEW_V7 || {};
SCIIP_IDP_PREVIEW_V7.preview = function(values, existingKeys){
  values=values||[]; existingKeys=existingKeys||{}; if(values.length<1)return {status:'EMPTY',rows:0};
  var headers=values[0], recognition=SCIIP_IDP_IMPORT_V7.recognize(headers), mapped=SCIIP_IDP_IMPORT_V7.mapHeaders(headers), records=[], issues=[], counts={newRecords:0,updates:0,duplicates:0,errors:0,warnings:0}; var seen={};
  values.slice(1).forEach(function(row,i){var record=SCIIP_IDP_IMPORT_V7.normalizeRow(row,mapped.mapping), validation=SCIIP_IDP_IMPORT_V7.validate(record,i+2), key=SCIIP_IDP_IMPORT_V7.businessKey(record), classification='NEW'; if(seen[key]){classification='DUPLICATE_IN_FILE';counts.duplicates++;}else if(existingKeys[key]){classification='UPDATE_CANDIDATE';counts.updates++;}else{counts.newRecords++;} seen[key]=true; if(!validation.valid)counts.errors+=validation.errors.length; counts.warnings+=validation.warnings.length; if(validation.errors.length||validation.warnings.length)issues.push(validation); records.push({rowNumber:i+2,businessKey:key,classification:classification,record:record,validation:validation});});
  var required=SCIIP_IDP_V7.SCHEMA.PROPERTY.required, missingRequired=required.filter(function(f){return !mapped.mapping[f];});
  return {status:missingRequired.length?'BLOCKED':'READY_FOR_REVIEW',version:SCIIP_IDP_V7.VERSION,source:recognition,headers:headers,mapping:mapped,missingRequired:missingRequired,rows:records.length,counts:counts,records:records,issues:issues,commitAllowed:missingRequired.length===0&&counts.errors===0};
};
function sciipIndustrialDataImportPreviewFromActiveSheet(){var sheet=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();return SCIIP_IDP_PREVIEW_V7.preview(sheet.getDataRange().getValues(),{});}
