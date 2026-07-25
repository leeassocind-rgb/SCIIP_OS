#!/usr/bin/env node
'use strict';
const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
const deltaEngine=require('./sciip-v9-sprint26-market-observation-delta-engine.js');
const baselineEngine=require('./sciip-v9-sprint27-production-baseline-engine.js');
const MATERIAL_FIELDS=['listingStatus','transactionType','availableSf','buildingSf','askingRate','askingPrice','brokerage','suite'];
function text(v){return String(v??'').trim()}
function hash(v){return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex')}
function norm(v){return text(v).toUpperCase().replace(/\bSTREET\b/g,'ST').replace(/\bAVENUE\b/g,'AVE').replace(/\bBOULEVARD\b/g,'BLVD').replace(/\bROAD\b/g,'RD').replace(/\bDRIVE\b/g,'DR').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function dateFromName(name){const m=name.match(/(?:^|[^0-9])(\d{1,2})[-_](\d{1,2})[-_](\d{4})(?:[^0-9]|$)/); if(!m)return null; return `${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function snapshotFromObject(obj,file){
 const date=text(obj.snapshotDate||obj.observationDate||obj.date||obj.baseline?.observationDate||dateFromName(path.basename(file)));
 const records=obj.observations||obj.listings||obj.records||obj.rows||[];
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error(`Snapshot date missing or invalid: ${file}`);
 if(!Array.isArray(records))throw new Error(`Snapshot records must be an array: ${file}`);
 return {date,records,source:{fileName:path.basename(file),checksum:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}};
}
function loadSnapshots(dir){
 if(!fs.existsSync(dir))throw new Error(`Snapshots directory not found: ${dir}`);
 return fs.readdirSync(dir).filter(x=>x.toLowerCase().endsWith('.json')).map(x=>{const p=path.join(dir,x);return snapshotFromObject(readJson(p),p)}).sort((a,b)=>a.date.localeCompare(b.date)||a.source.fileName.localeCompare(b.source.fileName));
}
function uniqueByDate(items){const seen=new Map(); for(const item of items){if(seen.has(item.date))throw new Error(`Multiple snapshots found for ${item.date}: ${seen.get(item.date).source.fileName}, ${item.source.fileName}`); seen.set(item.date,item)} return items}
function canonicalIndex(records){const map=new Map(); for(const raw of records){const r=deltaEngine.normalizeObservation(raw); if(map.has(r.canonicalListingId)) continue; map.set(r.canonicalListingId,r)} return map}
function compareToCurrent(reconstructed,target){
 const left=canonicalIndex(reconstructed), right=canonicalIndex(target); const missingFromTarget=[],missingFromReplay=[],attributeConflicts=[];
 for(const [id,r] of left){if(!right.has(id)){missingFromTarget.push({canonicalListingId:id,address:r.address,city:r.city,status:r.listingStatus});continue} const t=right.get(id),differences=[]; for(const f of MATERIAL_FIELDS){const a=r[f]??null,b=t[f]??null;if(String(a)!==String(b))differences.push({field:f,reconstructed:a,currentAir:b})} if(differences.length)attributeConflicts.push({canonicalListingId:id,address:r.address,city:r.city,differences})}
 for(const [id,r] of right){if(!left.has(id))missingFromReplay.push({canonicalListingId:id,address:r.address,city:r.city,status:r.listingStatus})}
 const union=new Set([...left.keys(),...right.keys()]).size; const matched=[...left.keys()].filter(x=>right.has(x)).length; const identityAgreementPct=union?Number((matched/union*100).toFixed(2)):100;
 return {summary:{reconstructedListings:left.size,currentAirListings:right.size,matchedListings:matched,identityAgreementPct,missingFromCurrentAir:missingFromTarget.length,missingFromReplay:missingFromReplay.length,attributeConflictListings:attributeConflicts.length},missingFromCurrentAir:missingFromTarget,missingFromReplay,attributeConflicts};
}
function findField(row,names){for(const [k,v] of Object.entries(row)){if(names.some(n=>norm(k)===norm(n)))return v}return ''}
function corroborate(events,leeProFile){
 if(!leeProFile)return {enabled:false,summary:{sourceRows:0,eligibleTransactions:0,matchedEvents:0,futureEffectiveRows:0},matches:[]};
 const rows=baselineEngine.readXlsx(leeProFile); const tx=rows.map((r,i)=>({rowNumber:i+2,address:text(findField(r,['Property Address','Address','Property Location','Location'])),city:text(findField(r,['City'])),type:text(findField(r,['Comp Type','Transaction Type','Deal Type','Type'])),date:text(findField(r,['Comp Date','Date','Transaction Date','Lease Date','Sale Date'])),tenant:text(findField(r,['Tenant','Buyer'])),raw:r}));
 const future=tx.filter(x=>/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(x.date)&&new Date(x.date)>new Date('2026-07-24T23:59:59Z'));
 const candidates=events.filter(e=>['LEASED','SOLD','CONFIRMED_REMOVAL','STATUS_CHANGED'].includes(e.eventType)); const matches=[];
 for(const e of candidates){const ea=norm(e.currentObservation?.address||e.previousObservation?.address||e.address), ec=norm(e.currentObservation?.city||e.previousObservation?.city||e.city); const found=tx.find(x=>norm(x.address)===ea&&(!ec||!x.city||norm(x.city)===ec)); if(found)matches.push({eventId:e.eventId,eventType:e.eventType,eventDate:e.effectiveDate||e.observationDate||null,leeProRow:found.rowNumber,leeProType:found.type,leeProDate:found.date,confidence:'MEDIUM',method:'NORMALIZED_ADDRESS_CITY'})}
 return {enabled:true,summary:{sourceRows:rows.length,eligibleTransactions:tx.length-future.length,matchedEvents:matches.length,futureEffectiveRows:future.length},matches,futureEffectiveRows:future.map(x=>({rowNumber:x.rowNumber,address:x.address,city:x.city,type:x.type,date:x.date}))};
}
function runReplay(cfg){
 const baseline=snapshotFromObject(readJson(cfg.baselineFile),cfg.baselineFile); if(baseline.date!=='2026-06-04')throw new Error(`Expected baseline 2026-06-04, received ${baseline.date}`);
 const snapshots=uniqueByDate(loadSnapshots(cfg.snapshotsDirectory)); if(!snapshots.length)throw new Error('No replay snapshots found'); if(snapshots[0].date!=='2026-06-05')throw new Error(`First replay snapshot must be 2026-06-05, received ${snapshots[0].date}`);
 let previous=baseline, absence={}; const comparisons=[],events=[];
 for(const current of snapshots){if(current.date<=previous.date)throw new Error(`Snapshots are not chronological at ${current.date}`); const d=deltaEngine.compareSnapshots({previousSnapshot:{date:previous.date,records:previous.records,source:previous.source},currentSnapshot:{date:current.date,records:current.records,source:current.source},priorAbsenceStreaks:absence,policy:{absenceConfirmationDays:Number(cfg.absenceConfirmationDays||2)}}); absence=d.nextAbsenceStreaks; comparisons.push({previousDate:previous.date,currentDate:current.date,summary:d.summary,evidenceDigest:d.evidenceDigest}); events.push(...d.events.map(e=>({...e,replayPreviousDate:previous.date,replayCurrentDate:current.date}))); previous=current}
 let reconciliation={enabled:false}; if(cfg.currentAirFile){const target=snapshotFromObject(readJson(cfg.currentAirFile),cfg.currentAirFile); reconciliation={enabled:true,targetDate:target.date,...compareToCurrent(previous.records,target.records)}}
 const corroboration=corroborate(events,cfg.leeProFile);
 const result={framework:'SCIIP_V9_SPRINT27B_REAL_DATA_REPLAY_RECONCILIATION',version:'v9.0-sprint27b.0',status:'REVIEW_READY',generatedAt:new Date().toISOString(),timeline:{baselineDate:baseline.date,firstReplayDate:snapshots[0].date,lastReplayDate:snapshots.at(-1).date,snapshotsProcessed:snapshots.length},summary:{baselineListings:baseline.records.length,replaySnapshots:snapshots.length,comparisons:comparisons.length,totalCandidateEvents:events.length,reconstructedListings:previous.records.length,replayFailures:0},comparisons,eventLedger:events,reconstructedState:{date:previous.date,records:previous.records,evidenceDigest:hash(previous.records)},reconciliation,leeProCorroboration:corroboration,exceptions:{reconciliationMissingFromCurrentAir:reconciliation.missingFromCurrentAir||[],reconciliationMissingFromReplay:reconciliation.missingFromReplay||[],attributeConflicts:reconciliation.attributeConflicts||[],futureEffectiveLeePro:corroboration.futureEffectiveRows||[]},governance:{readOnly:true,eventSourced:true,baselineImmutable:true,chronologicalReplayRequired:true,missingMeansRemovalCandidate:true,removalRequiresConfirmation:true,transactionCorroborationDoesNotForceMatch:true,canonicalWrites:0,commitEnabled:false,humanApprovalRequired:true}};
 result.certification={evidenceDigest:hash({timeline:result.timeline,comparisons:result.comparisons,eventLedger:result.eventLedger,reconciliation:result.reconciliation,corroboration:result.leeProCorroboration}),readyForCanonicalWrites:false}; return result;
}
function parseArgs(){const o={};for(let i=2;i<process.argv.length;i++)if(process.argv[i].startsWith('--')){const k=process.argv[i].slice(2);o[k]=process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[++i]:true}return o}
function cli(){const a=parseArgs();if(!a.config||!a.output)throw new Error('Usage: --config <sprint27b-config.json> --output <review-package.json>');const cfg=readJson(path.resolve(a.config));for(const k of ['baselineFile','snapshotsDirectory','currentAirFile','leeProFile'])if(cfg[k])cfg[k]=path.resolve(path.dirname(path.resolve(a.config)),cfg[k]);const r=runReplay(cfg);fs.mkdirSync(path.dirname(path.resolve(a.output)),{recursive:true});fs.writeFileSync(path.resolve(a.output),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({framework:r.framework,status:r.status,timeline:r.timeline,summary:r.summary,reconciliation:r.reconciliation.summary||null,canonicalWrites:0,commitEnabled:false}))}
module.exports={runReplay,loadSnapshots,snapshotFromObject,compareToCurrent,corroborate}; if(require.main===module){try{cli()}catch(e){console.error(e.stack||e);process.exit(1)}}
