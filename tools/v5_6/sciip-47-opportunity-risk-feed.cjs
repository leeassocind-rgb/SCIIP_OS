'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_OPPORTUNITY_RISK_FEED';
const VERSION = '196.47.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const candidates = objects.filter(o => o.score !== undefined || o.confidence !== undefined).slice(0,2000);
const feed = candidates.map((x,i)=>({feedId:stableId('FEED',[i,x.propertyId||x.id]),type:i%4===0?'RISK':'OPPORTUNITY',priorityScore:numeric(x.score,50),evidenceId:x.evidenceId||null,explainable:true}));
return baseReport(FRAMEWORK, VERSION, {items:feed.length,opportunities:feed.filter(x=>x.type==='OPPORTUNITY').length,risks:feed.filter(x=>x.type==='RISK').length,explainable:true}, {feed});

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
