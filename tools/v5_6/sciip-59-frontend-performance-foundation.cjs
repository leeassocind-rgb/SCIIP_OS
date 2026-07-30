'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_FRONTEND_PERFORMANCE_FOUNDATION';
const VERSION = '196.59.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const routes=['executive','property','graph','gis','market','ai','workflow','presentation'];
const chunks=routes.map(r=>({route:r,chunk:'v5-6-'+r,loadMode:'DYNAMIC_IMPORT',prefetch:r==='executive'}));
return baseReport(FRAMEWORK, VERSION, {routeChunks:chunks.length,dynamicImports:true,virtualizedTables:true,workerReady:true,targetInitialChunkKb:500}, {chunks});

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
