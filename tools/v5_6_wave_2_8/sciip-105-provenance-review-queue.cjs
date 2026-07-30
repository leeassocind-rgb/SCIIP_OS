'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROVENANCE_REVIEW_QUEUE',VERSION='197.05.0';
function run(repo){
const d=readJson(path.join(reportRoot(repo),'reconstructed-recommendation-evidence-links.json'),{links:[]});
const queue=d.links.filter(x=>x.status!=='RESOLVED'||x.confidence<.9).map(x=>({queueId:stableId('PROVQ',[x.recommendationId,x.evidenceId]),recommendationId:x.recommendationId,evidenceId:x.evidenceId,method:x.method,confidence:x.confidence,status:'PENDING_HUMAN_REVIEW'}));
writeJson(path.join(reportRoot(repo),'provenance-review-queue.json'),{generatedAt:now(),queue});
return baseReport(FRAMEWORK,VERSION,{queued:queue.length,humanReviewRequired:true,autonomousApproval:false});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
