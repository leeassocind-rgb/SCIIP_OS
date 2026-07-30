'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROVENANCE_GRAPH_COMPLETION',VERSION='196.79.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), links=readJson(path.join(reportRoot(repo),'recommendation-evidence-links.json'),{links:[]}).links||[];
const nodes=[],edges=[];
for(const e of u.evidence||[])nodes.push({id:e.evidenceId,type:'EVIDENCE'});
for(const r of links){const rid=r.recommendationId||r.decisionId||stableId('REC',r);nodes.push({id:rid,type:'RECOMMENDATION'});if(r.linkedEvidence)edges.push({edgeId:stableId('PROV',[rid,r.linkedEvidence.evidenceId]),from:rid,to:r.linkedEvidence.evidenceId,type:'SUPPORTED_BY'})}
writeJson(path.join(reportRoot(repo),'provenance-graph.json'),{generatedAt:now(),nodes:uniqueBy(nodes,x=>x.id),edges});
return baseReport(FRAMEWORK,VERSION,{nodes:uniqueBy(nodes,x=>x.id).length,edges:edges.length,orphanRecommendations:links.length-edges.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
