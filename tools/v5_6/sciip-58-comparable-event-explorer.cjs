'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_COMPARABLE_EVENT_EXPLORER';
const VERSION = '196.58.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects}=getSourceObjects(repo);
const comps=objects.filter(o=>o.compRate!==undefined || o.salePrice!==undefined || o.leaseRate!==undefined || o.transactionType).slice(0,10000);
const events=objects.filter(o=>o.eventId || o.eventType).slice(0,10000);
return baseReport(FRAMEWORK, VERSION, {comparables:comps.length,events:events.length,timelineEnabled:true,mapLinked:true});

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
