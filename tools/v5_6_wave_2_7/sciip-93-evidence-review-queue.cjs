'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EVIDENCE_REVIEW_QUEUE',VERSION='196.93.0';
function run(repo){
const d=readJson(path.join(root(repo),'semantic-recommendation-evidence-links.json'),{links:[]});
const queue=d.links.filter(x=>!x.resolvedEvidence||x.resolutionConfidence<.7).map(x=>({queueId:stableId('EVRQ',[x.recommendationId,x.decisionId]),recommendationId:x.recommendationId||null,decisionId:x.decisionId||null,propertyId:x.propertyId||null,method:x.resolutionMethod,confidence:x.resolutionConfidence,status:'PENDING_HUMAN_REVIEW'}));
writeJson(path.join(root(repo),'evidence-review-queue.json'),{generatedAt:now(),queue});
return report(FRAMEWORK,VERSION,{queued:queue.length,humanReviewRequired:true,autonomousApproval:false});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
