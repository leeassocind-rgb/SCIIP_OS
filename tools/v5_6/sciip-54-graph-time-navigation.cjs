'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_GRAPH_TIME_NAVIGATION';
const VERSION = '196.54.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const modes=['CURRENT','AS_OF_DATE','BETWEEN_DATES','EVENT_REPLAY'];
return baseReport(FRAMEWORK, VERSION, {modes:modes.length,temporalGraph:true,eventReplay:true}, {modes});

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
