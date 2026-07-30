'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_PROPERTY_DIGITAL_TWIN_FOUNDATION';
const VERSION = '196.49.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const props = uniqueBy(objects.filter(o => o.propertyId || o.address), o => o.propertyId || stableId('PROPERTY',[o.address,o.city]));
const twins = props.slice(0,5000).map((p,i)=>({twinId:stableId('TWIN',p.propertyId||[p.address,p.city]),propertyId:p.propertyId||stableId('PROPERTY',[p.address,p.city]),address:p.address||null,city:p.city||null,sections:['overview','timeline','infrastructure','ownership','leases','comparables','evidence','recommendations'],revision:1,eventSourced:true}));
return baseReport(FRAMEWORK, VERSION, {digitalTwins:twins.length,sectionsPerTwin:8,eventSourced:true}, {twins});

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
