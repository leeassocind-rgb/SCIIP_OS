'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PROPERTY_EVIDENCE_BUNDLE_LINKER',VERSION='197.12.0';
function run(repo){
const u=loadUnified(repo),byProperty=new Map();
for(const e of u.evidence||[]){
 const propertyId=propertyFromEvidence(e);
 if(!propertyId||e?.source?.type!=='SUPPORTED_BY')continue;
 if(!byProperty.has(propertyId))byProperty.set(propertyId,[]);
 byProperty.get(propertyId).push(e);
}
const links=[];
for(const r of u.recommendations||[]){
 const evidence=(byProperty.get(r.propertyId)||[]).slice().sort((a,b)=>evidenceQuality(b)-evidenceQuality(a)||String(a.evidenceId).localeCompare(String(b.evidenceId)));
 const evidenceIds=evidence.map(e=>e.evidenceId);
 links.push({
  recommendationId:r.recommendationId,
  propertyId:r.propertyId,
  primaryEvidenceId:evidenceIds[0]||null,
  evidenceIds,
  evidenceCount:evidenceIds.length,
  method:'PROPERTY_SUPPORTED_BY_EDGE',
  confidence:evidenceIds.length?1:0,
  status:evidenceIds.length?'RESOLVED':'UNRESOLVED',
  humanApprovalRequired:true,
  autonomousExecution:false
 });
}
const resolved=links.filter(x=>x.status==='RESOLVED').length;
writeJson(path.join(waveRoot(repo),'recommendation-evidence-bundles.json'),{generatedAt:now(),links});
return base(FRAMEWORK,VERSION,{recommendations:links.length,resolved,unresolved:links.length-resolved,evidenceLinks:links.reduce((a,x)=>a+x.evidenceCount,0),coveragePct:links.length?Number((resolved/links.length*100).toFixed(2)):100});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
