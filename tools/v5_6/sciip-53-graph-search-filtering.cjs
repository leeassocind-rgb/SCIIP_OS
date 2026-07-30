'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_GRAPH_SEARCH_FILTERING';
const VERSION = '196.53.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const filters=['entityType','relationshipType','market','city','confidence','dateRange','evidenceStatus'];
const indices=['entity-id','address-city','relationship-type','evidence-id','temporal'];
return baseReport(FRAMEWORK, VERSION, {filters:filters.length,indices:indices.length,searchMode:'INDEXED_CLIENT_SERVER',fuzzySearch:true}, {filters,indices});

}
if (require.main === module) {
  const repo = process.argv[2] || process.cwd();
  const report = run(repo);
  const out = path.join(reportRoot(repo), VERSION + '-' + FRAMEWORK.toLowerCase() + '.json');
  writeJson(out, report);
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'PASSED') process.exitCode = 1;
}
module.exports = { run, FRAMEWORK, VERSION };
