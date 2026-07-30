'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROVENANCE_GRAPH_V4',VERSION='197.13.0';
function run(repo){
const u=loadUnified(repo),d=readJson(path.join(waveRoot(repo),'recommendation-evidence-bundles.json'),{links:[]});
const nodes=[
 ...(u.recommendations||[]).map(r=>({id:r.recommendationId,type:'RECOMMENDATION',propertyId:r.propertyId})),
 ...(u.evidence||[]).map(e=>({id:e.evidenceId,type:'EVIDENCE',propertyId:propertyFromEvidence(e)}))
];
const edges=[];
for(const link of d.links||[])for(const evidenceId of link.evidenceIds||[])edges.push({
 edgeId:stableId('PROVENANCE',[link.recommendationId,evidenceId]),
 from:link.recommendationId,to:evidenceId,type:'SUPPORTED_BY',
 propertyId:link.propertyId,method:link.method,confidence:link.confidence,
 humanApprovalRequired:true,autonomousExecution:false
});
writeJson(path.join(waveRoot(repo),'provenance-graph-v4.json'),{generatedAt:now(),nodes,edges});
return base(FRAMEWORK,VERSION,{nodes:nodes.length,edges:edges.length,orphanRecommendations:(d.links||[]).filter(x=>x.status!=='RESOLVED').length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
