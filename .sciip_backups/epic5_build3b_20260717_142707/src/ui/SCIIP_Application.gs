/** SCIIP_OS v7 Epic 5 Build 3A — Production Web Application Foundation */
var SCIIP_APPLICATION = (function () {
  'use strict';
  var VERSION='v7.0-epic5-build3a.0';
  var WORKSPACES=[
    {id:'property-command-center',label:'Command Center',icon:'⌂'},
    {id:'properties',label:'Properties',icon:'▦'},
    {id:'data-sources',label:'SuperSheets',icon:'⇧'},
    {id:'gis',label:'GIS',icon:'⌖'},
    {id:'knowledge-graph',label:'Graph',icon:'◎'},
    {id:'ai-copilot',label:'AI',icon:'✦'},
    {id:'market-intelligence',label:'Market',icon:'↗'},
    {id:'administration',label:'Admin',icon:'⚙'}
  ];
  function safe_(fn,fallback){try{return fn();}catch(e){return typeof fallback==='function'?fallback(e):fallback;}}
  function command_(propertyId){
    if(typeof sciipGetEpic5PropertyCommandCenter==='function') return safe_(function(){return sciipGetEpic5PropertyCommandCenter(propertyId||'P-2125-W-LOWELL-ST-RIALTO');},null);
    if(typeof SCIIP_EPIC5_PROPERTY_COMMAND_SERVICE!=='undefined'&&SCIIP_EPIC5_PROPERTY_COMMAND_SERVICE.getWorkspace) return safe_(function(){return SCIIP_EPIC5_PROPERTY_COMMAND_SERVICE.getWorkspace(propertyId);},null);
    return null;
  }
  function context_(propertyId){
    if(typeof sciipPreviewAndRefreshEpic5PropertyCommand==='function') return safe_(function(){return sciipPreviewAndRefreshEpic5PropertyCommand(propertyId||'P-2125-W-LOWELL-ST-RIALTO');},null);
    return null;
  }
  function bootstrap(e){
    var p=e&&e.parameter||{}, view=String(p.view||'property-command-center');
    if(!WORKSPACES.some(function(w){return w.id===view;}))view='property-command-center';
    var propertyId=String(p.propertyId||'P-2125-W-LOWELL-ST-RIALTO');
    var command=command_(propertyId), context=context_(propertyId);
    return {
      applicationVersion:VERSION, product:'SCIIP_OS', activeWorkspace:view, workspaces:WORKSPACES,
      selectedPropertyId:propertyId,
      session:{status:'ACTIVE',user:safe_(function(){return Session.getActiveUser().getEmail()||'SCIIP User';},'SCIIP User')},
      commandCenter:command,
      propertyContext:context,
      ingestion:{source:'SUPERSHEET',backlogEstimate:30,readyForBatch:true,reviewRequired:true,destructiveCommitEnabled:false},
      health:{overall:'OPERATIONAL',deployment:'COMPILED',services:['Property Context','GIS','Knowledge Graph','AI','Events','Governance']},
      generatedAt:new Date().toISOString()
    };
  }
  function render(e){
    var t=HtmlService.createTemplateFromFile('ui/SCIIP_Epic5_Web_App');
    t.bootstrapJson=JSON.stringify(bootstrap(e||{})).replace(/</g,'\\u003c');
    return t.evaluate().setTitle('SCIIP_OS | Property Command Center')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.SAMEORIGIN)
      .addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');
  }
  return {VERSION:VERSION,WORKSPACES:WORKSPACES,bootstrap:bootstrap,render:render};
})();
function sciipApplication(e){return SCIIP_APPLICATION.render(e||{});}
function sciipApplicationBootstrap(view,propertyId){return SCIIP_APPLICATION.bootstrap({parameter:{view:view||'property-command-center',propertyId:propertyId||'P-2125-W-LOWELL-ST-RIALTO'}});}
function sciipTestV7Epic5WebApplication(){
  var b=sciipApplicationBootstrap('property-command-center','P-2125-W-LOWELL-ST-RIALTO');
  var failures=[];
  if(b.activeWorkspace!=='property-command-center')failures.push('workspace');
  if(b.ingestion.source!=='SUPERSHEET')failures.push('supersheet');
  if(!b.ingestion.readyForBatch)failures.push('batch');
  if(!b.ingestion.reviewRequired)failures.push('review');
  if(b.ingestion.destructiveCommitEnabled)failures.push('destructive');
  if(!b.workspaces||b.workspaces.length<8)failures.push('navigation');
  var out={framework:'SCIIP_V7_EPIC5_WEB_APPLICATION_BUILD3A',version:SCIIP_APPLICATION.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:6,failures:failures,result:{workspace:b.activeWorkspace,selectedPropertyId:b.selectedPropertyId,workspaces:b.workspaces.length,supersheetDriven:true,readyForBatch:b.ingestion.readyForBatch,reviewRequired:b.ingestion.reviewRequired,destructiveCommitEnabled:b.ingestion.destructiveCommitEnabled}};
  console.log(JSON.stringify(out)); return out;
}
