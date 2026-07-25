/** Epic 6 Sprint 1 Apps Script certification */
function sciipTestV7Epic6ExecutiveOperationsPortal() {
  var failures=[];
  function test_(name,condition){ if(!condition) failures.push(name); }
  var result=SCIIP_EXECUTIVE_OPERATIONS_PORTAL.snapshot({role:'EXECUTIVE'});
  var admin=SCIIP_EXECUTIVE_OPERATIONS_PORTAL.snapshot({role:'ADMIN'});
  var reviewer=SCIIP_EXECUTIVE_OPERATIONS_PORTAL.snapshot({role:'REVIEWER'});
  test_('workspace',result.workspace==='executive-operations');
  test_('status',result.status==='OPERATIONAL');
  test_('kpis',result.kpis && result.kpis.length===4);
  test_('roleAware',admin.workspaces.length>reviewer.workspaces.length);
  test_('globalSearch',result.session.globalSearch===true);
  test_('commandPalette',result.session.commandPalette===true && result.commands.length>=4);
  test_('priorities',result.priorities && result.priorities.length===3);
  test_('governance',result.governance.reviewRequired===true && result.governance.duplicateSafe===true);
  test_('lineage',result.governance.lineagePreserved===true);
  test_('destructiveDefault',result.governance.destructiveCommitEnabledByDefault===false);
  var output={framework:SCIIP_EXECUTIVE_OPERATIONS_PORTAL.FRAMEWORK,version:SCIIP_EXECUTIVE_OPERATIONS_PORTAL.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:10,failures:failures,result:{workspace:result.workspace,portalStatus:result.status,kpis:result.kpis.length,roleAwareNavigation:true,globalSearch:result.session.globalSearch,commandPalette:result.session.commandPalette,priorities:result.priorities.length,reviewRequired:result.governance.reviewRequired,lineagePreserved:result.governance.lineagePreserved,duplicateSafe:result.governance.duplicateSafe,rollbackAvailable:result.governance.rollbackAvailable,destructiveCommitEnabledByDefault:result.governance.destructiveCommitEnabledByDefault}};
  Logger.log(JSON.stringify(output));
  return output;
}
