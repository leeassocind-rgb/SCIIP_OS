'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_EXECUTIVE_MORNING_BRIEF';
const VERSION = '196.44.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const signals = objects.filter(o => o.eventId || o.signalId || o.recommendationId).slice(0,25);
const sections = [
 {id:'market-pulse',title:'Market Pulse',items:signals.slice(0,5)},
 {id:'portfolio',title:'Portfolio Watch',items:signals.slice(5,10)},
 {id:'opportunities',title:'Top Opportunities',items:signals.slice(10,15)},
 {id:'risks',title:'Priority Risks',items:signals.slice(15,20)},
 {id:'decisions',title:'Decisions Requiring Review',items:signals.slice(20,25)}
];
return baseReport(FRAMEWORK, VERSION, {sections:sections.length,sourceSignals:signals.length,humanReviewRequired:true}, {sections});

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
