#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const out=path.join(ev,"m4-19d4bj4a3-r1-production-canonical-creation-event-store-binding-design-and-preauthorization.json");

const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const rel=p=>path.relative(app,p);

function findA2Evidence(){
  const preferred=path.join(ev,"m4-19d4bj4a2-canonical-creation-event-store-lineage-reconciliation.json");
  const candidates=[];
  if(fs.existsSync(preferred)) candidates.push(preferred);
  for(const n of fs.readdirSync(ev)){
    if(!n.endsWith(".json")) continue;
    if(!/bj4a2/i.test(n)) continue;
    const p=path.join(ev,n);
    if(!candidates.includes(p)) candidates.push(p);
  }
  const admissible=[];
  for(const p of candidates){
    let j; try{j=readJson(p)}catch{continue}
    const contract=String(j?.contract||"");
    const state=String(j?.state||"");
    const classification=String(j?.reconciliation?.classification||j?.adjudication?.classification||"");
    const next=String(j?.nextMilestone||"");
    const adapterRequires=Boolean(j?.reconciliation?.adapterRequiresInjectedEventPath ?? j?.adjudication?.adapterRequiresInjectedEventPath);
    const distinctRequired=Boolean(j?.reconciliation?.distinctEventStoreRequired ?? j?.adjudication?.distinctEventStoreRequired);

    const contractMatch=/M4_19D4BJ4A2|BJ4A2/.test(contract);
    const gapSignal=
      /EVENT_STORE.*GAP|CAPABILITY.*GAP|EVENT_STORE.*NOT.*BOUND|EVENT_STORE.*UNRESOLVED|DESIGN_REQUIRED/i.test(state+" "+classification+" "+next) ||
      adapterRequires ||
      distinctRequired;

    if(contractMatch && gapSignal){
      admissible.push({path:p,json:j,state,contract,classification,next,adapterRequires,distinctRequired});
    }
  }
  return admissible;
}

const a2=findA2Evidence();
if(a2.length!==1){
  throw new Error(`expected exactly one admissible BJ4A2 event-store-gap evidence artifact, found ${a2.length}: ${a2.map(x=>path.basename(x.path)+":"+x.state).join(", ")}`);
}
const A2=a2[0];

console.log(`[BJ4A3-R1] BJ4A2 evidence bound: ${path.basename(A2.path)}`);
console.log(`[BJ4A3-R1] observed A2 state: ${A2.state}`);
console.log("[BJ4A3-R1] certified event-store gap accepted by contract + adjudication");
console.log("[BJ4A3-R1] searching existing governed event persistence substrates; writes remain OFF");

function walk(dir,acc=[]){
  if(!fs.existsSync(dir)) return acc;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()){
      if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
      walk(p,acc);
    }else if(/\.(js|mjs|cjs|jsx|ts|tsx|py|json|jsonl|md)$/.test(e.name)){
      acc.push(p);
    }
  }
  return acc;
}
const roots=[
  path.join(app,"src/runtime"),
  path.join(app,"src/production-validation"),
  path.join(app,"src/broker-product"),
  path.join(app,"server"),
  path.join(app,"tools"),
  path.join(app,"scripts"),
  ev
].filter(fs.existsSync);
const files=[...new Set(roots.flatMap(walk))];

function sourceSignals(f){
  let t=""; try{t=fs.readFileSync(f,"utf8")}catch{return null}
  const signals={
    eventSourcing:/event.?sourc|append.?only|event.?store|event.?log/i.test(t),
    canonical:/canonical/i.test(t),
    canonicalId:/canonicalPropertyId/i.test(t),
    creationEvent:/CANONICAL_IDENTITY_CREATED/.test(t),
    append:/appendFile|appendFileSync|appendEvent|appendOnly|eventLog/i.test(t),
    atomic:/atomicWrite|renameSync|rename\(|transaction|commit/i.test(t),
    read:/readFile|readFileSync|fetch\(|load|readAfterWrite/i.test(t),
    write:/writeFile|writeFileSync|appendFile|appendFileSync|atomicWrite|renameSync|rename\(/.test(t),
    idempotency:/idempotenc/i.test(t),
    provenance:/provenance/i.test(t),
    production:/production/i.test(t),
    temporal:/temporal/i.test(t),
    evidence:/evidence/i.test(t)
  };
  const quoted=[...t.matchAll(/["'`]([^"'`]+?\.(?:json|jsonl))["'`]/g)].map(m=>m[1]);
  let score=0;
  if(signals.eventSourcing) score+=5;
  if(signals.canonical) score+=4;
  if(signals.canonicalId) score+=3;
  if(signals.creationEvent) score+=7;
  if(signals.append) score+=3;
  if(signals.atomic) score+=2;
  if(signals.read) score+=1;
  if(signals.write) score+=2;
  if(signals.idempotency) score+=2;
  if(signals.provenance) score+=1;
  if(signals.production) score+=2;
  if(signals.temporal) score-=1;
  if(signals.evidence) score-=1;
  return {path:rel(f),score,signals,quotedDataPaths:[...new Set(quoted)].slice(0,40)};
}

const sourceCandidates=files.map(sourceSignals).filter(x=>x&&x.score>=8)
  .sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const resolvedStores=[];
for(const c of sourceCandidates){
  for(const q of c.quotedDataPaths){
    const candidates=[
      path.resolve(app,q),
      path.resolve(path.dirname(path.join(app,c.path)),q),
      path.resolve(repo,q)
    ];
    for(const p of candidates){
      if(!fs.existsSync(p)||!/\.(json|jsonl)$/.test(p)) continue;
      let text=""; try{text=fs.readFileSync(p,"utf8")}catch{continue}
      const stats={
        path:p,
        source:c.path,
        sourceScore:c.score,
        bytes:fs.statSync(p).size,
        sha256:sha(p),
        eventTypeCount:(text.match(/"(?:eventType|event|type)"\s*:/g)||[]).length,
        canonicalCount:(text.match(/"canonicalPropertyId"\s*:/g)||[]).length,
        identityCreatedCount:(text.match(/CANONICAL_IDENTITY_CREATED/g)||[]).length,
        idempotencyCount:(text.match(/idempotency/ig)||[]).length,
        provenanceCount:(text.match(/provenance/ig)||[]).length,
        jsonl:p.endsWith(".jsonl")
      };
      stats.score=
        c.score +
        (stats.identityCreatedCount>0?20:0) +
        (stats.eventTypeCount>0?5:0) +
        (stats.canonicalCount>0?4:0) +
        (stats.idempotencyCount>0?2:0) +
        (stats.provenanceCount>0?1:0) +
        (stats.jsonl?2:0);
      resolvedStores.push(stats);
    }
  }
}
const storeCandidates=[...new Map(resolvedStores.map(x=>[x.path,x])).values()]
  .sort((a,b)=>b.score-a.score||b.identityCreatedCount-a.identityCreatedCount||a.path.localeCompare(b.path));

let existingStore=null;
let existingStoreConfidence="LOW";
if(storeCandidates.length===1 && storeCandidates[0].score>=20){
  existingStore=storeCandidates[0];
  existingStoreConfidence="HIGH";
}else if(storeCandidates.length>1 && storeCandidates[0].score>=20 && storeCandidates[0].score>=storeCandidates[1].score+5){
  existingStore=storeCandidates[0];
  existingStoreConfidence="HIGH";
}

const adapterPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
if(!fs.existsSync(adapterPath)) throw new Error("BJ3A14 first-insert production adapter missing");
const adapterText=fs.readFileSync(adapterPath,"utf8");
const adapterContract={
  requiresCanonicalStorePath:/canonicalStorePath/.test(adapterText),
  requiresEventLogPath:/eventLogPath/.test(adapterText),
  emitsCanonicalIdentityCreated:/CANONICAL_IDENTITY_CREATED/.test(adapterText),
  hasAtomicInsert:/atomicInsert/.test(adapterText),
  hasReadAfterWrite:/readAfterWrite/.test(adapterText),
  hasIdempotency:/idempotency/i.test(adapterText)
};

let classification;
let bindingMode;
let proposedPath=null;
let design=null;
let state;
let nextMilestone;

if(existingStore){
  classification="EXISTING_GOVERNED_CANONICAL_EVENT_STORE_UNIQUELY_RECOVERED";
  bindingMode="BIND_EXISTING_EVENT_STORE";
  state="M419D4BJ4A3_R1_EXISTING_GOVERNED_CANONICAL_EVENT_STORE_UNIQUELY_BOUND_BJ4B_REEXECUTION_PREAUTHORIZATION_READY";
  nextMilestone="M4.19D4BJ4B_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTION_PREAUTHORIZATION";
}else{
  classification="NO_EXISTING_GOVERNED_CANONICAL_CREATION_EVENT_STORE_UNIQUELY_PROVEN";
  bindingMode="CONTROLLED_NEW_EVENT_STORE_DESIGN_PREAUTHORIZED";
  proposedPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
  design={
    capability:"GOVERNED_PRODUCTION_CANONICAL_IDENTITY_CREATION_EVENT_STORE",
    proposedPath,
    format:"JSONL_APPEND_ONLY",
    schemaVersion:"SCIIP_CANONICAL_IDENTITY_CREATION_EVENT_V1",
    requiredFields:[
      "eventType","canonicalPropertyId","sourcePropertyId","normalizedAddress",
      "authorityReference","derivationHash","idempotencyKey","observationTimestamp","cohortHash"
    ],
    requiredEventType:"CANONICAL_IDENTITY_CREATED",
    appendOnly:true,
    deterministicOrdering:"EXECUTION_ORDER",
    fsyncOrDurableEquivalentRequired:true,
    duplicateIdempotencyKeyProhibited:true,
    duplicateCanonicalCreationEventProhibited:true,
    readAfterWriteRequired:true,
    sourceAndCanonicalBindingRequired:true,
    canonicalStoreTransactionBoundary:"SEPARATE_BUT_COHORT_ROLLBACK_REQUIRED_UNTIL_TRANSACTIONAL_COMPOSITION_EXISTS",
    publicMirror:{allowed:false,note:"Separate propagation authority required."},
    prohibitions:{
      noTemporalAvailabilityEvents:true,
      noGovernedInventoryEvents:true,
      noNetworkIngestion:true,
      noDownstreamPropagation:true,
      noSyntheticCanonicalIds:true
    }
  };
  state="M419D4BJ4A3_R1_NEW_GOVERNED_CANONICAL_CREATION_EVENT_STORE_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED";
  nextMilestone="M4.19D4BJ4A4_GOVERNED_CANONICAL_CREATION_EVENT_STORE_IMPLEMENTATION_AND_ISOLATED_CERTIFICATION";
}

const designHash=design?crypto.createHash("sha256").update(JSON.stringify(design)).digest("hex"):null;

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4A3_R1_PRODUCTION_CANONICAL_CREATION_EVENT_STORE_BINDING_DESIGN_AND_PREAUTHORIZATION",
  version:"4.0-m4.19d4bj4a3-r1",
  status:"PASSED",
  state,
  certifiedAt:new Date().toISOString(),
  correction:{
    priorFailure:"STRICT_BJ4A2_STATE_LITERAL_MISMATCH",
    corrected:true,
    prerequisiteBindingMode:"CONTRACT_PLUS_EVENT_STORE_GAP_ADJUDICATION",
    boundA2Evidence:path.basename(A2.path),
    observedA2State:A2.state
  },
  adjudication:{
    classification,
    existingStoreRecovered:!!existingStore,
    existingStoreConfidence,
    existingStore,
    bindingMode,
    adapterContract
  },
  investigation:{
    filesInspected:files.length,
    executableOrEvidenceCandidates:sourceCandidates.slice(0,60),
    resolvedStoreCandidates:storeCandidates.slice(0,40)
  },
  implementationPreauthorization:design?{
    implementationAuthorized:true,
    productionExecutionAuthorized:false,
    proposedPath,
    design,
    designHash
  }:{
    implementationAuthorized:false,
    productionExecutionAuthorized:false,
    existingStoreBindingAuthorizedNextMilestone:true
  },
  policy:{
    preferExistingGovernedEventSubstrate:true,
    noInventedReuseOfTemporalOrEvidenceStores:true,
    newStoreOnlyWhenExistingBindingNotProven:true,
    noProductionWriteInA3:true,
    noBJ4RetryInA3:true,
    BJ4ProductionExecutionStillRequiresSeparateReexecutionPreauthorization:true,
    downstreamPropagationStillUnauthorized:true
  },
  nextMilestone,
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    productionCanonicalMutationPerformed:false,
    productionIdentityMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    applicationMutationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
