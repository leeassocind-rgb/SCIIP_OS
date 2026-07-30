'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_IDENTITY_ALIAS_RESOLUTION',VERSION='196.72.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u);
const unresolved=(u.properties||[]).filter(p=>!p.propertyId&&!p.address);
const conflicts=c.registry.filter(x=>x.aliasCount>1);
writeJson(path.join(reportRoot(repo),'identity-alias-resolution.json'),{generatedAt:now(),conflicts,unresolved});
return baseReport(FRAMEWORK,VERSION,{conflictGroups:conflicts.length,unresolved:unresolved.length,deterministic:true});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
