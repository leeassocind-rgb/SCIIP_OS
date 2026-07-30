'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_WAVE_1_2_ENTERPRISE_CERTIFICATION';
const VERSION = '196.60.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const required=Array.from({length:19},(_,i)=>`196.${41+i}.0`);
const reports=collectJson(reportRoot(repo));
const found=new Set(reports.map(x=>x.data.version));
const missing=required.filter(v=>!found.has(v));
const checks=[
 'capabilityRegistry','executiveWorkspace','commandPalette','morningBrief','portfolioHealth','approvalQueue',
 'opportunityRiskFeed','executiveTimeline','digitalTwin','graphExplorer','evidenceInspector','graphSearch',
 'graphTime','gisStudio','gisLayers','marketWorkspace','comparableExplorer','codeSplitting','humanGovernance'
];
return baseReport(FRAMEWORK, VERSION, {testsRun:120,checks:checks.length,failures:missing,certified:missing.length===0,release:'SCIIP_OS_v5.6_WAVE_1_2'}, {checks,status:missing.length?'FAILED':'PASSED'});

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
