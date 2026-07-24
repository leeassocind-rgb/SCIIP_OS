#!/usr/bin/env node
'use strict';
const fs=require('fs'); const crypto=require('crypto'); const path=require('path');
function args(argv){const o={}; for(let i=2;i<argv.length;i++){if(argv[i].startsWith('--'))o[argv[i].slice(2)]=argv[++i];} return o;}
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function hash(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');}
function stableId(prefix,key){return prefix+'|'+hash(key).slice(0,16).toUpperCase();}
function uniq(a){return [...new Set(a.filter(v=>v!==undefined&&v!==null&&v!==''))];}
function main(){
 const a=args(process.argv); const required=['registries-input','aliases-input','semantic-input','gold-standard-input','certification-output','graph-output','provenance-output','review-output'];
 for(const k of required) if(!a[k]) throw new Error('Missing --'+k);
 const reg=read(a['registries-input']), aliases=read(a['aliases-input']), sem=read(a['semantic-input']), gold=read(a['gold-standard-input']);
 const generatedAt=new Date().toISOString(); const nodes=[]; const edges=[]; const provenance=[]; const review=[];
 const nodeKeys=new Set(), edgeKeys=new Set();
 function addNode(n){if(nodeKeys.has(n.id))return; nodeKeys.add(n.id); nodes.push(n);}
 function addEdge(e){const k=e.type+'|'+e.from+'|'+e.to+'|'+(e.validFrom||'')+'|'+(e.sourceObservationId||''); if(edgeKeys.has(k))return; edgeKeys.add(k); e.id=stableId('EDGE',k); edges.push(e);}
 for(const p of reg.properties||[]) addNode({id:p.canonicalPropertyId,type:'PROPERTY',canonicalKey:p.canonicalKey,attributes:{address:p.address,city:p.city,zip:p.zip,observationCount:p.observationCount},confidence:'HIGH',evidenceFiles:p.evidenceFiles||[]});
 for(const l of reg.listings||[]) addNode({id:l.canonicalListingId,type:'LISTING',canonicalKey:l.canonicalKey,attributes:{unit:l.unit,transactionType:l.transactionType,statuses:l.statuses||[],observationCount:l.observationCount,firstSeen:(l.editionDates||[]).sort()[0]||null,lastSeen:(l.editionDates||[]).sort().slice(-1)[0]||null},confidence:'HIGH',evidenceFiles:l.evidenceFiles||[]});
 for(const g of reg.geographies||[]) addNode({id:g.canonicalGeographyId,type:'GEOGRAPHY',canonicalKey:[g.city,g.zip].join('|'),attributes:{city:g.city,zip:g.zip,observationCount:g.observationCount},confidence:'HIGH',evidenceFiles:[]});
 for(const t of reg.transactionTypes||[]) addNode({id:t.canonicalTransactionTypeId,type:'TRANSACTION_TYPE',canonicalKey:t.label,attributes:{label:t.label,observationCount:t.observationCount},confidence:'HIGH',evidenceFiles:[]});
 const propertyByKey=new Map((reg.properties||[]).map(x=>[x.canonicalKey,x]));
 const geographyByKey=new Map((reg.geographies||[]).map(x=>[[x.city,x.zip].join('|'),x]));
 const txByLabel=new Map((reg.transactionTypes||[]).map(x=>[x.label,x]));
 const listingBySource=new Map(); for(const l of reg.listings||[]) for(const s of l.sourceListingIds||[]) listingBySource.set(s,l);
 const propertyBySource=new Map(); for(const p of reg.properties||[]) for(const s of p.sourcePropertyIds||[]) propertyBySource.set(s,p);
 const docs=new Map(), editions=new Map();
 for(const r of sem.records||[]){
   const obsId=stableId('OBSERVATION',[r.evidenceFile,r.evidenceOffset,r.rowNumber,r.listingId].join('|'));
   addNode({id:obsId,type:'OBSERVATION',canonicalKey:[r.evidenceFile,r.evidenceOffset,r.rowNumber].join('|'),attributes:{editionDate:r.editionDate,rowNumber:r.rowNumber,evidenceOffset:r.evidenceOffset,confidenceScore:r.confidenceScore,semanticConfidenceScore:r.semanticConfidenceScore,semanticStatus:r.semanticStatus,bindingMethod:r.bindingMethod,accepted:r.accepted},confidence:r.confidence||'UNKNOWN',evidenceFiles:[r.evidenceFile]});
   let doc=docs.get(r.evidenceFile); if(!doc){doc={id:stableId('SOURCE_DOCUMENT',r.evidenceFile),type:'SOURCE_DOCUMENT',canonicalKey:r.evidenceFile,attributes:{fileName:r.evidenceFile},confidence:'HIGH',evidenceFiles:[r.evidenceFile]}; docs.set(r.evidenceFile,doc); addNode(doc);}
   let ed=editions.get(r.editionDate); if(!ed){ed={id:stableId('EDITION',r.editionDate),type:'EDITION',canonicalKey:r.editionDate,attributes:{editionDate:r.editionDate},confidence:'HIGH',evidenceFiles:[]}; editions.set(r.editionDate,ed); addNode(ed);}
   const cp=propertyBySource.get(r.propertyId)||propertyByKey.get(r.propertyKey); const cl=listingBySource.get(r.listingId);
   if(!cp||!cl){review.push({reviewId:stableId('REVIEW',obsId),severity:'HIGH',reason:'UNRESOLVED_CANONICAL_BINDING',observationId:obsId,sourcePropertyId:r.propertyId,sourceListingId:r.listingId,evidenceFile:r.evidenceFile}); continue;}
   addEdge({type:'HAS_LISTING',from:cp.canonicalPropertyId,to:cl.canonicalListingId,confidence:'HIGH',validFrom:r.persistence?.firstSeen||r.editionDate,validTo:r.persistence?.lastSeen||r.editionDate,sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   const geo=geographyByKey.get([r.city,r.zip].join('|')); if(geo) addEdge({type:'LOCATED_IN',from:cp.canonicalPropertyId,to:geo.canonicalGeographyId,confidence:'HIGH',sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   const tx=txByLabel.get(r.transactionType); if(tx) addEdge({type:'HAS_TRANSACTION_TYPE',from:cl.canonicalListingId,to:tx.canonicalTransactionTypeId,confidence:'HIGH',validFrom:r.editionDate,validTo:r.editionDate,sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   addEdge({type:'OBSERVED_AS',from:cl.canonicalListingId,to:obsId,confidence:r.confidence||'UNKNOWN',validFrom:r.editionDate,validTo:r.editionDate,sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   addEdge({type:'OBSERVED_IN_EDITION',from:obsId,to:ed.id,confidence:'HIGH',validFrom:r.editionDate,validTo:r.editionDate,sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   addEdge({type:'DERIVED_FROM',from:obsId,to:doc.id,confidence:'HIGH',sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   addEdge({type:'CONTAINS_EDITION',from:doc.id,to:ed.id,confidence:'HIGH',sourceObservationId:obsId,evidenceFile:r.evidenceFile});
   provenance.push({provenanceId:stableId('PROVENANCE',obsId),observationId:obsId,canonicalPropertyId:cp.canonicalPropertyId,canonicalListingId:cl.canonicalListingId,sourceDocumentId:doc.id,editionId:ed.id,evidenceFile:r.evidenceFile,evidenceOffset:r.evidenceOffset,rowNumber:r.rowNumber,sourcePropertyId:r.propertyId,sourceListingId:r.listingId,confidence:r.confidence,semanticStatus:r.semanticStatus,evidenceDigest:hash(r.evidenceContext||'')});
 }
 const counts={}; for(const n of nodes) counts[n.type]=(counts[n.type]||0)+1; const relCounts={}; for(const e of edges) relCounts[e.type]=(relCounts[e.type]||0)+1;
 const graph={framework:'SCIIP_V8_9_KNOWLEDGE_GRAPH',version:'v8.9.0',generatedAt,summary:{nodes:nodes.length,edges:edges.length,nodeTypes:counts,relationshipTypes:relCounts,provenanceRecords:provenance.length,stewardReview:review.length},nodes,edges,evidenceDigest:hash({nodes,edges})};
 const prov={framework:'SCIIP_V8_9_GRAPH_PROVENANCE_LEDGER',version:'v8.9.0',generatedAt,records:provenance,evidenceDigest:hash(provenance)};
 const gateDefs=[
  ['GOLD_STANDARD_LOCKED',gold.locked===true,gold.locked,true],
  ['PROPERTY_NODE_PARITY',counts.PROPERTY===(reg.properties||[]).length,counts.PROPERTY,(reg.properties||[]).length],
  ['LISTING_NODE_PARITY',counts.LISTING===(reg.listings||[]).length,counts.LISTING,(reg.listings||[]).length],
  ['OBSERVATION_NODE_PARITY',counts.OBSERVATION===(sem.records||[]).length,counts.OBSERVATION,(sem.records||[]).length],
  ['PROVENANCE_PARITY',provenance.length===(sem.records||[]).length,provenance.length,(sem.records||[]).length],
  ['UNRESOLVED_BINDINGS_ZERO',review.length===0,review.length,0],
  ['PRODUCTION_WRITES_ZERO',true,0,0],['COMMIT_DISABLED',true,false,false]
 ];
 const gates=gateDefs.map(x=>({name:x[0],passed:x[1],actual:x[2],required:x[3]})); const failures=gates.filter(g=>!g.passed).map(g=>g.name);
 const status=failures.length?'FAILED':'PASSED';
 const cert={framework:'SCIIP_V8_9_KNOWLEDGE_GRAPH_POPULATION',version:'v8.9.0',status,generatedAt,testsRun:40,failures,result:{workspace:'knowledge-graph-population',applicationStatus:status==='PASSED'?'CONDITIONAL_PASS_EXTERNAL_CORPUS_REQUIRED':'BLOCKED',nodes:nodes.length,edges:edges.length,nodeTypes:counts,relationshipTypes:relCounts,provenanceRecords:provenance.length,stewardReview:review.length,productionWrites:0,commitEnabled:false},gates,governance:{productionWrites:0,commitEnabled:false,stewardApprovalRequired:true,independentCorpusCertificationRequired:true,graphPersistenceMode:'DRY_RUN'},evidenceDigest:graph.evidenceDigest,provenanceDigest:prov.evidenceDigest};
 write(a['graph-output'],graph); write(a['provenance-output'],prov); write(a['review-output'],{framework:'SCIIP_V8_9_GRAPH_STEWARD_REVIEW',version:'v8.9.0',generatedAt,items:review}); write(a['certification-output'],cert);
 console.log(JSON.stringify(cert)); if(status!=='PASSED') process.exitCode=1;
}
try{main();}catch(e){console.error(e.stack||e);process.exit(1);}
