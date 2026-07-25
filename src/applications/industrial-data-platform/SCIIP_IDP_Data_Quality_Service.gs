/** Computes transparent data-quality KPIs from persisted ledgers. */
var SCIIP_IDP_DATA_QUALITY_V7 = SCIIP_IDP_DATA_QUALITY_V7 || {};
SCIIP_IDP_DATA_QUALITY_V7.calculate = function(jobs,currentRows){
  jobs=jobs||[];currentRows=currentRows||[];var missingCoordinates=0,missingApn=0,blocked=0,warnings=0,errors=0,active=0;
  currentRows.forEach(function(r){var x=SCIIP_IDP_RELEASE4_V7.safeJson(r.recordJson,{});if(x.lifecycleState==='ARCHIVED'||r.lifecycleState==='ARCHIVED')return;active++;if(!x.apn)missingApn++;if(!isFinite(Number(x.latitude))||!isFinite(Number(x.longitude)))missingCoordinates++;});
  jobs.forEach(function(j){warnings+=Number(j.warningCount)||0;errors+=Number(j.errorCount)||0;if(String(j.status)==='BLOCKED')blocked++;});
  var penalties=Math.min(100,missingCoordinates*2+missingApn+errors*5+blocked*10);return {score:Math.max(0,100-penalties),properties:active,imports:jobs.length,blockedImports:blocked,validationErrors:errors,warnings:warnings,missingCoordinates:missingCoordinates,missingApns:missingApn,status:penalties===0?'HEALTHY':(penalties<20?'WATCH':'ATTENTION_REQUIRED')};
};
