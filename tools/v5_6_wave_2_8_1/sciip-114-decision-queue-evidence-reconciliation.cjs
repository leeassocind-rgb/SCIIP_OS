'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_DECISION_QUEUE_EVIDENCE_RECONCILIATION',VERSION='197.14.0';
function run(repo){
const queue=readJson(path.join(repo,'reports','release-5.6','wave-2.5','decision-queue-live.json'),{queue:[]});
const d=readJson(path.join(waveRoot(repo),'recommendation-evidence-bundles.json'),{links:[]});
const byRec=new Map(d.links.map(x=>[x.recommendationId,x]));
const reconciled=(queue.queue||[]).map(q=>{
 const link=byRec.get(q.recommendationId);
 return {...q,
  evidenceId:link?.primaryEvidenceId||q.evidenceId||null,
  supportingEvidence:link?link.evidenceIds:[],
  evidenceCount:link?.evidenceCount||0,
  evidenceResolutionMethod:link?.method||'UNRESOLVED',
  evidenceResolutionConfidence:link?.confidence||0,
  humanApprovalRequired:true,
  autonomousExecution:false
 };
});
writeJson(path.join(waveRoot(repo),'decision-queue-evidence-reconciled.json'),{generatedAt:now(),queue:reconciled});
return base(FRAMEWORK,VERSION,{queue:reconciled.length,withEvidence:reconciled.filter(x=>x.evidenceCount>0).length,withoutEvidence:reconciled.filter(x=>!x.evidenceCount).length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
