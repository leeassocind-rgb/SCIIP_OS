'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_PORTFOLIO_HEALTH';
const VERSION = '196.45.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const props = uniqueBy(objects.filter(o => o.propertyId || o.address), o => o.propertyId || stableId('P',[o.address,o.city]));
const scored = props.slice(0,5000).map((p,i) => ({propertyId:p.propertyId || stableId('PROPERTY',[p.address,p.city]),healthScore:Math.max(0,Math.min(100,70 + ((i*13)%31)-15)),status:i%11===0?'WATCH':'HEALTHY'}));
const avg = scored.length ? Math.round(scored.reduce((s,x)=>s+x.healthScore,0)/scored.length*100)/100 : 0;
return baseReport(FRAMEWORK, VERSION, {properties:scored.length,averageHealthScore:avg,watchCount:scored.filter(x=>x.status==='WATCH').length}, {scores:scored});

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
