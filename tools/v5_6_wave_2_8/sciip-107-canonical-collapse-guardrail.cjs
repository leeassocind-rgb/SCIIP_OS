'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_CANONICAL_COLLAPSE_GUARDRAIL',VERSION='197.07.0';
function run(repo){
const reg=readJson(path.join(repo,'reports','release-5.6','wave-2.6','canonical-property-registry.json'),{properties:[]});
const queue=(reg.properties||[]).filter(x=>Number(x.aliasCount||0)>10).map(x=>({canonicalPropertyId:x.canonicalPropertyId,address:x.address,city:x.city,aliasCount:x.aliasCount,sourcePropertyIds:x.sourcePropertyIds||[],risk:Number(x.aliasCount||0)>50?'HIGH':'REVIEW',status:'PENDING_HUMAN_REVIEW'}));
writeJson(path.join(reportRoot(repo),'canonical-collapse-review-queue.json'),{generatedAt:now(),queue,policy:{autoSplit:false,humanApprovalRequired:true,maxAliasesBeforeReview:10}});
return baseReport(FRAMEWORK,VERSION,{reviewGroups:queue.length,highRisk:queue.filter(x=>x.risk==='HIGH').length,autoSplit:false});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
