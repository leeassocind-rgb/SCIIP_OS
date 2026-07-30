'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EVIDENCE_DECISION_INTEGRATION', VERSION='196.66.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo); const evidence=new Map(r.evidence.map(e=>[e.evidenceId,e]));
const queue=r.recommendations.map(x=>({queueId:stableId('QUEUE',[x.recommendationId,x.decisionId]),...x,
 supportingEvidence:x.evidenceId?evidence.get(x.evidenceId)||null:null,humanApprovalRequired:true,autonomousExecution:false}));
writeJson(path.join(reportRoot(repo),'decision-queue-live.json'),{generatedAt:now(),queue});
return baseReport(FRAMEWORK,VERSION,{queued:queue.length,evidenceLinked:queue.filter(q=>q.supportingEvidence).length,humanApprovalRequired:true,autonomousExecution:false});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
