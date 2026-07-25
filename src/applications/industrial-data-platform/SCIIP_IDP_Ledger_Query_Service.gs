/** Read-only ledger query adapter for the product workspace. */
var SCIIP_IDP_LEDGER_QUERY_V7 = SCIIP_IDP_LEDGER_QUERY_V7 || {};
SCIIP_IDP_LEDGER_QUERY_V7.rows = function(sheetName){
  var ss=SpreadsheetApp.getActiveSpreadsheet(),s=ss.getSheetByName(sheetName); if(!s||s.getLastRow()<2)return [];
  var vals=s.getDataRange().getValues(),h=vals.shift(); return vals.map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});
};
SCIIP_IDP_LEDGER_QUERY_V7.latestBy = function(rows,key){var out={};(rows||[]).forEach(function(r){out[String(r[key])]=r;});return out;};
SCIIP_IDP_LEDGER_QUERY_V7.jobs = function(){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.JOBS).sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});};
SCIIP_IDP_LEDGER_QUERY_V7.job = function(jobId){var jobs=SCIIP_IDP_LEDGER_QUERY_V7.jobs();for(var i=0;i<jobs.length;i++)if(String(jobs[i].jobId)===String(jobId))return jobs[i];return null;};
SCIIP_IDP_LEDGER_QUERY_V7.records = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.RECORDS).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.decisions = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.DECISIONS).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.matches = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.ENTITY_MATCHES).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.plans = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.COMMIT_PLANS).filter(function(r){return !jobId||String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.executions = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.EXECUTIONS).filter(function(r){return !jobId||String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.history = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.HISTORY).filter(function(r){return !jobId||String(r.jobId)===String(jobId);}).sort(function(a,b){return String(b.occurredAt).localeCompare(String(a.occurredAt));});};
SCIIP_IDP_LEDGER_QUERY_V7.current = function(){return Object.keys(SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.CURRENT),'businessKey')).map(function(k){return SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.CURRENT),'businessKey')[k];});};
