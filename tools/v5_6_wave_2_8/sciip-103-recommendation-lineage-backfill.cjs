'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_RECOMMENDATION_LINEAGE_BACKFILL',VERSION='197.03.0';
function run(repo){
const u=loadUnified(repo),scan=readJson(path.join(reportRoot(repo),'source-lineage-scan.json'),{recommendations:[]});
const occ=new Map();for(const x of scan.recommendations||[]){const k=key(x.recommendationId);if(!occ.has(k))occ.set(k,[]);occ.get(k).push(x)}
const enriched=(u.recommendations||[]).map(r=>{
 const id=recommendationIdentity(r),hits=occ.get(key(id))||[];
 const best=hits.sort((a,b)=>Object.values(b.context||{}).filter(Boolean).length-Object.values(a.context||{}).filter(Boolean).length)[0];
 return {...r,recommendationId:id,lineage:best?{...best.context,sourceRepositoryFile:best.file,jsonPath:best.jsonPath,backfillMethod:'SOURCE_LINEAGE_SCAN'}:{backfillMethod:'UNRESOLVED'}};
});
writeJson(path.join(reportRoot(repo),'recommendation-registry-enriched.json'),{generatedAt:now(),recommendations:enriched});
const resolved=enriched.filter(x=>x.lineage.backfillMethod!=='UNRESOLVED').length;
return baseReport(FRAMEWORK,VERSION,{recommendations:enriched.length,lineageBackfilled:resolved,unresolved:enriched.length-resolved,coveragePct:enriched.length?Number((resolved/enriched.length*100).toFixed(2)):100});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
