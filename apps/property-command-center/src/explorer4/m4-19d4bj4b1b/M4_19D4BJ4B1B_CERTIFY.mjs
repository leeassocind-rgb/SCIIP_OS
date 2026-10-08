#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj4b1a-governed-canonical-creation-event-store-adapter-design-and-preauthorization.json");
const runtimePath=path.join(app,"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bj4b1b-governed-canonical-creation-event-store-adapter-implementation-and-isolated-filesystem-certification.json");

if(!fs.existsSync(prior)) throw new Error("BJ4B1A evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
const required="M419D4BJ4B1A_GOVERNED_CANONICAL_CREATION_EVENT_STORE_ADAPTER_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED";
if(P.state!==required) throw new Error("BJ4B1A state mismatch: "+P.state);
if(!fs.existsSync(runtimePath)) throw new Error("implemented runtime missing: "+runtimePath);

console.log("[BJ4B1B] BJ4B1A design preauthorization accepted");
console.log("[BJ4B1B] certifying adapter in isolated filesystem only");

const mod=await import(pathToFileURL(runtimePath).href+"?v="+Date.now());
if(typeof mod.buildGovernedCanonicalCreationEventStoreAdapter!=="function"){
  throw new Error("expected adapter factory export missing");
}

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-bj4b1b-"));
const eventLog=path.join(tmp,"canonical-identity-creation-events.jsonl");

const event={
  eventType:"CANONICAL_IDENTITY_CREATED",
  canonicalPropertyId:"CPROP-B1B1B1B1B1B1B1B1B1B1",
  sourcePropertyId:"BJ4B1B-FIXTURE-001",
  normalizedAddress:"100 Isolated Certification Way",
  idempotencyKey:"BJ4B1B:FIXTURE:001",
  observationTimestamp:"2026-08-19T00:00:00.000Z",
  authorityReference:"BJ4B1B_ISOLATED_CERTIFICATION_ONLY",
  sourceProvenance:{provider:"ISOLATED_FIXTURE"},
  identityEvidence:{kind:"NON_PRODUCTION_ADAPTER_CERTIFICATION"}
};

const unauthorizedAdapter=mod.buildGovernedCanonicalCreationEventStoreAdapter({
  eventLogPath:eventLog, authorized:false
});
const unauthorized=unauthorizedAdapter.appendCreationEvent(event);

const adapter=mod.buildGovernedCanonicalCreationEventStoreAdapter({
  eventLogPath:eventLog, authorized:true
});

const committed=adapter.appendCreationEvent(event);
const readAfterAppend=adapter.readAfterAppend({
  idempotencyKey:event.idempotencyKey,
  canonicalPropertyId:event.canonicalPropertyId
});
const replay=adapter.appendCreationEvent(event);

const event2={...event,idempotencyKey:"BJ4B1B:FIXTURE:002"};
const duplicateCanonical=adapter.appendCreationEvent(event2);

const all=adapter.readAll();
const runtimeSha=crypto.createHash("sha256").update(fs.readFileSync(runtimePath)).digest("hex");

const checks={
  requiredFactoryPresent:typeof mod.buildGovernedCanonicalCreationEventStoreAdapter==="function",
  unauthorizedAppendBlocked:unauthorized.appended===false && unauthorized.state==="UNAUTHORIZED",
  firstAppendCommitted:committed.appended===true && committed.state==="CANONICAL_CREATION_EVENT_APPENDED",
  readAfterAppendVerified:readAfterAppend.verified===true,
  replayBlocked:replay.appended===false && replay.state==="DUPLICATE_IDEMPOTENCY_KEY",
  duplicateCanonicalBlocked:duplicateCanonical.appended===false && duplicateCanonical.state==="DUPLICATE_CANONICAL_CREATION_EVENT",
  exactlyOneEventPersisted:all.length===1,
  eventTypeCorrect:all[0]?.eventType==="CANONICAL_IDENTITY_CREATED",
  idempotencyPreserved:all[0]?.idempotencyKey===event.idempotencyKey,
  productionEventStoreNotCreated:!fs.existsSync(path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl"))
};

const passed=Object.values(checks).every(Boolean);
fs.rmSync(tmp,{recursive:true,force:true});

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B1B_GOVERNED_CANONICAL_CREATION_EVENT_STORE_ADAPTER_IMPLEMENTATION_AND_ISOLATED_FILESYSTEM_CERTIFICATION",
  version:"4.0-m4.19d4bj4b1b",
  status:passed?"PASSED":"BLOCKED",
  state:passed
    ?"M419D4BJ4B1B_CANONICAL_CREATION_EVENT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_PRODUCTION_BINDING_PREAUTHORIZATION_READY"
    :"M419D4BJ4B1B_ISOLATED_FILESYSTEM_CERTIFICATION_FAILED",
  certifiedAt:new Date().toISOString(),
  implementation:{
    module:"src/runtime/GovernedCanonicalCreationEventStoreAdapterRuntime.js",
    factory:"buildGovernedCanonicalCreationEventStoreAdapter",
    methods:["lookupByIdempotencyKey","lookupByCanonicalPropertyId","appendCreationEvent","readAfterAppend","readAll"],
    sourceSha256:runtimeSha,
    productionExecutionAuthorized:false
  },
  isolatedFilesystemCertification:{
    fixtureDirectoryRemovedAfterCertification:true,
    unauthorized,
    committed,
    readAfterAppend,
    replay,
    duplicateCanonical,
    eventRowCount:all.length,
    checks
  },
  designBinding:{
    designHash:P.designHash,
    proposedProductionPath:P.design?.physicalStoreDesign?.defaultProductionPath,
    cohort:P.cohort
  },
  policy:{
    implementationCompleted:true,
    isolatedCertificationOnly:true,
    productionEventStoreNotCreated:true,
    canonicalStoreUntouched:true,
    BJ4RetryProhibited:true,
    separateProductionBindingPreauthorizationRequired:true
  },
  nextMilestone:passed
    ?"M4.19D4BJ4B1C_PRODUCTION_CANONICAL_CREATION_EVENT_STORE_PATH_BINDING_AND_REEXECUTION_REPREAUTHORIZATION"
    :"M4.19D4BJ4B1B_R1_IMPLEMENTATION_RECONCILIATION",
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    productionCanonicalMutationPerformed:false,
    productionIdentityMutationPerformed:false,
    productionEventMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    downstreamPropagationPerformed:false,
    applicationSourceImplementationPerformed:true,
    isolatedFixtureMutationPerformed:true,
    automaticRetry:false
  }
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed) process.exit(2);
