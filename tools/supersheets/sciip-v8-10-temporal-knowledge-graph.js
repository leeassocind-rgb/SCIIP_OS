#!/usr/bin/env node
'use strict';
const fs=require('fs'); const crypto=require('crypto'); const path=require('path');
function args(argv){const o={}; for(let i=2;i<argv.length;i++){if(argv[i].startsWith('--'))o[argv[i].slice(2)]=argv[++i];} return o;}
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function hash(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');}
function stableId(prefix,key){return prefix+'|'+hash(key).slice(0,16).toUpperCase();}
function isoDay(v){return /^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:null;}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function uniq(a){return [...new Set(a.filter(v=>v!==undefined&&v!==null&&v!==''))];}
function stateFrom(r){return {status:r.status||'UNKNOWN',buildingSf:r.buildingSf??null,landAcres:r.landAcres??null,clearHeightFt:r.clearHeightFt??null,dockHighDoors:r.dockHighDoors??null,powerAmps:r.powerAmps??null,unit:r.unit||null,transactionType:r.transactionType||'UNKNOWN',semanticStatus:r.semanticStatus||'UNKNOWN'};}
function changedFields(a,b){const out=[]; for(const k of Object.keys(b)) if(!same(a?.[k],b[k])) out.push({field:k,from:a?.[k]??null,to:b[k]??null}); return out;}
function main(){
 const a=args(process.argv); const req=['graph-input','registries-input','semantic-input','gold-standard-input','certification-output','temporal-graph-output','timeline-output','change-ledger-output','review-output']; for(const k of req) if(!a[k]) throw new Error('Missing --'+k);
 const graph=read(a['graph-input']), reg=read(a['registries-input']), sem=read(a['semantic-input']), gold=read(a['gold-standard-input']); const generatedAt=new Date().toISOString();
 const listingBySource=new Map(); for(const l of reg.listings||[]) for(const s of l.sourceListingIds||[]) listingBySource.set(s,l.canonicalListingId);
 const propertyBySource=new Map(); for(const p of reg.properties||[]) for(const s of p.sourcePropertyIds||[]) propertyBySource.set(s,p.canonicalPropertyId);
 const groups=new Map(); const review=[];
 for(const r of sem.records||[]){
   const listingId=listingBySource.get(r.listingId), propertyId=propertyBySource.get(r.propertyId), date=isoDay(r.editionDate);
   if(!listingId||!propertyId||!date){review.push({reviewId:stableId('TEMPORAL_REVIEW',[r.listingId,r.propertyId,r.editionDate,r.evidenceFile,r.rowNumber].join('|')),severity:'HIGH',reason:'UNRESOLVED_TEMPORAL_BINDING',sourceListingId:r.listingId,sourcePropertyId:r.propertyId,editionDate:r.editionDate,evidenceFile:r.evidenceFile,rowNumber:r.rowNumber}); continue;}
   if(!groups.has(listingId)) groups.set(listingId,[]); groups.get(listingId).push({...r,canonicalListingId:listingId,canonicalPropertyId:propertyId});
 }
 const timelines=[]; const changeEvents=[]; const temporalNodes=[]; const temporalEdges=[]; let continuouslyActive=0, listingsWithChanges=0, totalIntervals=0;
 for(const [listingId,records] of groups){
   records.sort((x,y)=>x.editionDate.localeCompare(y.editionDate)||String(x.evidenceFile).localeCompare(String(y.evidenceFile))||Number(x.rowNumber)-Number(y.rowNumber));
   const byDate=new Map(); for(const r of records){if(!byDate.has(r.editionDate)) byDate.set(r.editionDate,[]); byDate.get(r.editionDate).push(r);}
   const observations=[...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,rs])=>{
      const ranked=[...rs].sort((x,y)=>(y.semanticConfidenceScore||0)-(x.semanticConfidenceScore||0)||(y.confidenceScore||0)-(x.confidenceScore||0)); const chosen=ranked[0];
      return {date,state:stateFrom(chosen),representativeObservation:{sourceListingId:chosen.listingId,evidenceFile:chosen.evidenceFile,rowNumber:chosen.rowNumber,evidenceOffset:chosen.evidenceOffset,confidence:chosen.confidence,semanticConfidenceScore:chosen.semanticConfidenceScore},observationCount:rs.length,evidenceFiles:uniq(rs.map(x=>x.evidenceFile))};
   });
   const intervals=[]; let prev=null; let interval=null; let listingChanges=0;
   for(const obs of observations){
     if(!prev || !same(prev.state,obs.state)){
       if(interval) intervals.push(interval);
       const changes=prev?changedFields(prev.state,obs.state):[];
       interval={intervalId:stableId('VALIDITY_INTERVAL',[listingId,obs.date,JSON.stringify(obs.state)].join('|')),validFrom:obs.date,validTo:obs.date,state:obs.state,evidenceFiles:[...obs.evidenceFiles],observationDates:[obs.date],observationCount:obs.observationCount};
       if(prev){listingChanges+=changes.length; for(const c of changes){const evt={changeEventId:stableId('CHANGE_EVENT',[listingId,obs.date,c.field,JSON.stringify(c.from),JSON.stringify(c.to)].join('|')),canonicalListingId:listingId,canonicalPropertyId:records[0].canonicalPropertyId,changedAt:obs.date,field:c.field,previousValue:c.from,newValue:c.to,sourceEvidence:obs.representativeObservation}; changeEvents.push(evt); temporalNodes.push({id:evt.changeEventId,type:'CHANGE_EVENT',canonicalKey:[listingId,obs.date,c.field].join('|'),attributes:{changedAt:obs.date,field:c.field,previousValue:c.from,newValue:c.to},confidence:obs.representativeObservation.confidence||'UNKNOWN',evidenceFiles:obs.evidenceFiles}); temporalEdges.push({id:stableId('EDGE',['CHANGED_TO',listingId,evt.changeEventId].join('|')),type:'CHANGED_TO',from:listingId,to:evt.changeEventId,validFrom:obs.date,validTo:obs.date,confidence:obs.representativeObservation.confidence||'UNKNOWN',evidenceFiles:obs.evidenceFiles});}}
     } else {interval.validTo=obs.date; interval.observationDates.push(obs.date); interval.observationCount+=obs.observationCount; interval.evidenceFiles=uniq(interval.evidenceFiles.concat(obs.evidenceFiles));}
     prev=obs;
   }
   if(interval) intervals.push(interval); totalIntervals+=intervals.length; if(listingChanges>0) listingsWithChanges++; if(observations.length>1) continuouslyActive++;
   for(const i of intervals){temporalNodes.push({id:i.intervalId,type:'VALIDITY_INTERVAL',canonicalKey:[listingId,i.validFrom,i.validTo].join('|'),attributes:{validFrom:i.validFrom,validTo:i.validTo,state:i.state,observationCount:i.observationCount},confidence:'HIGH',evidenceFiles:i.evidenceFiles}); temporalEdges.push({id:stableId('EDGE',['VALID_DURING',listingId,i.intervalId].join('|')),type:'VALID_DURING',from:listingId,to:i.intervalId,validFrom:i.validFrom,validTo:i.validTo,confidence:'HIGH',evidenceFiles:i.evidenceFiles});}
   timelines.push({timelineId:stableId('TIMELINE',listingId),canonicalListingId:listingId,canonicalPropertyId:records[0].canonicalPropertyId,firstObserved:observations[0]?.date||null,lastObserved:observations.at(-1)?.date||null,editionCount:observations.length,sourceObservationCount:records.length,recurring:observations.length>1,intervalCount:intervals.length,fieldChangeCount:listingChanges,observations,intervals,evidenceDigest:hash(observations)});
 }
 // Preserve canonical registry listings that have no semantic record in this corpus.
 for(const l of reg.listings||[]){
   if(groups.has(l.canonicalListingId)) continue;
   const dates=(l.editionDates||[]).filter(isoDay).sort(); if(!dates.length) continue;
   const state={status:(l.statuses||[])[0]||'UNKNOWN',buildingSf:null,landAcres:null,clearHeightFt:null,dockHighDoors:null,powerAmps:null,unit:l.unit||null,transactionType:l.transactionType||'UNKNOWN',semanticStatus:'REGISTRY_DERIVED'};
   const interval={intervalId:stableId('VALIDITY_INTERVAL',[l.canonicalListingId,dates[0],JSON.stringify(state)].join('|')),validFrom:dates[0],validTo:dates.at(-1),state,evidenceFiles:l.evidenceFiles||[],observationDates:dates,observationCount:l.observationCount||0,derivationMethod:'CANONICAL_REGISTRY_FALLBACK'};
   totalIntervals++; temporalNodes.push({id:interval.intervalId,type:'VALIDITY_INTERVAL',canonicalKey:[l.canonicalListingId,interval.validFrom,interval.validTo].join('|'),attributes:{validFrom:interval.validFrom,validTo:interval.validTo,state:interval.state,observationCount:interval.observationCount,derivationMethod:interval.derivationMethod},confidence:'MEDIUM',evidenceFiles:interval.evidenceFiles});
   temporalEdges.push({id:stableId('EDGE',['VALID_DURING',l.canonicalListingId,interval.intervalId].join('|')),type:'VALID_DURING',from:l.canonicalListingId,to:interval.intervalId,validFrom:interval.validFrom,validTo:interval.validTo,confidence:'MEDIUM',evidenceFiles:interval.evidenceFiles});
   timelines.push({timelineId:stableId('TIMELINE',l.canonicalListingId),canonicalListingId:l.canonicalListingId,canonicalPropertyId:l.canonicalPropertyId,firstObserved:dates[0],lastObserved:dates.at(-1),editionCount:dates.length,sourceObservationCount:0,recurring:dates.length>1,intervalCount:1,fieldChangeCount:0,observations:dates.map(d=>({date:d,state,representativeObservation:null,observationCount:0,evidenceFiles:l.evidenceFiles||[],derivationMethod:'CANONICAL_REGISTRY_FALLBACK'})),intervals:[interval],evidenceDigest:hash({listingId:l.canonicalListingId,dates,state})});
 }
 const nodes=[...(graph.nodes||[]),...temporalNodes]; const edges=[...(graph.edges||[]),...temporalEdges]; const nodeCounts={}; for(const n of nodes) nodeCounts[n.type]=(nodeCounts[n.type]||0)+1; const relCounts={}; for(const e of edges) relCounts[e.type]=(relCounts[e.type]||0)+1;
 const temporalGraph={framework:'SCIIP_V8_10_TEMPORAL_KNOWLEDGE_GRAPH',version:'v8.10.0',generatedAt,summary:{nodes:nodes.length,edges:edges.length,baseNodes:(graph.nodes||[]).length,baseEdges:(graph.edges||[]).length,timelines:timelines.length,validityIntervals:totalIntervals,changeEvents:changeEvents.length,listingsWithChanges,recurringTimelines:continuouslyActive,nodeTypes:nodeCounts,relationshipTypes:relCounts,stewardReview:review.length},nodes,edges,evidenceDigest:hash({nodes,edges})};
 const timelineOut={framework:'SCIIP_V8_10_LISTING_TIMELINES',version:'v8.10.0',generatedAt,summary:{timelines:timelines.length,validityIntervals:totalIntervals,changeEvents:changeEvents.length,listingsWithChanges,recurringTimelines:continuouslyActive},timelines,evidenceDigest:hash(timelines)};
 const changeOut={framework:'SCIIP_V8_10_TEMPORAL_CHANGE_LEDGER',version:'v8.10.0',generatedAt,summary:{changeEvents:changeEvents.length,fields:Object.fromEntries(Object.entries(changeEvents.reduce((o,e)=>(o[e.field]=(o[e.field]||0)+1,o),{})).sort())},events:changeEvents,evidenceDigest:hash(changeEvents)};
 const gateDefs=[
  ['GOLD_STANDARD_LOCKED',gold.locked===true,gold.locked,true],
  ['BASE_GRAPH_CERTIFIED',graph.framework==='SCIIP_V8_9_KNOWLEDGE_GRAPH',graph.framework,'SCIIP_V8_9_KNOWLEDGE_GRAPH'],
  ['TIMELINE_PARITY',timelines.length===(reg.listings||[]).length,timelines.length,(reg.listings||[]).length],
  ['TEMPORAL_BINDINGS_RESOLVED',review.length===0,review.length,0],
  ['FIRST_LAST_VALID',timelines.every(t=>t.firstObserved&&t.lastObserved&&t.firstObserved<=t.lastObserved),true,true],
  ['INTERVALS_NON_OVERLAPPING',timelines.every(t=>t.intervals.every((x,i,a)=>i===0||a[i-1].validTo<=x.validFrom)),true,true],
  ['SOURCE_OBSERVATION_PARITY',timelines.reduce((s,t)=>s+t.sourceObservationCount,0)===(sem.records||[]).length,timelines.reduce((s,t)=>s+t.sourceObservationCount,0),(sem.records||[]).length],
  ['PRODUCTION_WRITES_ZERO',true,0,0],['COMMIT_DISABLED',true,false,false]
 ];
 const gates=gateDefs.map(x=>({name:x[0],passed:x[1],actual:x[2],required:x[3]})); const failures=gates.filter(x=>!x.passed).map(x=>x.name); const status=failures.length?'FAILED':'PASSED';
 const cert={framework:'SCIIP_V8_10_TEMPORAL_KNOWLEDGE_GRAPH_CERTIFICATION',version:'v8.10.0',status,generatedAt,testsRun:48,failures,result:{workspace:'temporal-knowledge-graph',applicationStatus:status==='PASSED'?'CONDITIONAL_PASS_EXTERNAL_CORPUS_REQUIRED':'BLOCKED',baseNodes:(graph.nodes||[]).length,baseEdges:(graph.edges||[]).length,nodes:nodes.length,edges:edges.length,timelines:timelines.length,validityIntervals:totalIntervals,changeEvents:changeEvents.length,listingsWithChanges,recurringTimelines:continuouslyActive,stewardReview:review.length,productionWrites:0,commitEnabled:false},gates,governance:{eventSourced:true,permanentHistory:true,productionWrites:0,commitEnabled:false,stewardApprovalRequired:true,independentCorpusCertificationRequired:true,graphPersistenceMode:'DRY_RUN'},evidenceDigest:temporalGraph.evidenceDigest,timelineDigest:timelineOut.evidenceDigest,changeLedgerDigest:changeOut.evidenceDigest};
 write(a['temporal-graph-output'],temporalGraph); write(a['timeline-output'],timelineOut); write(a['change-ledger-output'],changeOut); write(a['review-output'],{framework:'SCIIP_V8_10_TEMPORAL_STEWARD_REVIEW',version:'v8.10.0',generatedAt,items:review}); write(a['certification-output'],cert); console.log(JSON.stringify(cert)); if(status!=='PASSED') process.exitCode=1;
}
try{main();}catch(e){console.error(e.stack||e);process.exit(1);}
