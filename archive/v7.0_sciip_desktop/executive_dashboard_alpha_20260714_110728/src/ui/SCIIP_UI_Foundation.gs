/** SCIIP_OS v6.1 UI Foundation */
var SCIIP_UI = (function () {
  'use strict';
  var VERSION = 'v1';
  var DEFAULT_VIEW = 'executive-dashboard';
  var VIEWS = [
    {id:'executive-dashboard',label:'Executive Dashboard',icon:'dashboard',status:'FOUNDATION'},
    {id:'property-explorer',label:'Property Explorer',icon:'domain',status:'FOUNDATION'},
    {id:'knowledge-graph',label:'Knowledge Graph',icon:'hub',status:'FOUNDATION'},
    {id:'gis-workspace',label:'GIS Workspace',icon:'map',status:'FOUNDATION'},
    {id:'ai-workspace',label:'AI Workspace',icon:'auto_awesome',status:'FOUNDATION'},
    {id:'enterprise-admin',label:'Enterprise Administration',icon:'admin_panel_settings',status:'FOUNDATION'}
  ];

  function safeView_(value) {
    var id=String(value||DEFAULT_VIEW).toLowerCase();
    return VIEWS.some(function(v){return v.id===id;})?id:DEFAULT_VIEW;
  }

  function bootstrap(request) {
    var active=safeView_(request&&request.parameter&&request.parameter.view);
    var apiHealth={status:'UNKNOWN'};
    try {
      if (typeof SCIIP_API !== 'undefined') apiHealth={status:'AVAILABLE',version:SCIIP_API.VERSION};
    } catch (e) { apiHealth={status:'DEGRADED',message:String(e)}; }
    return {
      uiVersion:VERSION,
      platformVersion:'v6.1',
      activeView:active,
      views:VIEWS,
      api:apiHealth,
      accessibility:{landmarks:true,keyboardNavigation:true,focusVisible:true,reducedMotion:true},
      responsive:{mobile:true,tablet:true,desktop:true},
      authentication:{mode:'HANDOFF',configured:false},
      generatedAt:new Date().toISOString()
    };
  }

  function include(filename) {
    return HtmlService.createHtmlOutputFromFile('ui/'+filename).getContent();
  }

  function render(event) {
    var template=HtmlService.createTemplateFromFile('ui/SCIIP_UI_Shell');
    template.bootstrapJson=JSON.stringify(bootstrap(event||{})).replace(/</g,'\\u003c');
    return template.evaluate()
      .setTitle('SCIIP_OS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.SAMEORIGIN)
      .addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');
  }

  return {VERSION:VERSION,VIEWS:VIEWS,bootstrap:bootstrap,include:include,render:render};
})();

function sciipUi() { return SCIIP_UI.render({}); }
function sciipUiBootstrap(view) { return SCIIP_UI.bootstrap({parameter:{view:view}}); }
