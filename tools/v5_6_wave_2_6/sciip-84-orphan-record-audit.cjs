'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_ORPHAN_RECORD_AUDIT',VERSION='196.84.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u), ids=new Set(c.registry.map(x=>x.canonicalPropertyId));
const map=x=>x?c.sourceToCanonical.get(String(x)):null;
const audit={
 orphanRecommendations:(u.recommendations||[]).filter(x=>!map(x.propertyId)),
 orphanEvents:(u.events||[]).filter(x=>x.propertyId&&!map(x.propertyId)),
 orphanComparables:(u.comparables||[]).filter(x=>x.propertyId&&!map(x.propertyId)),
 orphanRelationships:(u.relationships||[]).filter(x=>!x.from||!x.to)
};
writeJson(path.join(reportRoot(repo),'orphan-record-audit.json'),{generatedAt:now(),audit});
return baseReport(FRAMEWORK,VERSION,{orphanRecommendations:audit.orphanRecommendations.length,orphanEvents:audit.orphanEvents.length,orphanComparables:audit.orphanComparables.length,orphanRelationships:audit.orphanRelationships.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
