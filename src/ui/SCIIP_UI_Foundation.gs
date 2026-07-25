/**
 * SCIIP_OS UI compatibility facade.
 *
 * Canonical desktop implementation: SCIIP_DESKTOP.
 * This facade preserves the governed UI foundation contract while routing
 * runtime behavior to the current desktop application.
 */
var SCIIP_UI = (function () {
  'use strict';

  var VERSION = 'v7.0';

  /*
   * Governed compatibility view registry.
   * Canonical workspace definitions remain owned by SCIIP_DESKTOP.WORKSPACES.
   */
  var FOUNDATION_VIEWS = [
    {id:'executive-dashboard', status:'FOUNDATION'},
    {id:'property-explorer', status:'FOUNDATION'},
    {id:'knowledge-graph', status:'FOUNDATION'},
    {id:'gis-workspace', status:'FOUNDATION'},
    {id:'ai-workspace', status:'FOUNDATION'},
    {id:'enterprise-administration', status:'FOUNDATION'}
  ];

  var GOVERNANCE = {
    authentication:{mode:'HANDOFF'},
    apiBinding:'SCIIP_API',
    canonicalRuntime:'SCIIP_DESKTOP'
  };

  function include(filename) {
    return HtmlService
      .createHtmlOutputFromFile('ui/' + filename)
      .getContent();
  }

  function createTemplate(filename) {
    return HtmlService.createTemplateFromFile('ui/' + filename);
  }

  function api() {
    return typeof SCIIP_API !== 'undefined' ? SCIIP_API : null;
  }

  function bootstrap(request) {
    return SCIIP_DESKTOP.bootstrap(request || {});
  }

  function render(event) {
    return SCIIP_DESKTOP.render(event || {});
  }

  return {
    VERSION: VERSION,
    VIEWS: SCIIP_DESKTOP.WORKSPACES,
    FOUNDATION_VIEWS: FOUNDATION_VIEWS,
    GOVERNANCE: GOVERNANCE,
    include: include,
    createTemplate: createTemplate,
    api: api,
    bootstrap: bootstrap,
    render: render
  };
})();

function sciipUi() {
  return SCIIP_DESKTOP.render({});
}

function sciipUiBootstrap(view) {
  return SCIIP_DESKTOP.bootstrap({
    parameter: {
      view: view
    }
  });
}
