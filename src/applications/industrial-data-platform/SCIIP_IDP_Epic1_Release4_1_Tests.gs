function sciipTestV7Epic1Release4_1UiContextArchitecture() {
  var failures = [];
  var fakeSheet = {getId: function() { return 'SHEET-1'; }};
  var sidebarShown = false;
  var menuAdded = false;
  var fakeUi = {
    showSidebar: function(html) { sidebarShown = !!html; },
    createMenu: function(name) {
      if (name !== 'SCIIP') failures.push('Menu name failed.');
      return {
        addItem: function() { return this; },
        addSeparator: function() { return this; },
        addToUi: function() { menuAdded = true; return this; }
      };
    }
  };
  var adapters = {getSpreadsheet: function() { return fakeSheet; }, getUi: function() { return fakeUi; }};
  var available = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (available.status !== 'AVAILABLE' || !available.uiAvailable) failures.push('Available UI context failed.');
  var headless = SCIIP_IDP_UI_CONTEXT_V7.inspect({getSpreadsheet: function() { return fakeSheet; }, getUi: function() { throw new Error('Cannot call SpreadsheetApp.getUi() from this context.'); }});
  if (headless.status !== 'NO_UI_CONTEXT' || headless.reason !== 'SPREADSHEET_UI_UNAVAILABLE') failures.push('Headless diagnostic failed.');
  var noSheet = SCIIP_IDP_UI_CONTEXT_V7.inspect({getSpreadsheet: function() { return null; }});
  if (noSheet.reason !== 'NO_ACTIVE_SPREADSHEET') failures.push('No spreadsheet diagnostic failed.');
  var opened = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open({getSpreadsheet: adapters.getSpreadsheet, getUi: adapters.getUi, createHtml: function() { return {html: true}; }});
  if (opened.status !== 'OPENED' || !sidebarShown) failures.push('Sidebar launcher failed.');
  var safeHeadless = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open({getSpreadsheet: adapters.getSpreadsheet, getUi: function() { throw new Error('No UI'); }});
  if (safeHeadless.status !== 'NO_UI_CONTEXT') failures.push('Safe headless launcher failed.');
  var menu = SCIIP_IDP_MENU_V7.install(adapters);
  if (menu.status !== 'MENU_INSTALLED' || !menuAdded) failures.push('Menu installation failed.');
  var result = {
    framework: 'SCIIP_V7_EPIC_1_RELEASE_4_1_UI_CONTEXT_ARCHITECTURE',
    version: SCIIP_IDP_RELEASE4_1_V7.VERSION,
    status: failures.length ? 'FAILED' : 'PASSED',
    testsRun: 7,
    failures: failures,
    result: {
      contextSafe: true,
      menuReady: true,
      sidebarReady: true,
      headlessDiagnostic: safeHeadless.status,
      workspace: SCIIP_IDP_RELEASE4_1_V7.WORKSPACE,
      businessLogicUiIndependent: true
    }
  };
  Logger.log(JSON.stringify(result));
  if (failures.length) throw new Error(failures.join(' | '));
  return result;
}
