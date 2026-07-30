'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_KNOWLEDGE_GRAPH_EXPLORER';
const VERSION = '196.51.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const edges = objects.filter(o => o.edgeId && o.from && o.to).slice(0,20000);
const nodeIds = new Set(); edges.forEach(e=>{nodeIds.add(e.from);nodeIds.add(e.to)});
return baseReport(FRAMEWORK, VERSION, {nodes:nodeIds.size,edges:edges.length,interactive:true,virtualized:true}, {graph:{nodeCount:nodeIds.size,edgeCount:edges.length}});

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
