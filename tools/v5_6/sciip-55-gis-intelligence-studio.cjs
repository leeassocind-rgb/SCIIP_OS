'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_GIS_INTELLIGENCE_STUDIO';
const VERSION = '196.55.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects}=getSourceObjects(repo);
const features=objects.filter(o=>numeric(o.latitude,999)<=90 && numeric(o.longitude,999)<=180).slice(0,20000);
return baseReport(FRAMEWORK, VERSION, {features:features.length,mapMode:'VECTOR',clustering:true,layerControl:true,scenarioSupport:true});

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
