/** SCIIP_OS v7 — Epic 1 Release 4.1: UI Context Architecture Patch. */
var SCIIP_IDP_RELEASE4_1_V7 = SCIIP_IDP_RELEASE4_1_V7 || {};
SCIIP_IDP_RELEASE4_1_V7.VERSION = 'v7.0-epic1-release4.1';
SCIIP_IDP_RELEASE4_1_V7.WORKSPACE = 'data-sources';
SCIIP_IDP_RELEASE4_1_V7.MENU = 'SCIIP';
SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE = 'Open the bound Google Sheet and choose SCIIP → Data Sources.';
SCIIP_IDP_RELEASE4_1_V7.result = function(status, extra) {
  var out = {version: SCIIP_IDP_RELEASE4_1_V7.VERSION, status: status, workspace: SCIIP_IDP_RELEASE4_1_V7.WORKSPACE};
  Object.keys(extra || {}).forEach(function(key) { out[key] = extra[key]; });
  return out;
};
