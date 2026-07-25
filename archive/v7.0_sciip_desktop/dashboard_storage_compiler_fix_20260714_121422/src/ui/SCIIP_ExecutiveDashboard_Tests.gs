function sciipTestExecutiveDashboardAlphaV7() {
  var dashboard = SCIIP_EXECUTIVE_DASHBOARD.snapshot();
  var failures = [];
  if (dashboard.version !== 'v7.0-alpha.1') failures.push('version');
  if (!dashboard.kpis || dashboard.kpis.length !== 4) failures.push('kpis');
  if (!dashboard.certification || dashboard.certification.certified !== 12) failures.push('certification');
  if (!dashboard.systems || dashboard.systems.length < 4) failures.push('systems');
  if (!dashboard.alerts || !dashboard.alerts.length) failures.push('alerts');
  var output = {framework:'SCIIP_EXECUTIVE_DASHBOARD_ALPHA_TEST',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures:failures,result:dashboard};
  console.log(JSON.stringify(output));
  if (failures.length) throw new Error(JSON.stringify(output));
  return output;
}
