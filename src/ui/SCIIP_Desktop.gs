/** SCIIP_OS v7.0 Desktop Alpha */
var SCIIP_DESKTOP = (function () {
  'use strict';

  var VERSION = 'v7.0-alpha.2';
  var WORKSPACES = [
    {id:'executive-dashboard', label:'Executive Dashboard', description:'Platform health, release readiness, and operating signals.', capability:'dashboard'},
    {id:'property-explorer', label:'Property Explorer', description:'Search and investigate industrial properties and assets.', capability:'property'},
    {id:'knowledge-graph', label:'Knowledge Graph', description:'Explore relationships among assets, identities, events, and companies.', capability:'graph'},
    {id:'gis-workspace', label:'GIS Workspace', description:'Spatial layers, proximity analysis, and geographic intelligence.', capability:'gis'},
    {id:'ai-workspace', label:'AI Workspace', description:'Natural-language research, synthesis, and recommendations.', capability:'ai'},
    {id:'enterprise-admin', label:'Enterprise Administration', description:'Services, certification, governance, and platform configuration.', capability:'admin'}
  ];

  function safeCall_(fn, fallback) {
    try { return fn(); } catch (error) { return fallback(error); }
  }

  function findWorkspace_(id) {
    var value = String(id || 'executive-dashboard').toLowerCase();
    for (var i = 0; i < WORKSPACES.length; i += 1) {
      if (WORKSPACES[i].id === value) return WORKSPACES[i];
    }
    return WORKSPACES[0];
  }

  function serviceSnapshot_() {
    return safeCall_(function () {
      if (typeof SCIIP_SERVICE_CONTAINER === 'undefined') return {status:'UNAVAILABLE', services:[]};
      var snapshot = typeof SCIIP_SERVICE_CONTAINER.snapshot === 'function' ? SCIIP_SERVICE_CONTAINER.snapshot() : {};
      var names = [];
      for (var key in snapshot) if (Object.prototype.hasOwnProperty.call(snapshot, key)) names.push(key);
      return {status:'AVAILABLE', services:names.sort(), count:names.length};
    }, function (error) { return {status:'DEGRADED', services:[], count:0, message:String(error)}; });
  }

  function apiHealth_() {
    return safeCall_(function () {
      if (typeof SCIIP_API === 'undefined') return {status:'UNAVAILABLE'};
      return {status:'AVAILABLE', version:SCIIP_API.VERSION || 'v1'};
    }, function (error) { return {status:'DEGRADED', message:String(error)}; });
  }

  function storageHealth_() {
    return safeCall_(function () {
      if (typeof SCIIP_STORAGE_BACKEND === 'undefined') return {status:'UNAVAILABLE'};
      var backend = typeof SCIIP_STORAGE_BACKEND.getDefault === 'function' ? SCIIP_STORAGE_BACKEND.getDefault() : null;
      if (!backend) return {status:'AVAILABLE', backend:'UNRESOLVED'};
      var health = typeof backend.healthCheck === 'function' ? backend.healthCheck() : {status:'AVAILABLE'};
      return {status:health.status || 'AVAILABLE', backend:health.backend || backend.name || 'DEFAULT'};
    }, function (error) { return {status:'DEGRADED', message:String(error)}; });
  }

  function releaseStatus_() {
    return {
      status:'PRODUCTION_READY',
      baseline:'v6.1-production-ready',
      branch:'v7.0-sciip-desktop',
      certifiedDomains:12,
      blockers:0
    };
  }

  function notificationFeed_() {
    return [
      {severity:'success', title:'Production baseline protected', detail:'v6.1-production-ready is the certified rollback point.'},
      {severity:'info', title:'Desktop Alpha active', detail:'SCIIP Desktop v7.0 development branch is connected.'},
      {severity:'info', title:'Workspace contracts ready', detail:'Six application workspaces are registered for incremental delivery.'}
    ];
  }

  function bootstrap(request) {
    var parameter = request && request.parameter ? request.parameter : {};
    var workspace = findWorkspace_(parameter.view);
    var services = serviceSnapshot_();
    var api = apiHealth_();
    var storage = storageHealth_();
    var release = releaseStatus_();
    var overall = api.status === 'AVAILABLE' && release.blockers === 0 ? 'OPERATIONAL' : 'DEGRADED';
    return {
      desktopVersion:VERSION,
      platformVersion:'v7.0',
      baselineVersion:'v6.1',
      activeWorkspace:workspace.id,
      workspaces:WORKSPACES,
      session:{status:'ACTIVE', authenticationMode:'HANDOFF', user:'Current SCIIP User'},
      health:{overall:overall, api:api, storage:storage, services:services},
      release:release,
      notifications:notificationFeed_(),
      executiveDashboard:typeof SCIIP_EXECUTIVE_DASHBOARD !== 'undefined' ? SCIIP_EXECUTIVE_DASHBOARD.snapshot() : null,
      propertyExplorer:typeof SCIIP_PROPERTY_EXPLORER !== 'undefined' ? SCIIP_PROPERTY_EXPLORER.snapshot() : null,
      knowledgeGraph:typeof SCIIP_KNOWLEDGE_GRAPH_VIEWER !== 'undefined' ? SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({}) : null,
      gisWorkspace:typeof SCIIP_GIS_WORKSPACE !== 'undefined' ? SCIIP_GIS_WORKSPACE.snapshot({}) : null,
      aiWorkspace:typeof SCIIP_AI_WORKSPACE !== 'undefined' ? SCIIP_AI_WORKSPACE.snapshot() : null,
      integration:typeof SCIIP_APP_INTEGRATION !== 'undefined' ? SCIIP_APP_INTEGRATION.snapshot() : null,
      generatedAt:new Date().toISOString()
    };
  }

  function render(event) {
    var template = HtmlService.createTemplateFromFile('ui/SCIIP_UI_Shell');
    template.bootstrapJson = JSON.stringify(bootstrap(event || {})).replace(/</g, '\\u003c');
    return template.evaluate()
      .setTitle('SCIIP Desktop')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.SAMEORIGIN)
      .addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');
  }

  return {VERSION:VERSION, WORKSPACES:WORKSPACES, bootstrap:bootstrap, render:render};
})();

function sciipDesktop() { return SCIIP_DESKTOP.render({}); }
function sciipDesktopBootstrap(view) { return SCIIP_DESKTOP.bootstrap({parameter:{view:view}}); }
function sciipDesktopHealth() { return SCIIP_DESKTOP.bootstrap({}).health; }
