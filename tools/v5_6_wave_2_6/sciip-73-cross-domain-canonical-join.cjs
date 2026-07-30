'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_CROSS_DOMAIN_CANONICAL_JOIN',VERSION='196.73.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=buildCanonical(u);
const mapId=x=>x?c.sourceToCanonical.get(String(x))||null:null;
const domains={
 relationships:(u.relationships||[]).map(x=>({...x,fromCanonicalPropertyId:mapId(x.from),toCanonicalPropertyId:mapId(x.to)})),
 recommendations:(u.recommendations||[]).map(x=>({...x,canonicalPropertyId:mapId(x.propertyId)})),
 events:(u.events||[]).map(x=>({...x,canonicalPropertyId:mapId(x.propertyId)})),
 comparables:(u.comparables||[]).map(x=>({...x,canonicalPropertyId:mapId(x.propertyId)})),
 gis:(u.gis||[]).map(x=>({...x,canonicalPropertyId:mapId(x.propertyId)}))
};
writeJson(path.join(reportRoot(repo),'cross-domain-canonical-joins.json'),{generatedAt:now(),domains});
const total=Object.values(domains).reduce((a,x)=>a+x.length,0),joined=Object.values(domains).flat().filter(x=>x.canonicalPropertyId||x.fromCanonicalPropertyId||x.toCanonicalPropertyId).length;
return baseReport(FRAMEWORK,VERSION,{records:total,joined,joinCoveragePct:total?Number((joined/total*100).toFixed(2)):100});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
