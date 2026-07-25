/** SCIIP v7 Epic 2 Release 1 — Product Application + Data Sources */
var SCIIP_APPLICATION = (function () {
  'use strict';
  var VERSION = 'v7.0-epic2-release2.0';
  var WORKSPACES = [
    {id:'dashboard',label:'Dashboard',description:'Market activity, data health, imports, and operating priorities.',capability:'dashboard'},
    {id:'properties',label:'Properties',description:'Search and investigate industrial properties.',capability:'property'},
    {id:'companies',label:'Companies',description:'Owners, tenants, brokers, and industrial companies.',capability:'company'},
    {id:'data-sources',label:'Data Sources',description:'Upload, review, approve, commit, and audit industrial data.',capability:'data'},
    {id:'gis',label:'GIS',description:'Map properties, tenants, comparables, and market layers.',capability:'gis'},
    {id:'knowledge-graph',label:'Knowledge Graph',description:'Explore relationships among properties, companies, people, and events.',capability:'graph'},
    {id:'ai-copilot',label:'AI Copilot',description:'Ask grounded questions across the SCIIP industrial database.',capability:'ai'},
    {id:'reports',label:'Reports',description:'Generate market surveys, owner updates, and analysis packages.',capability:'reports'},
    {id:'administration',label:'Administration',description:'Data governance, services, users, and platform health.',capability:'admin'}
  ];
  function safe_(fn,fallback){try{return fn();}catch(e){return typeof fallback==='function'?fallback(e):fallback;}}
  function sheetRows_(name){return safe_(function(){var ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss)return[];var sh=ss.getSheetByName(name);if(!sh||sh.getLastRow()<2)return[];var v=sh.getDataRange().getValues(),h=v.shift().map(String);return v.map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});},[]);}
  function countBy_(rows,key){var out={};rows.forEach(function(r){var v=String(r[key]||'UNKNOWN');out[v]=(out[v]||0)+1;});return out;}
  function dataSources_(){
    var jobs=sheetRows_('SCIIP_IDP_IMPORT_JOBS');
    var records=sheetRows_('SCIIP_IDP_IMPORT_RECORDS');
    var decisions=sheetRows_('SCIIP_IDP_REVIEW_DECISIONS');
    var executions=sheetRows_('SCIIP_IDP_COMMIT_EXECUTIONS');
    var quality=100;
    var warnings=records.filter(function(r){return String(r.validationStatus||r.Validation_Status||'').toUpperCase().indexOf('WARN')>=0;}).length;
    var errors=records.filter(function(r){return String(r.validationStatus||r.Validation_Status||'').toUpperCase().indexOf('ERROR')>=0;}).length;
    if(records.length) quality=Math.max(0,Math.round(100-((warnings*2+errors*8)/records.length)));
    return {
      status:'AVAILABLE',qualityScore:quality,
      counts:{jobs:jobs.length,records:records.length,decisions:decisions.length,commits:executions.length,warnings:warnings,errors:errors},
      jobs:jobs.slice(-25).reverse(),statuses:countBy_(jobs,'status'),
      historicalBacklog:(typeof SCIIP_HISTORICAL_MIGRATION_V7!=='undefined'?SCIIP_HISTORICAL_MIGRATION_V7.snapshot():{status:'READY',label:'Supersheets saved since June',queueMode:'DRIVE_FOLDER_OR_FILE_IDS',batchSafe:true,files:[],waves:[],counts:{}}),
      actions:['UPLOAD_SOURCE','REGISTER_DRIVE_FOLDER','PLAN_WAVES','STAGE_WAVE','CREATE_IMPORT_JOB','REVIEW_RECORDS','PREPARE_COMMIT','EXECUTE_COMMIT','ROLLBACK']
    };
  }
  function dashboard_(){var ds=dataSources_();return {kpis:[
    {label:'Database Health',value:ds.qualityScore+'%',detail:ds.counts.errors+' errors · '+ds.counts.warnings+' warnings'},
    {label:'Import Jobs',value:ds.counts.jobs,detail:ds.counts.records+' staged records'},
    {label:'Committed Imports',value:ds.counts.commits,detail:'Governed transactions'},
    {label:'Historical Backlog',value:'Ready',detail:'Saved Supersheets can be queued'}
  ]};}
  function bootstrap(e){var p=e&&e.parameter||{},view=String(p.view||'dashboard');if(!WORKSPACES.some(function(w){return w.id===view;}))view='dashboard';return {
    applicationVersion:VERSION,product:'SCIIP',platform:'SCIIP_OS',activeWorkspace:view,workspaces:WORKSPACES,
    session:{status:'ACTIVE',authenticationMode:'GOOGLE_IDENTITY',user:safe_(function(){return Session.getActiveUser().getEmail()||'SCIIP User';},'SCIIP User')},
    dashboard:dashboard_(),dataSources:dataSources_(),
    propertyExplorer:typeof SCIIP_PROPERTY_EXPLORER!=='undefined'?SCIIP_PROPERTY_EXPLORER.snapshot():null,
    gisWorkspace:typeof SCIIP_GIS_WORKSPACE!=='undefined'?SCIIP_GIS_WORKSPACE.snapshot({}):null,
    generatedAt:new Date().toISOString()
  };}
  function render(e){var t=HtmlService.createTemplateFromFile('ui/SCIIP_Application_Shell');t.bootstrapJson=JSON.stringify(bootstrap(e||{})).replace(/</g,'\\u003c');return t.evaluate().setTitle('SCIIP | Industrial Real Estate Operating System').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.SAMEORIGIN).addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');}
  return {VERSION:VERSION,WORKSPACES:WORKSPACES,bootstrap:bootstrap,render:render,dataSources:dataSources_};
})();
function sciipApplication(e){return SCIIP_APPLICATION.render(e||{});}
function sciipApplicationBootstrap(view){return SCIIP_APPLICATION.bootstrap({parameter:{view:view||'dashboard'}});}
function sciipApplicationDataSources(){return SCIIP_APPLICATION.dataSources();}
