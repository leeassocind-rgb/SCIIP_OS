'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EXECUTIVE_DASHBOARD_LIVE_WIRING', VERSION='196.64.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo);
const kpis=[
 {id:'properties',label:'Properties',value:r.properties.length},
 {id:'relationships',label:'Evidence Relationships',value:r.relationships.length},
 {id:'evidence',label:'Evidence Items',value:r.evidence.length},
 {id:'pending-decisions',label:'Pending Decisions',value:r.recommendations.filter(x=>x.status==='PENDING_REVIEW').length},
 {id:'opportunities',label:'Opportunities',value:r.recommendations.filter(x=>x.score>=70).length},
 {id:'market-events',label:'Market Events',value:r.events.length},
 {id:'comparables',label:'Comparables',value:r.comparables.length},
 {id:'gis-features',label:'GIS Features',value:r.gis.length}
];
writeJson(path.join(reportRoot(repo),'executive-dashboard-live.json'),{generatedAt:now(),kpis});
return baseReport(FRAMEWORK,VERSION,{kpis:kpis.length,nonZeroKpis:kpis.filter(k=>Number(k.value)>0).length,liveData:true},{kpis});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
