/** SCIIP_OS UI compatibility facade. Canonical desktop implementation: SCIIP_DESKTOP. */
var SCIIP_UI = (function () {
  'use strict';
  function include(filename) { return HtmlService.createHtmlOutputFromFile('ui/' + filename).getContent(); }
  function bootstrap(request) { return SCIIP_DESKTOP.bootstrap(request || {}); }
  function render(event) { return SCIIP_DESKTOP.render(event || {}); }
  return {VERSION:'v7.0', VIEWS:SCIIP_DESKTOP.WORKSPACES, include:include, bootstrap:bootstrap, render:render};
})();
function sciipUi() { return SCIIP_DESKTOP.render({}); }
function sciipUiBootstrap(view) { return SCIIP_DESKTOP.bootstrap({parameter:{view:view}}); }
