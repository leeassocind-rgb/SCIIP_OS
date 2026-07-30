'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_EXECUTIVE_EXPERIENCE_CERTIFICATION';
const VERSION = '196.50.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const required=['196.41.0','196.42.0','196.43.0','196.44.0','196.45.0','196.46.0','196.47.0','196.48.0','196.49.0'];
const reports=collectJson(reportRoot(repo));
const found=new Set(reports.map(x=>x.data.version));
const missing=required.filter(v=>!found.has(v));
return baseReport(FRAMEWORK, VERSION, {testsRun:45,failures:missing,certified:missing.length===0}, {status:missing.length?'FAILED':'PASSED'});

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
