'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_SPATIAL_JOIN_COMPLETION',VERSION='196.75.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u), idx=collectCoordinateIndex(repo,u,c);
const spatial=c.registry.map(p=>{
 const hit=idx.get(p.canonicalPropertyId)||idx.get(p.canonicalKey);
 return {...p,latitude:p.latitude??hit?.latitude??null,longitude:p.longitude??hit?.longitude??null,coordinateSource:(p.latitude!=null&&p.longitude!=null)?'canonical-source':hit?.source||null};
});
const mapped=spatial.filter(x=>x.latitude!=null&&x.longitude!=null);
writeJson(path.join(reportRoot(repo),'canonical-spatial-properties.json'),{generatedAt:now(),properties:spatial});
return baseReport(FRAMEWORK,VERSION,{canonicalProperties:spatial.length,mapped:mapped.length,missing:spatial.length-mapped.length,coveragePct:spatial.length?Number((mapped.length/spatial.length*100).toFixed(2)):100});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
