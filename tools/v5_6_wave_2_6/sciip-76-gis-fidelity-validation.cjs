'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_GIS_FIDELITY_VALIDATION',VERSION='196.76.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const d=readJson(path.join(reportRoot(repo),'canonical-spatial-properties.json'),{properties:[]});
const invalid=d.properties.filter(x=>x.latitude!=null&&(Math.abs(x.latitude)>90||Math.abs(x.longitude)>180));
const missing=d.properties.filter(x=>x.latitude==null||x.longitude==null).map(x=>({canonicalPropertyId:x.canonicalPropertyId,address:x.address,city:x.city}));
writeJson(path.join(reportRoot(repo),'gis-missing-coordinate-queue.json'),{generatedAt:now(),queue:missing});
return baseReport(FRAMEWORK,VERSION,{invalidCoordinates:invalid.length,missingCoordinates:missing.length,queueCreated:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
