function sciipTestUiFoundationPhase7D() {
  var bootstrap=SCIIP_UI.bootstrap({parameter:{view:'gis-workspace'}});
  var failures=[];
  if (SCIIP_UI.VERSION!=='v1') failures.push('version');
  if (!bootstrap.views || bootstrap.views.length<6) failures.push('views');
  if (bootstrap.activeView!=='gis-workspace') failures.push('routing');
  if (!bootstrap.accessibility || !bootstrap.accessibility.keyboardNavigation) failures.push('accessibility');
  if (!bootstrap.responsive || !bootstrap.responsive.mobile) failures.push('responsive');
  if (!bootstrap.authentication || bootstrap.authentication.mode!=='HANDOFF') failures.push('auth-handoff');
  return {framework:'SCIIP_UI_CERTIFICATION',version:'v6.1-phase7d',status:failures.length?'FAILED':'PASSED',failures:failures,bootstrap:bootstrap};
}
