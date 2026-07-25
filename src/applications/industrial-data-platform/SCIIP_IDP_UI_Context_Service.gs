/** Context detection kept independent of workspace business services. */
var SCIIP_IDP_UI_CONTEXT_V7 = SCIIP_IDP_UI_CONTEXT_V7 || {};
SCIIP_IDP_UI_CONTEXT_V7.inspect = function(adapters) {
  adapters = adapters || {};
  var spreadsheet = null;
  try {
    spreadsheet = (adapters.getSpreadsheet || function() { return SpreadsheetApp.getActiveSpreadsheet(); })();
  } catch (spreadsheetError) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: false,
      reason: 'SPREADSHEET_CONTEXT_UNAVAILABLE',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE
    });
  }
  if (!spreadsheet) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: false,
      reason: 'NO_ACTIVE_SPREADSHEET',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE
    });
  }
  try {
    var ui = (adapters.getUi || function() { return SpreadsheetApp.getUi(); })();
    if (!ui) throw new Error('UI provider returned no value.');
    return SCIIP_IDP_RELEASE4_1_V7.result('AVAILABLE', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: typeof spreadsheet.getId === 'function' ? spreadsheet.getId() : '',
      ui: ui
    });
  } catch (uiError) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: true,
      spreadsheetId: typeof spreadsheet.getId === 'function' ? spreadsheet.getId() : '',
      reason: 'SPREADSHEET_UI_UNAVAILABLE',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE,
      diagnostic: String(uiError && uiError.message ? uiError.message : uiError)
    });
  }
};
function sciipGetDataSourcesUiContext() {
  var result = SCIIP_IDP_UI_CONTEXT_V7.inspect();
  if (result.ui) delete result.ui;
  return result;
}
