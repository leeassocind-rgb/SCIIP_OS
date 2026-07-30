'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_GLOBAL_COMMAND_PALETTE';
const VERSION = '196.43.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const commands = [
 ['open-executive','Open Executive Command Center','NAVIGATION'],
 ['open-property','Open Property Digital Twin','NAVIGATION'],
 ['search-graph','Search Knowledge Graph','SEARCH'],
 ['open-gis','Open GIS Intelligence Studio','NAVIGATION'],
 ['compare-properties','Compare Properties','ANALYSIS'],
 ['generate-brief','Generate Executive Brief','AI'],
 ['review-decisions','Review Decision Queue','WORKFLOW'],
 ['open-market','Open Market Intelligence','NAVIGATION']
].map(([id,label,type]) => ({id,label,type,requiresApproval:type==='WORKFLOW'}));
return baseReport(FRAMEWORK, VERSION, {commands:commands.length,searchable:true,keyboardShortcut:'CMD_K'}, {commands});

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
