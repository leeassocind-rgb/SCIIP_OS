'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_DETERMINISTIC_PROVENANCE_RECONSTRUCTOR',VERSION='197.04.0';
function run(repo){
const E=readJson(path.join(reportRoot(repo),'evidence-registry-enriched.json'),{evidence:[]}).evidence||[];
const R=readJson(path.join(reportRoot(repo),'recommendation-registry-enriched.json'),{recommendations:[]}).recommendations||[];
const exact=new Map(),normalized=new Map(),byFile=new Map(),byFileProp=new Map(),byFileEvent=new Map(),byFileTx=new Map(),byDoc=new Map();
for(const e of E){
 exact.set(String(e.evidenceId),e);normalized.set(key(e.evidenceId),e);
 const p=e.provenance||{},file=p.sourceRepositoryFile,prop=p.propertyId,event=p.eventId,tx=p.transactionId,doc=p.sourceDocument;
 if(file){if(!byFile.has(file))byFile.set(file,[]);byFile.get(file).push(e)}
 if(file&&prop)byFileProp.set(file+'|'+prop,e);
 if(file&&event)byFileEvent.set(file+'|'+event,e);
 if(file&&tx)byFileTx.set(file+'|'+tx,e);
 if(doc)byDoc.set(key(doc),e);
}
const links=[];
for(const r of R){
 let e=null,method='UNRESOLVED';const src=r.source||r,lin=r.lineage||{};
 const eid=first(r,['evidenceId','evidence_id'])||first(src,['evidenceId','evidence_id']);
 if(eid&&exact.has(String(eid))){e=exact.get(String(eid));method='EXACT_ID'}
 else if(eid&&normalized.has(key(eid))){e=normalized.get(key(eid));method='NORMALIZED_ID'}
 else if(lin.sourceDocument&&byDoc.has(key(lin.sourceDocument))){e=byDoc.get(key(lin.sourceDocument));method='SOURCE_DOCUMENT'}
 else if(lin.sourceRepositoryFile&&lin.transactionId&&byFileTx.has(lin.sourceRepositoryFile+'|'+lin.transactionId)){e=byFileTx.get(lin.sourceRepositoryFile+'|'+lin.transactionId);method='SAME_FILE_TRANSACTION'}
 else if(lin.sourceRepositoryFile&&lin.eventId&&byFileEvent.has(lin.sourceRepositoryFile+'|'+lin.eventId)){e=byFileEvent.get(lin.sourceRepositoryFile+'|'+lin.eventId);method='SAME_FILE_EVENT'}
 else if(lin.sourceRepositoryFile&&lin.propertyId&&byFileProp.has(lin.sourceRepositoryFile+'|'+lin.propertyId)){e=byFileProp.get(lin.sourceRepositoryFile+'|'+lin.propertyId);method='SAME_FILE_PROPERTY'}
 else if(lin.sourceRepositoryFile&&(byFile.get(lin.sourceRepositoryFile)||[]).length===1){e=byFile.get(lin.sourceRepositoryFile)[0];method='SAME_FILE_SINGLE_EVIDENCE'}
 links.push({recommendationId:r.recommendationId,evidenceId:e?.evidenceId||null,method,confidence:confidenceFor(method),status:e?'RESOLVED':'UNRESOLVED',recommendation:r,evidence:e||null});
}
writeJson(path.join(reportRoot(repo),'reconstructed-recommendation-evidence-links.json'),{generatedAt:now(),links});
const resolved=links.filter(x=>x.status==='RESOLVED').length,byMethod={};for(const x of links)byMethod[x.method]=(byMethod[x.method]||0)+1;
return baseReport(FRAMEWORK,VERSION,{recommendations:links.length,resolved,unresolved:links.length-resolved,coveragePct:links.length?Number((resolved/links.length*100).toFixed(2)):100},{byMethod});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
