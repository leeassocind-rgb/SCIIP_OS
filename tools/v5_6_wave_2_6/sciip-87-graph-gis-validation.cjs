'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_GRAPH_GIS_VALIDATION',VERSION='196.87.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const g=readJson(path.join(reportRoot(repo),'provenance-graph.json'),{nodes:[],edges:[]}),s=readJson(path.join(reportRoot(repo),'canonical-spatial-properties.json'),{properties:[]});
const nodeIds=new Set(g.nodes.map(x=>x.id)),orphanEdges=g.edges.filter(x=>!nodeIds.has(x.from)||!nodeIds.has(x.to));
const invalid=s.properties.filter(x=>x.latitude!=null&&(Math.abs(x.latitude)>90||Math.abs(x.longitude)>180));
return baseReport(FRAMEWORK,VERSION,{orphanEdges:orphanEdges.length,invalidCoordinates:invalid.length,valid:orphanEdges.length===0&&invalid.length===0});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
