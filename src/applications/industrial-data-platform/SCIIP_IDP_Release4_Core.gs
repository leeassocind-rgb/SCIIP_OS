/** SCIIP_OS v7 — Epic 1 Release 4: Data Sources Workspace. */
var SCIIP_IDP_RELEASE4_V7 = SCIIP_IDP_RELEASE4_V7 || {};
SCIIP_IDP_RELEASE4_V7.VERSION = 'v7.0-epic1-release4.0';
SCIIP_IDP_RELEASE4_V7.WORKSPACE = 'data-sources';
SCIIP_IDP_RELEASE4_V7.safeJson = function(v,fallback){try{return JSON.parse(v||'');}catch(e){return fallback == null ? null : fallback;}};
SCIIP_IDP_RELEASE4_V7.actor = function(){try{return Session.getActiveUser().getEmail()||'UNKNOWN';}catch(e){return 'UNKNOWN';}};
SCIIP_IDP_RELEASE4_V7.now = function(){return new Date().toISOString();};
