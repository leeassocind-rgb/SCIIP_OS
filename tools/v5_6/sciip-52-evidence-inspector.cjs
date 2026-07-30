'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_EVIDENCE_INSPECTOR';
const VERSION = '196.52.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const evidence = uniqueBy(objects.filter(o=>o.evidenceId),o=>o.evidenceId).slice(0,10000).map(o=>({evidenceId:o.evidenceId,source:o.source||o.sourceFile||null,confidence:numeric(o.confidence,1),temporal:o.temporal!==false,inspectable:true}));
return baseReport(FRAMEWORK, VERSION, {evidenceItems:evidence.length,inspectable:true,traceable:true}, {evidence});

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
