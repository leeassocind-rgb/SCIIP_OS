'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_CANONICAL_PROPERTY_REGISTRY',VERSION='196.71.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u);
writeJson(path.join(reportRoot(repo),'canonical-property-registry.json'),{generatedAt:now(),properties:c.registry,aliases:c.aliases});
return baseReport(FRAMEWORK,VERSION,{sourceProperties:(u.properties||[]).length,canonicalProperties:c.registry.length,aliases:c.aliases.length,duplicatesCollapsed:(u.properties||[]).length-c.registry.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
