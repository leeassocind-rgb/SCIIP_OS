'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROVENANCE_GRAPH_REBUILD',VERSION='196.94.0';
function run(repo){
const u=load(repo),d=readJson(path.join(root(repo),'semantic-recommendation-evidence-links.json'),{links:[]});
const nodes=[],edges=[];
for(const e of u.evidence||[])nodes.push({id:e.evidenceId,type:'EVIDENCE'});
for(const r of d.links){const id=r.recommendationId||r.decisionId||stableId('REC',r);nodes.push({id,type:'RECOMMENDATION'});if(r.resolvedEvidence)edges.push({edgeId:stableId('PROV',[id,r.resolvedEvidence.evidenceId]),from:id,to:r.resolvedEvidence.evidenceId,type:'SUPPORTED_BY',confidence:r.resolutionConfidence,method:r.resolutionMethod})}
writeJson(path.join(root(repo),'provenance-graph-rebuilt.json'),{generatedAt:now(),nodes,edges});
return report(FRAMEWORK,VERSION,{nodes:nodes.length,edges:edges.length,orphanRecommendations:d.links.length-edges.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
