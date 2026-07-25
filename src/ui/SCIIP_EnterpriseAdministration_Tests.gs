function sciipTestEnterpriseAdministrationAlphaV7() {
  var failures = [];
  var result;

  try {
    result = SCIIP_ENTERPRISE_ADMIN.getSnapshot();
  } catch (error) {
    failures.push('Snapshot threw: ' + error);
    result = null;
  }

  if (!result) failures.push('Snapshot missing.');
  if (result && result.version !== 'v7.0-alpha.1') failures.push('Unexpected version.');
  if (result && result.status !== 'OPERATIONAL' && result.status !== 'DEGRADED') failures.push('Invalid status.');
  if (result && (!result.certification || result.certification.status !== 'PRODUCTION_READY')) failures.push('Certification not resolved.');
  if (result && (!result.governance || result.governance.status !== 'PASSED')) failures.push('Governance not resolved.');
  if (result && (!result.deployment || result.deployment.deploymentFiles !== 34)) failures.push('Deployment metadata invalid.');
  if (result && (!result.storage || result.storage.backend !== 'GOOGLE_SHEETS')) failures.push('Storage backend not resolved.');
  if (result && (!result.controls || result.controls.length < 3)) failures.push('Administrative controls missing.');

  var output = {
    framework: 'SCIIP_ENTERPRISE_ADMINISTRATION_ALPHA_TEST',
    version: 'v7.0-alpha.1',
    status: failures.length ? 'FAILED' : 'PASSED',
    failures: failures,
    result: result
  };

  console.log(JSON.stringify(output));

  if (failures.length) {
    throw new Error('Enterprise Administration Alpha failed: ' + failures.join(' | '));
  }

  return output;
}
