'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_MARKET_INTELLIGENCE_LIVE_WIRING', VERSION='196.68.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo);
const byType={};for(const e of r.events){byType[e.eventType]=(byType[e.eventType]||0)+1}
const byTransaction={};for(const c of r.comparables){const k=c.transactionType||'UNKNOWN';byTransaction[k]=(byTransaction[k]||0)+1}
const model={generatedAt:now(),events:r.events,comparables:r.comparables,summary:{eventsByType:byType,comparablesByTransaction:byTransaction}};
writeJson(path.join(reportRoot(repo),'market-intelligence-live.json'),model);
return baseReport(FRAMEWORK,VERSION,{events:r.events.length,comparables:r.comparables.length,eventTypes:Object.keys(byType).length,transactionTypes:Object.keys(byTransaction).length,liveData:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
