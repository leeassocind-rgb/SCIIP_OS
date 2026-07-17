/** SCIIP_OS v7.0 Property Explorer Alpha Apps Script regression. */
function sciipTestPropertyExplorerAlphaV7() {
  var result = SCIIP_PROPERTY_EXPLORER.snapshot();
  var failures = [];
  if (!result || result.status !== 'AVAILABLE') failures.push('Property Explorer did not report AVAILABLE.');
  if (!result.results || result.results.length < 1) failures.push('Property Explorer returned no records.');
  if (!result.facets || !result.facets.cities) failures.push('City facets are missing.');
  if (typeof sciipPropertyExplorerSearch !== 'function') failures.push('Search entry point is missing.');
  var filtered = SCIIP_PROPERTY_EXPLORER.search({query:'Rialto'});
  if (!filtered.results || filtered.results.length < 1) failures.push('Query filtering failed.');
  var output = {framework:'SCIIP_PROPERTY_EXPLORER_ALPHA_TEST',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures:failures,result:result};
  console.log(JSON.stringify(output));
  if (failures.length) throw new Error(failures.join(' | '));
  return output;
}
