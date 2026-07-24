/** SCIIP_OS v7 Epic 5 — Property Command Center pure composition core. */
var SCIIP_PROPERTY_COMMAND_V7 = SCIIP_PROPERTY_COMMAND_V7 || {};
SCIIP_PROPERTY_COMMAND_V7.VERSION = 'v7.0-epic5-build1.0';
SCIIP_PROPERTY_COMMAND_V7.WORKSPACE = 'property-command-center';
SCIIP_PROPERTY_COMMAND_V7.safeJson = function(value,fallback){try{return typeof value==='string'?JSON.parse(value):value;}catch(e){return fallback;}};
SCIIP_PROPERTY_COMMAND_V7.norm = function(value){return String(value==null?'':value).trim();};
SCIIP_PROPERTY_COMMAND_V7.propertyId = function(record){record=record||{};return SCIIP_PROPERTY_COMMAND_V7.norm(record.propertyId||record.Property_ID||record.assetId||record.Asset_ID||record.businessKey||record.Business_Key);};
SCIIP_PROPERTY_COMMAND_V7.address = function(record){record=record||{};return SCIIP_PROPERTY_COMMAND_V7.norm(record.address||record.Address||record.propertyAddress||record['Property Address']);};
SCIIP_PROPERTY_COMMAND_V7.project = function(input){
  input=input||{};var current=input.current||[],selectedId=SCIIP_PROPERTY_COMMAND_V7.norm(input.selectedPropertyId),selected=null;
  for(var i=0;i<current.length;i++){if(!selected&&(!selectedId||SCIIP_PROPERTY_COMMAND_V7.propertyId(current[i])===selectedId))selected=current[i];}
  var id=selected?SCIIP_PROPERTY_COMMAND_V7.propertyId(selected):selectedId;
  var history=(input.history||[]).filter(function(e){var eid=SCIIP_PROPERTY_COMMAND_V7.norm(e.propertyId||e.Property_ID||e.assetId||e.Asset_ID||e.businessKey||e.Business_Key);return !id||!eid||eid===id;});
  var jobs=input.jobs||[],latestJob=jobs.length?jobs[0]:null,exceptions=(input.exceptions||[]).filter(function(x){return String(x.status||x.reviewStatus||'').toUpperCase().indexOf('BLOCK')>=0||String(x.status||x.reviewStatus||'').toUpperCase().indexOf('HOLD')>=0;});
  var ingestionStatus=!latestJob?'NO_IMPORTS':(exceptions.length?'REVIEW_REQUIRED':String(latestJob.status||'UNKNOWN'));
  var readiness={importsAvailable:jobs.length>0,propertyAvailable:!!selected,exceptions:exceptions.length,readyForBatch:jobs.length>0&&!!selected&&exceptions.length===0};
  return {version:SCIIP_PROPERTY_COMMAND_V7.VERSION,status:selected?'AVAILABLE':'EMPTY',workspace:SCIIP_PROPERTY_COMMAND_V7.WORKSPACE,selectedPropertyId:id,property:selected||null,propertyHeader:selected?{propertyId:id,address:SCIIP_PROPERTY_COMMAND_V7.address(selected),city:selected.city||selected.City||'',buildingSf:selected.buildingSf||selected['Building SF']||selected.Building_SF||'',status:selected.status||selected.Status||''}:null,ingestion:{status:ingestionStatus,latestJob:latestJob,jobCount:jobs.length,exceptionCount:exceptions.length,readyForBatch:readiness.readyForBatch},digitalTwin:{state:selected||null,timeline:history.slice(0,50)},gis:{propertyId:id,latitude:selected&&(selected.latitude||selected.Latitude)||'',longitude:selected&&(selected.longitude||selected.Longitude)||'',action:'OPEN_GIS'},knowledgeGraph:{propertyId:id,action:'OPEN_KNOWLEDGE_GRAPH'},ai:{propertyId:id,action:'GENERATE_PROPERTY_BRIEFING',evidenceRequired:true},marketIntelligence:{propertyId:id,events:history.slice(0,20)},governedActions:['REFRESH','OPEN_GIS','OPEN_KNOWLEDGE_GRAPH','GENERATE_PROPERTY_BRIEFING','REVIEW_IMPORT_EXCEPTIONS','CREATE_IMPORT_FROM_ACTIVE_SHEET'],readiness:readiness,destructiveCommitEnabled:false,reviewRequired:true};
};
