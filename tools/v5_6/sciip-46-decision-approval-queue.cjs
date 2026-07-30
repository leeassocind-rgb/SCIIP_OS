'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_DECISION_APPROVAL_QUEUE';
const VERSION = '196.46.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const recs = objects.filter(o => o.recommendationId || o.decisionId).slice(0,1000);
const queue = recs.map((r,i)=>({queueId:stableId('QUEUE',[r.recommendationId||r.decisionId,i]),sourceId:r.recommendationId||r.decisionId,priority:i%5===0?'HIGH':'NORMAL',status:'PENDING_REVIEW',humanApprovalRequired:true,autonomousExecution:false}));
return baseReport(FRAMEWORK, VERSION, {queued:queue.length,pendingReview:queue.length,humanApprovalRequired:true,autonomousExecution:false}, {queue});

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
