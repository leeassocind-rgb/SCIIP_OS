'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_INDUSTRIAL_MARKET_WORKSPACE';
const VERSION = '196.57.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const panels=['vacancy','leasing','sales','construction','rents','absorption','supply','demand','events','forecast'];
return baseReport(FRAMEWORK, VERSION, {panels:panels.length,workspace:'industrial-market-intelligence',crossLinkedToGraph:true,crossLinkedToGIS:true}, {panels});

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
