'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROVENANCE_GRAPH_V3',VERSION='197.06.0';
function run(repo){
const u=loadUnified(repo),d=readJson(path.join(reportRoot(repo),'reconstructed-recommendation-evidence-links.json'),{links:[]});
const nodes=[...(u.evidence||[]).map(e=>({id:evidenceIdentity(e),type:'EVIDENCE'})),...(u.recommendations||[]).map(r=>({id:recommendationIdentity(r),type:'RECOMMENDATION'}))];
const edges=d.links.filter(x=>x.status==='RESOLVED').map(x=>({edgeId:stableId('PROV',[x.recommendationId,x.evidenceId]),from:x.recommendationId,to:x.evidenceId,type:'SUPPORTED_BY',method:x.method,confidence:x.confidence}));
writeJson(path.join(reportRoot(repo),'provenance-graph-v3.json'),{generatedAt:now(),nodes,edges});
return baseReport(FRAMEWORK,VERSION,{nodes:nodes.length,edges:edges.length,orphanRecommendations:(u.recommendations||[]).length-edges.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
