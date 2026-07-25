function sciipTestMobileUiAlphaV7() {
  var failures = [];
  var result;

  try {
    result = SCIIP_MOBILE_UI.getSnapshot();
  } catch (error) {
    failures.push('Snapshot threw: ' + error);
    result = null;
  }

  if (!result) failures.push('Snapshot missing.');
  if (result && result.version !== 'v7.0-alpha.1') failures.push('Unexpected version.');
  if (result && result.status !== 'AVAILABLE') failures.push('Mobile UI unavailable.');
  if (result && (!result.navigation || result.navigation.workspaces.length !== 6)) failures.push('Workspace navigation invalid.');
  if (result && result.accessibility.minimumTouchTargetPx < 44) failures.push('Touch target threshold too small.');
  if (result && !result.responsive.singleColumnPanels) failures.push('Single-column mobile layout missing.');
  if (result && !result.states.offline) failures.push('Offline state missing.');

  var output = {
    framework: 'SCIIP_MOBILE_UI_ALPHA_TEST',
    version: 'v7.0-alpha.1',
    status: failures.length ? 'FAILED' : 'PASSED',
    failures: failures,
    result: result
  };

  console.log(JSON.stringify(output));

  if (failures.length) {
    throw new Error('Mobile UI Alpha failed: ' + failures.join(' | '));
  }

  return output;
}
