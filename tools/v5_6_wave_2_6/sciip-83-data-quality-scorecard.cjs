'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_DATA_QUALITY_SCORECARD',VERSION='196.83.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), c=readJson(path.join(reportRoot(repo),'canonical-property-registry.json'),{properties:[]}),
 s=readJson(path.join(reportRoot(repo),'canonical-spatial-properties.json'),{properties:[]}),
 l=readJson(path.join(reportRoot(repo),'recommendation-evidence-links.json'),{links:[]});
const metrics={
 identityUniquenessPct:(u.properties||[]).length?Number((c.properties.length/(u.properties||[]).length*100).toFixed(2)):100,
 spatialCoveragePct:s.properties.length?Number((s.properties.filter(x=>x.latitude!=null&&x.longitude!=null).length/s.properties.length*100).toFixed(2)):100,
 evidenceLinkagePct:l.links.length?Number((l.links.filter(x=>x.linkedEvidence).length/l.links.length*100).toFixed(2)):100,
 graphEvidencePct:(u.relationships||[]).length?Number(((u.relationships||[]).filter(x=>x.evidenceId).length/(u.relationships||[]).length*100).toFixed(2)):100
};
metrics.overallPct=Number((Object.values(metrics).reduce((a,b)=>a+b,0)/Object.keys(metrics).length).toFixed(2));
writeJson(path.join(reportRoot(repo),'data-quality-scorecard.json'),{generatedAt:now(),metrics});
return baseReport(FRAMEWORK,VERSION,{metrics:Object.keys(metrics).length,overallPct:metrics.overallPct},{metrics});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
