'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_GIS_LAYER_REGISTRY';
const VERSION = '196.56.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const layers=[
 ['properties','Properties','POINT'],['parcels','Parcels','POLYGON'],['power','Electrical Capacity','POINT'],
 ['rail','Rail','LINE'],['ports','Ports','POINT'],['airports','Airports','POINT'],['comparables','Comparables','POINT'],
 ['competition','Competition','POINT'],['heatmap','Market Heat Map','HEATMAP'],['isochrones','Drive-Time Isochrones','POLYGON']
].map(([id,label,geometry],i)=>({id,label,geometry,enabled:i<3,lazy:true}));
return baseReport(FRAMEWORK, VERSION, {layers:layers.length,lazyLayers:layers.filter(x=>x.lazy).length}, {layers});

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
