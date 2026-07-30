'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_RECOMMENDATION_EVIDENCE_LINKER',VERSION='196.78.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo), reg=readJson(path.join(reportRoot(repo),'normalized-evidence-registry.json'),{evidence:[]});
const byId=new Map(), byNorm=new Map(), bySource=new Map();
for(const e of reg.evidence){if(e.evidenceId)byId.set(String(e.evidenceId),e);byNorm.set(e.normalizedEvidenceKey,e);if(e.sourceFile)bySource.set(normKey(e.sourceFile),e)}
const links=[];for(const r of u.recommendations||[]){
 let e=null,method=null;
 if(r.evidenceId&&byId.has(String(r.evidenceId))){e=byId.get(String(r.evidenceId));method='EXACT_ID'}
 else{
   const candidates=[r.evidenceId,r.source?.evidenceId,r.source?.evidence_id,r.source?.sourceFile,r.source?.source_file,r.source?.document];
   for(const c of candidates.filter(Boolean)){const k=normKey(c);if(byNorm.has(k)){e=byNorm.get(k);method='NORMALIZED_KEY';break}if(bySource.has(k)){e=bySource.get(k);method='SOURCE_FILE';break}}
 }
 links.push({...r,linkedEvidence:e||null,linkMethod:method});
}
writeJson(path.join(reportRoot(repo),'recommendation-evidence-links.json'),{generatedAt:now(),links});
return baseReport(FRAMEWORK,VERSION,{recommendations:links.length,linked:links.filter(x=>x.linkedEvidence).length,unlinked:links.filter(x=>!x.linkedEvidence).length,coveragePct:links.length?Number((links.filter(x=>x.linkedEvidence).length/links.length*100).toFixed(2)):100});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
