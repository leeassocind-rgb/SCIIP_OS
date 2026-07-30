'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_EXECUTIVE_TIMELINE';
const VERSION = '196.48.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const events = objects.filter(o => o.generatedAt || o.date || o.timestamp).slice(0,5000).map((o,i)=>({timelineId:stableId('TIME',[i,o.id||o.propertyId||o.eventId]),occurredAt:o.generatedAt||o.date||o.timestamp,eventType:o.eventType||o.type||'INTELLIGENCE_EVENT',entityId:o.propertyId||o.id||null,evidenceId:o.evidenceId||null}));
events.sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt)));
return baseReport(FRAMEWORK, VERSION, {events:events.length,chronological:true,evidenceLinked:events.filter(x=>x.evidenceId).length}, {events});

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
