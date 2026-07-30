'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_IDENTITY_VALIDATION',VERSION='196.86.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const d=readJson(path.join(reportRoot(repo),'canonical-property-registry.json'),{properties:[],aliases:[]});const ids=d.properties.map(x=>x.canonicalPropertyId);
const dup=ids.length-new Set(ids).size;return baseReport(FRAMEWORK,VERSION,{canonicalProperties:ids.length,duplicateCanonicalIds:dup,valid:dup===0});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
