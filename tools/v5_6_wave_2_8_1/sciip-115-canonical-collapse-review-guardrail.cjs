'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_CANONICAL_COLLAPSE_REVIEW_GUARDRAIL',VERSION='197.15.0';
function run(repo){
const reg=readJson(path.join(repo,'reports','release-5.6','wave-2.6','canonical-property-registry.json'),{properties:[]});
const queue=(reg.properties||[]).filter(x=>Number(x.aliasCount||0)>10).map(x=>({
 reviewId:stableId('IDENTITY-REVIEW',[x.canonicalPropertyId,x.aliasCount]),
 canonicalPropertyId:x.canonicalPropertyId,address:x.address,city:x.city,
 aliasCount:x.aliasCount,sourcePropertyIds:x.sourcePropertyIds||[],
 severity:Number(x.aliasCount||0)>50?'HIGH':'MEDIUM',
 status:'PENDING_HUMAN_REVIEW',autoSplit:false
}));
writeJson(path.join(waveRoot(repo),'canonical-collapse-review-queue-v2.json'),{generatedAt:now(),policy:{reviewThreshold:10,highRiskThreshold:50,autoSplit:false,humanApprovalRequired:true},queue});
return base(FRAMEWORK,VERSION,{reviewGroups:queue.length,highRisk:queue.filter(x=>x.severity==='HIGH').length,autoSplit:false,humanApprovalRequired:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
