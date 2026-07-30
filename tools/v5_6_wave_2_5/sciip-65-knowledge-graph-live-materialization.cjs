'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_KNOWLEDGE_GRAPH_LIVE_MATERIALIZATION', VERSION='196.65.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const r=loadRepository(repo);
const nodes=new Map();
for(const p of r.properties)nodes.set(p.propertyId,{id:p.propertyId,type:'PROPERTY',label:p.address||p.propertyId});
for(const e of r.evidence)nodes.set(e.evidenceId,{id:e.evidenceId,type:'EVIDENCE',label:e.sourceFile||e.evidenceId});
for(const rel of r.relationships){if(!nodes.has(rel.from))nodes.set(rel.from,{id:rel.from,type:'ENTITY',label:rel.from});if(!nodes.has(rel.to))nodes.set(rel.to,{id:rel.to,type:'ENTITY',label:rel.to});}
const graph={generatedAt:now(),nodes:[...nodes.values()],edges:r.relationships};
writeJson(path.join(reportRoot(repo),'knowledge-graph-live.json'),graph);
return baseReport(FRAMEWORK,VERSION,{nodes:graph.nodes.length,edges:graph.edges.length,evidenceLinkedEdges:graph.edges.filter(e=>e.evidenceId).length,liveData:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
