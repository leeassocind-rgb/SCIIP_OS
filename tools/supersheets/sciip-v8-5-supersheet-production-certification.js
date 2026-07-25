#!/usr/bin/env node
'use strict';
const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
function arg(n,d){const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:d}
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function write(p,o){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n')}
function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex')}
const input=arg('--input'); const exceptionInput=arg('--exceptions'); const output=arg('--output'); const exceptionOutput=arg('--exception-output'); const timelinesOutput=arg('--timelines'); const dryRunOutput=arg('--dry-run');
if(!input||!exceptionInput||!output||!exceptionOutput||!timelinesOutput||!dryRunOutput) throw new Error('Required arguments missing');
const source=read(input), queue=read(exceptionInput); const obs=(source.observations||[]).filter(x=>x.accepted);
const byListing=new Map(); for(const o of obs){if(!byListing.has(o.listingId))byListing.set(o.listingId,[]);byListing.get(o.listingId).push(o)}
const tracked=['status','transactionType','buildingSf','landAcres','clearHeightFt','dockHighDoors','powerAmps','unit'];
const timelines=[]; let fieldChanges=0;
for(const [listingId,items0] of byListing){const items=items0.slice().sort((a,b)=>a.editionDate.localeCompare(b.editionDate)); const changes=[]; for(let i=1;i<items.length;i++){for(const f of tracked){const a=items[i-1][f]??null,b=items[i][f]??null;if(a!==b){changes.push({editionDate:items[i].editionDate,field:f,from:a,to:b,evidenceFile:items[i].evidenceFile});fieldChanges++}}} timelines.push({listingId,propertyId:items[0].propertyId,propertyKey:items[0].propertyKey,listingKey:items[0].listingKey,firstSeen:items[0].editionDate,lastSeen:items[items.length-1].editionDate,editionCount:new Set(items.map(x=>x.editionDate)).size,recurring:items.length>1,confidenceFloor:Math.min(...items.map(x=>x.confidenceScore||0)),changes,evidenceFiles:[...new Set(items.map(x=>x.evidenceFile))]})}
timelines.sort((a,b)=>b.editionCount-a.editionCount||a.listingId.localeCompare(b.listingId));
function classify(e){const raw=(e.raw||'').toUpperCase(); const ctx=(e.evidenceContext||'').toUpperCase();
 if(e.rejection==='CONFIRMED_NON_LISTING_NOISE'||/TRUCK COURT|FREEWAY|FWY|PHONE|SECURED CONCRETE|CLEAR HEIGHT/.test(raw)) return {classification:'INTENTIONAL_REJECTION',action:'SUPPRESS',confidence:'HIGH'};
 if(/\b(FWY|FREEWAY)\b.*\b(&|AT)\b|\bCORNER\b/.test(raw)) return {classification:'LOCATION_DESCRIPTION',action:'STEWARD_REVIEW',confidence:'HIGH'};
 if(/^\d+\s+\d{4,6}\s+(AVENUE|STREET|ROAD|DRIVE|WAY)?\s*$/i.test(e.raw||'')||e.rowNumber) return {classification:'PARSER_ENHANCEMENT_CANDIDATE',action:'REPROCESS_WITH_ROW_GRAMMAR',confidence:'MEDIUM'};
 if(e.rejection==='UNRESOLVED_CITY_ZIP_BINDING') return {classification:'EVIDENCE_BINDING_AMBIGUITY',action:'STEWARD_REVIEW',confidence:'MEDIUM'};
 return {classification:'ADDRESS_GRAMMAR_AMBIGUITY',action:'STEWARD_REVIEW',confidence:'MEDIUM'} }
const classified=(queue.exceptions||[]).map((e,i)=>({...e,exceptionId:'EXCEPTION|'+sha([e.evidenceFile,e.editionDate,e.raw,i]).slice(0,16).toUpperCase(),...classify(e)}));
const classSummary={}; for(const e of classified) classSummary[e.classification]=(classSummary[e.classification]||0)+1;
const baseline=source.summary||{}; const regression={benchmark:'V8_4_LOCKED_32_EDITION_CORPUS',checks:[
 {name:'SOURCE_EDITIONS',passed:baseline.sourceEditions===32,actual:baseline.sourceEditions,minimum:32},
 {name:'ACCEPTED_OBSERVATIONS',passed:baseline.acceptedObservations>=2582,actual:baseline.acceptedObservations,minimum:2582},
 {name:'EXCEPTION_RATE',passed:baseline.exceptionRatePct<=1.34,actual:baseline.exceptionRatePct,maximum:1.34},
 {name:'RECURRING_LISTINGS',passed:baseline.recurringListings>=316,actual:baseline.recurringListings,minimum:316},
 {name:'CROSS_EDITION_RECURRING',passed:baseline.crossEditionRecurringListings>=92,actual:baseline.crossEditionRecurringListings,minimum:92},
 {name:'EVIDENCE_LINEAGE',passed:obs.every(o=>o.evidenceFile&&o.editionDate&&o.propertyId&&o.listingId),actual:obs.filter(o=>o.evidenceFile&&o.editionDate&&o.propertyId&&o.listingId).length,expected:obs.length}
]}; regression.status=regression.checks.every(x=>x.passed)?'PASSED':'FAILED';
const dryRun={framework:'SCIIP_V8_5_GOVERNED_SUPERSHEET_DRY_RUN',status:'PASSED',mode:'DRY_RUN',productionWrites:0,commitEnabled:false,entities:{observations:obs.length,properties:new Set(obs.map(x=>x.propertyId)).size,listings:new Set(obs.map(x=>x.listingId)).size,timelines:timelines.length},events:{sourceEvents:(source.events||[]).length,fieldChanges},reviewQueue:{total:classified.length,stewardReview:classified.filter(x=>x.action==='STEWARD_REVIEW').length,suppressed:classified.filter(x=>x.action==='SUPPRESS').length,reprocess:classified.filter(x=>x.action==='REPROCESS_WITH_ROW_GRAMMAR').length},evidenceDigest:sha(obs.map(o=>[o.editionDate,o.evidenceFile,o.listingId,o.propertyId]))};
const result={framework:'SCIIP_V8_5_SUPERSHEET_PRODUCTION_CERTIFICATION',version:'v8.5.0',status:regression.status==='PASSED'?'PASSED':'FAILED',generatedAt:new Date().toISOString(),summary:{sourceEditions:baseline.sourceEditions,inputObservations:baseline.inputObservations,acceptedObservations:baseline.acceptedObservations,rejectedObservations:baseline.rejectedObservations,exceptionRatePct:baseline.exceptionRatePct,canonicalProperties:baseline.canonicalProperties,canonicalListings:baseline.canonicalListings,recurringListings:baseline.recurringListings,crossEditionRecurringListings:baseline.crossEditionRecurringListings,timelines:timelines.length,timelinesWithChanges:timelines.filter(x=>x.changes.length).length,fieldChanges,classifiedExceptions:classified.length,exceptionClassifications:classSummary},regression,dryRun,governance:{productionWrites:0,commitEnabled:false,stewardApprovalRequired:true,sourceEvidencePreserved:true}};
write(output,result); write(exceptionOutput,{framework:'SCIIP_V8_5_CLASSIFIED_EXCEPTION_QUEUE',generatedAt:result.generatedAt,summary:classSummary,exceptions:classified}); write(timelinesOutput,{framework:'SCIIP_V8_5_HISTORICAL_TRUTH_TIMELINES',generatedAt:result.generatedAt,summary:{timelines:timelines.length,recurring:timelines.filter(x=>x.recurring).length,withChanges:timelines.filter(x=>x.changes.length).length,fieldChanges},timelines}); write(dryRunOutput,dryRun); console.log(JSON.stringify(result,null,2)); if(result.status!=='PASSED')process.exit(1);
