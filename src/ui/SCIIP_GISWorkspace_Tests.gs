/** SCIIP_OS v7.0 GIS Workspace Alpha Apps Script regression. */
function sciipTestGisWorkspaceAlphaV7() {
  var result = SCIIP_GIS_WORKSPACE.snapshot({});
  var failures = [];
  if (!result || result.status !== 'AVAILABLE') failures.push('GIS Workspace did not report AVAILABLE.');
  if (!result.features || result.features.length < 1) failures.push('No GIS features were returned.');
  if (result.mapReady !== result.featureCount) failures.push('Map-ready count does not match feature count.');
  if (!result.bounds || typeof result.bounds.centerLatitude !== 'number') failures.push('Map bounds are missing.');
  if (!result.facets || !result.facets.layers || result.facets.layers.length < 1) failures.push('Layer facets are missing.');
  if (typeof sciipGisWorkspaceSnapshot !== 'function') failures.push('GIS snapshot entry point is missing.');
  if (typeof sciipGisWorkspaceFeature !== 'function') failures.push('GIS feature entry point is missing.');
  for (var i=0;i<result.features.length;i+=1) {
    if (!SCIIP_GIS_WORKSPACE.isValidCoordinate(result.features[i].latitude,result.features[i].longitude)) failures.push('Invalid coordinate for '+result.features[i].id);
  }
  var selected = SCIIP_GIS_WORKSPACE.feature(result.features[0].id);
  if (!selected || selected.id !== result.features[0].id) failures.push('Feature lookup failed.');
  var output={framework:'SCIIP_GIS_WORKSPACE_ALPHA_TEST',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures:failures,result:result,selected:selected};
  console.log(JSON.stringify(output));
  if(failures.length) throw new Error(failures.join(' | '));
  return output;
}
