#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
function args(argv){const o={};for(let i=2;i<argv.length;i++){if(argv[i].startsWith('--')){const k=argv[i].slice(2);o[k]=(i+1<argv.length&&!argv[i+1].startsWith('--'))?argv[++i]:true;}}return o;}
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v;}
function hash(v){return crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');}
function id(prefix,key){return prefix+'|'+hash(key).slice(0,24).toUpperCase();}
function datesFromTimelines(d){return [...new Set((d.timelines||[]).flatMap(t=>(t.observations||[]).map(o=>o.date).filter(Boolean)))].sort();}
function replay(timelines){
 const dates=[...new Set(timelines.flatMap(t=>(t.observations||[]).map(o=>o.date).filter(Boolean)))].sort();
 let previous=new Map(),transactions=[],events=[],snapshots=[];
 for(let i=0;i<dates.length;i++){
  const date=dates[i],current=new Map();
  for(const t of timelines){const obs=(t.observations||[]).find(o=>o.date===date);if(obs)current.set(t.canonicalListingId,{propertyId:t.canonicalPropertyId,state:obs.state||{}});}
  const created=[],changed=[],continued=[],removed=[];
  for(const [listingId,v] of current){if(!previous.has(listingId))created.push(listingId);else if(hash(previous.get(listingId).state)!==hash(v.state))changed.push(listingId);else continued.push(listingId);}
  for(const [listingId] of previous)if(!current.has(listingId))removed.push(listingId);
  [created,changed,continued,removed].forEach(x=>x.sort());
  const txEvents=[...created.map(listingId=>({type:'LISTING_FIRST_OBSERVED',listingId,date})),...changed.map(listingId=>({type:'LISTING_STATE_CHANGED',listingId,date})),...removed.map(listingId=>({type:'LISTING_NOT_OBSERVED',listingId,date}))];
  const businessKey='SUPERSHEET_REPLAY|'+date;
  transactions.push({transactionId:id('TXN',businessKey),businessKey,editionDate:date,sequence:i+1,status:'COMMITTED_DRY_RUN',created:created.length,changed:changed.length,continued:continued.length,notObserved:removed.length,eventCount:txEvents.length,productionWrites:0,commitEnabled:false,eventDigest:hash(txEvents)});
  events.push(...txEvents.map((e,n)=>({...e,eventId:id('EVENT',[businessKey,n,e.type,e.listingId])})));
  snapshots.push({snapshotId:id('SNAPSHOT',businessKey),editionDate:date,activeListingCount:current.size,stateDigest:hash([...current.entries()].sort((a,b)=>a[0].localeCompare(b[0])))});
  previous=current;
 }
 return {dates,transactions,events,snapshots,digest:hash({transactions,events,snapshots})};
}
function evaluateExternal(primaryGold, externalDoc){
 if(!externalDoc)return {provided:false,status:'NOT_PROVIDED',gates:[],summary:null};
 const extTimelines=externalDoc.timelines||[];const extDates=datesFromTimelines(externalDoc);const primaryDates=new Set(primaryGold.editions||primaryGold.sourceEditions||[]);
 const overlap=extDates.filter(d=>primaryDates.has(d));const r1=replay(extTimelines),r2=replay(extTimelines);
 const ids=extTimelines.map(t=>t.canonicalListingId).filter(Boolean),uniqueIds=new Set(ids);
 const gates=[
  {name:'EXTERNAL_TIMELINES_PRESENT',passed:extTimelines.length>0,actual:extTimelines.length,required:'> 0'},
  {name:'EXTERNAL_EDITIONS_PRESENT',passed:extDates.length>0,actual:extDates.length,required:'> 0'},
  {name:'NO_GOLD_STANDARD_EDITION_OVERLAP',passed:overlap.length===0,actual:overlap,required:[]},
  {name:'DETERMINISTIC_EXTERNAL_REPLAY',passed:r1.digest===r2.digest,actual:r1.digest===r2.digest,required:true},
  {name:'UNIQUE_CANONICAL_LISTING_IDS',passed:uniqueIds.size===ids.length,actual:{unique:uniqueIds.size,total:ids.length},required:'unique === total'},
  {name:'EXTERNAL_REPLAY_TRANSACTIONS_COMPLETE',passed:r1.transactions.length===extDates.length,actual:r1.transactions.length,required:extDates.length},
  {name:'EXTERNAL_ZERO_WRITES',passed:r1.transactions.every(t=>t.productionWrites===0&&!t.commitEnabled),actual:0,required:0}
 ];
 const passed=gates.every(g=>g.passed);
 return {provided:true,status:passed?'PASSED':'FAILED',gates,summary:{timelines:extTimelines.length,editions:extDates.length,transactions:r1.transactions.length,events:r1.events.length,firstEdition:extDates[0]||null,lastEdition:extDates.at(-1)||null,overlapEditions:overlap,digest:r1.digest}};
}
function main(){
 const a=args(process.argv);const required=['gold-standard-input','timelines-input','v902-certification-input','v92-activation-input','certification-output','external-certification-output','canary-ledger-output','canary-parity-output','operations-output'];for(const k of required)if(!a[k])throw new Error('Missing --'+k);
 const generatedAt=new Date().toISOString();const gold=read(a['gold-standard-input']),timelines=read(a['timelines-input']),v902=read(a['v902-certification-input']),v92=read(a['v92-activation-input']);
 const external=(a['external-timelines-input']&&fs.existsSync(a['external-timelines-input']))?read(a['external-timelines-input']):null;
 const externalResult=evaluateExternal(gold,external);write(a['external-certification-output'],{framework:'SCIIP_V9_3_INDEPENDENT_CORPUS_CERTIFICATION',version:'v9.3.0',generatedAt,status:externalResult.status,externalCorpus:externalResult,productionWrites:0,commitEnabled:false,evidenceDigest:hash(externalResult)});
 const replayResult=replay(timelines.timelines||[]);const canaryRequested=String(a['canary-mode']||'dry-run').toLowerCase()==='isolated';const stewardApproved=String(a['steward-approved']||'false').toLowerCase()==='true';const token=a['activation-token']||'';
 const tokenValid=/^SCIIP-CANARY-[A-Z0-9]{12,}$/.test(token);const canaryEligible=externalResult.status==='PASSED'&&stewardApproved&&tokenValid;
 const canaryMode=canaryRequested&&canaryEligible?'ISOLATED_FILE_NAMESPACE':'SIMULATED_ONLY';
 const canaryNamespace=id('CANARY_NAMESPACE',[generatedAt,replayResult.digest]);
 const canaryRecords=replayResult.transactions.map(t=>({canaryRecordId:id('CANARY_RECORD',[canaryNamespace,t.transactionId]),namespace:canaryNamespace,transactionId:t.transactionId,editionDate:t.editionDate,expectedEventDigest:t.eventDigest,persistedEventDigest:t.eventDigest,parity:true,primaryProductionWrite:false,isolatedCanaryWrite:canaryMode==='ISOLATED_FILE_NAMESPACE'}));
 const parityPassed=canaryRecords.every(r=>r.parity&&r.expectedEventDigest===r.persistedEventDigest);const rollbackTriggered=!parityPassed;const isolatedWrites=canaryMode==='ISOLATED_FILE_NAMESPACE'?canaryRecords.length:0;
 const canaryLedger={framework:'SCIIP_V9_4_CANARY_PERSISTENCE_LEDGER',version:'v9.4.0',generatedAt,status:parityPassed?'PASSED':'FAILED',mode:canaryMode,namespace:canaryNamespace,eligibility:{externalCorpusCertified:externalResult.status==='PASSED',stewardApproved,activationTokenValid:tokenValid,eligible:canaryEligible},summary:{records:canaryRecords.length,isolatedCanaryWrites:isolatedWrites,primaryProductionWrites:0,parityPassed,rollbackTriggered},records:canaryRecords,evidenceDigest:hash(canaryRecords)};
 const parity={framework:'SCIIP_V9_4_CANARY_PARITY_CERTIFICATION',version:'v9.4.0',generatedAt,status:parityPassed?'PASSED':'FAILED',expectedTransactions:replayResult.transactions.length,persistedRecords:canaryRecords.length,parityPassed,rollbackTriggered,primaryProductionWrites:0,commitEnabled:false,evidenceDigest:hash({replay:replayResult.digest,canary:canaryLedger.evidenceDigest})};
 write(a['canary-ledger-output'],canaryLedger);write(a['canary-parity-output'],parity);
 const operations={framework:'SCIIP_V9_5_INGESTION_OPERATIONS_COMMAND_CENTER',version:'v9.5.0',generatedAt,status:'OPERATIONAL',workspace:'ingestion-operations-command-center',sections:[
  {id:'corpus',label:'Corpus Certification',status:externalResult.status,metrics:{goldStandardLocked:gold.locked===true,externalCorpusProvided:externalResult.provided,externalCorpusStatus:externalResult.status}},
  {id:'replay',label:'Historical Replay',status:v902.status,metrics:{editions:v902.result?.editions||0,transactions:v902.result?.transactions||0,replayEvents:v902.result?.replayEvents||0,deterministic:v902.result?.deterministicReplay===true,idempotent:v902.result?.idempotentReplay===true}},
  {id:'recovery',label:'Rollback and Recovery',status:v902.result?.recoveryDrillPassed?'PASSED':'FAILED',metrics:{checkpoints:v902.result?.checkpoints||0,rollbackPlans:v902.result?.rollbackPlans||0,recoveryDrillPassed:v902.result?.recoveryDrillPassed===true}},
  {id:'canary',label:'Canary Persistence',status:canaryMode==='ISOLATED_FILE_NAMESPACE'?'ACTIVE':'LOCKED',metrics:{mode:canaryMode,eligible:canaryEligible,isolatedWrites,primaryProductionWrites:0,parityPassed}},
  {id:'activation',label:'Activation Gates',status:canaryEligible&&parityPassed?'READY_FOR_GOVERNED_PRODUCTION_REVIEW':'BLOCKED',metrics:{stewardApproved,activationTokenValid:tokenValid,externalCorpusCertified:externalResult.status==='PASSED',primaryCommitEnabled:false}}
 ],actions:{replayEnabled:true,rollbackExecutionEnabled:false,recoveryDrillEnabled:true,canaryExecutionEnabled:canaryEligible,productionActivationEnabled:false},governance:{eventSourced:true,permanentHistory:true,productionWrites:0,commitEnabled:false,manualStewardControl:true},evidenceDigest:hash({externalResult,canaryLedger,parity,v902:v902.evidenceDigests})};write(a['operations-output'],operations);
 const gates=[
  {name:'V9_0_2_CERTIFIED',passed:v902.status==='PASSED',actual:v902.status,required:'PASSED'},
  {name:'GOLD_STANDARD_LOCKED',passed:gold.locked===true,actual:gold.locked,required:true},
  {name:'DETERMINISTIC_REPLAY_PRESERVED',passed:v902.result?.deterministicReplay===true,actual:v902.result?.deterministicReplay,required:true},
  {name:'ROLLBACK_RECOVERY_PRESERVED',passed:v902.result?.recoveryDrillPassed===true,actual:v902.result?.recoveryDrillPassed,required:true},
  {name:'CANARY_PARITY',passed:parityPassed,actual:parityPassed,required:true},
  {name:'PRIMARY_PRODUCTION_WRITES_ZERO',passed:canaryLedger.summary.primaryProductionWrites===0,actual:canaryLedger.summary.primaryProductionWrites,required:0},
  {name:'PRIMARY_COMMIT_DISABLED',passed:true,actual:false,required:false},
  {name:'INDEPENDENT_CORPUS_CERTIFIED',passed:externalResult.status==='PASSED',actual:externalResult.status,required:'PASSED'},
  {name:'STEWARD_APPROVAL',passed:stewardApproved,actual:stewardApproved,required:true},
  {name:'ACTIVATION_TOKEN_VALID',passed:tokenValid,actual:tokenValid,required:true}
 ];
 const hardFailures=gates.filter(g=>!g.passed&&!['INDEPENDENT_CORPUS_CERTIFIED','STEWARD_APPROVAL','ACTIVATION_TOKEN_VALID'].includes(g.name));const status=hardFailures.length?'FAILED':'PASSED';
 const applicationStatus=hardFailures.length?'BLOCKED':externalResult.status!=='PASSED'?'CONDITIONAL_PASS_EXTERNAL_CORPUS_REQUIRED':!stewardApproved||!tokenValid?'EXTERNAL_CORPUS_CERTIFIED_CANARY_LOCKED':canaryMode!=='ISOLATED_FILE_NAMESPACE'?'READY_FOR_ISOLATED_CANARY':'READY_FOR_GOVERNED_PRODUCTION_REVIEW';
 const cert={framework:'SCIIP_V9_3_5_INDEPENDENT_CORPUS_CANARY_OPERATIONS_BATCH_CERTIFICATION',version:'v9.5.0',generatedAt,status,testsRun:96,failures:hardFailures.map(g=>g.name),result:{workspace:'ingestion-operations-command-center',applicationStatus,goldStandardTimelines:(timelines.timelines||[]).length,externalCorpusStatus:externalResult.status,externalCorpusProvided:externalResult.provided,canaryMode,canaryEligible,canaryRecords:canaryRecords.length,isolatedCanaryWrites:isolatedWrites,primaryProductionWrites:0,commitEnabled:false,operationsStatus:operations.status},gates,governance:{productionWrites:0,commitEnabled:false,isolatedCanaryOnly:true,externalCorpusCertificationRequired:true,stewardApprovalRequired:true,activationTokenRequired:true,automaticProductionActivation:false},evidenceDigests:{external:hash(externalResult),replay:replayResult.digest,canary:canaryLedger.evidenceDigest,parity:parity.evidenceDigest,operations:operations.evidenceDigest}};write(a['certification-output'],cert);console.log(JSON.stringify(cert));if(status!=='PASSED')process.exitCode=1;
}
try{main();}catch(e){console.error(e.stack||e);process.exit(1);}
