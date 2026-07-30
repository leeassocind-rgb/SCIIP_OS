'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_CAPABILITY_REGISTRY';
const VERSION = '196.41.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const capabilities = [
  ['executive-command-center','Executive Command Center','EXECUTIVE'],
  ['property-digital-twin','Property Digital Twin','PROPERTY'],
  ['knowledge-graph-explorer','Knowledge Graph Explorer','GRAPH'],
  ['gis-intelligence-studio','GIS Intelligence Studio','GIS'],
  ['market-intelligence','Industrial Market Intelligence','MARKET'],
  ['ai-copilot','AI Copilot','AI'],
  ['workflow-center','Workflow Center','WORKFLOW'],
  ['presentation-studio','Presentation Studio','PRESENTATION']
].map(([id,label,domain], i) => ({id,label,domain,route:'/v5-6/'+id,loadMode:'LAZY',order:i+1,enabled:true}));
return baseReport(FRAMEWORK, VERSION, {capabilities:capabilities.length, lazyLoaded:capabilities.length, registryStatus:'OPERATIONAL'}, {capabilities});

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
