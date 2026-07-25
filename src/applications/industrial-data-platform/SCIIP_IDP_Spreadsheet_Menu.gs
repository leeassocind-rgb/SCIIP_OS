/** Spreadsheet presentation entry point. Safe to invoke from onOpen only. */
var SCIIP_IDP_MENU_V7 = SCIIP_IDP_MENU_V7 || {};
SCIIP_IDP_MENU_V7.install = function(adapters) {
  adapters = adapters || {};
  var context = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (!context.uiAvailable) return context;
  try {
    var menu = context.ui.createMenu(SCIIP_IDP_RELEASE4_1_V7.MENU)
      .addItem('Data Sources', 'sciipOpenDataSourcesWorkspace')
      .addSeparator()
      .addItem('Data Quality', 'sciipOpenDataSourcesWorkspace')
      .addItem('What Changed', 'sciipOpenDataSourcesWorkspace')
      .addToUi();
    return SCIIP_IDP_RELEASE4_1_V7.result('MENU_INSTALLED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      menu: SCIIP_IDP_RELEASE4_1_V7.MENU,
      items: 3,
      installed: !!menu || true
    });
  } catch (error) {
    return SCIIP_IDP_RELEASE4_1_V7.result('MENU_INSTALL_FAILED', {
      uiAvailable: true,
      message: String(error && error.message ? error.message : error)
    });
  }
};
function sciipInstallDataSourcesMenu() {
  var result = SCIIP_IDP_MENU_V7.install();
  Logger.log(JSON.stringify(result));
  return result;
}
/** Simple trigger: reload the spreadsheet after deployment. */
function onOpen(e) {
  return sciipInstallDataSourcesMenu();
}
