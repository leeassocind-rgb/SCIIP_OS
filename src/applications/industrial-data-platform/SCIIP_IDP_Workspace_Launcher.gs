/** Presentation-layer launcher. No import or commit business logic lives here. */
var SCIIP_IDP_WORKSPACE_LAUNCHER_V7 = SCIIP_IDP_WORKSPACE_LAUNCHER_V7 || {};
SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open = function(adapters) {
  var context = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (!context.uiAvailable) return context;
  try {
    var htmlFactory = adapters && adapters.createHtml ? adapters.createHtml : function() {
      return HtmlService.createTemplateFromFile('SCIIP_IDP_DataSources_Workspace')
        .evaluate()
        .setTitle('SCIIP Data Sources')
        .setWidth(480);
    };
    context.ui.showSidebar(htmlFactory());
    return SCIIP_IDP_RELEASE4_1_V7.result('OPENED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      route: 'data-sources'
    });
  } catch (error) {
    return SCIIP_IDP_RELEASE4_1_V7.result('UI_OPEN_FAILED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      message: String(error && error.message ? error.message : error)
    });
  }
};
/** Backward-compatible replacement for the Release 4 launcher. */
function sciipOpenDataSourcesWorkspace() {
  var result = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open();
  Logger.log(JSON.stringify(result));
  return result;
}
function sciipLaunchDataSources() {
  return sciipOpenDataSourcesWorkspace();
}
