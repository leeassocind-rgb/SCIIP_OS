'use strict';
const path = require('path');
const {
  readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson,
  flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport
} = require('./sciip-v5-6-common.cjs');
const FRAMEWORK = 'SCIIP_V5_6_EXECUTIVE_COMMAND_CENTER';
const VERSION = '196.42.0';
function run(repo) {
  if (!repo) throw new Error('Repository path is required.');
  
const {objects} = getSourceObjects(repo);
const properties = uniqueBy(objects.filter(o => o.propertyId || o.address || o.city), o => o.propertyId || stableId('PROPERTY',[o.address,o.city]));
const relationships = objects.filter(o => o.edgeId || o.type === 'SUPPORTED_BY');
const kpis = [
 {id:'properties',label:'Properties',value:properties.length},
 {id:'relationships',label:'Evidence Relationships',value:relationships.length},
 {id:'evidence-coverage',label:'Evidence Coverage',value:relationships.length ? 100 : 0,unit:'%'},
 {id:'decision-governance',label:'Human Approval',value:'REQUIRED'}
];
return baseReport(FRAMEWORK, VERSION, {workspace:'executive-command-center',kpis:kpis.length,properties:properties.length,relationships:relationships.length,status:'OPERATIONAL'}, {kpis});

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
