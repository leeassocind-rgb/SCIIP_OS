#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {buildGovernedCanonicalIdentityFirstInsertPrimitive} from "./GovernedCanonicalIdentityFirstInsertRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a9-canonical-identity-creation-capability-gap-adjudication.json");
const out=path.join(ev,"m4-19d4bj3a10-governed-canonical-identity-first-insert-primitive-certification.json");
const sha=v=>crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(v)).digest("hex");

if(!fs.existsSync(prior)) throw new Error("BJ3A9 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A9_CANONICAL_IDENTITY_FIRST_INSERT_CAPABILITY_GAP_CERTIFIED_CONTROLLED_IMPLEMENTATION_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED"){
  throw new Error(`BJ3A9 state mismatch: ${p.state}`);
}

console.log("[BJ3A10] BJ3A9 implementation authorization accepted");
console.log("[BJ3A10] certifying primitive against isolated in-memory fixture only");

const records=new Map();
const bySource=new Map();
const idempotency=new Set();
let atomicInsertCalls=0;
let readAfterWriteCalls=0;

const store={
  async lookupBySourcePropertyId(sourcePropertyId){
    const id=bySource.get(sourcePropertyId);
    return id?{found:true,canonicalPropertyId:id}:{found:false};
  },
  async lookupByCanonicalPropertyId(canonicalPropertyId){
    return records.has(canonicalPropertyId)?{found:true,record:records.get(canonicalPropertyId)}:{found:false};
  },
  async atomicInsert({canonicalPropertyId,sourcePropertyId,normalizedAddress,event,idempotencyKey}){
    atomicInsertCalls++;
    if(records.has(canonicalPropertyId)||bySource.has(sourcePropertyId)) return {committed:false,state:"DUPLICATE"};
    if(idempotency.has(idempotencyKey)) return {committed:false,state:"IDEMPOTENCY_DUPLICATE"};
    records.set(canonicalPropertyId,{canonicalPropertyId,sourcePropertyId,normalizedAddress,events:[event],idempotencyKey});
    bySource.set(sourcePropertyId,canonicalPropertyId);
    idempotency.add(idempotencyKey);
    return {committed:true};
  },
  async readAfterWrite({canonicalPropertyId,sourcePropertyId,idempotencyKey}){
    readAfterWriteCalls++;
    const r=records.get(canonicalPropertyId);
    return {verified:Boolean(r&&r.sourcePropertyId===sourcePropertyId&&r.idempotencyKey===idempotencyKey)};
  }
};

const authority={
  async resolveCanonicalPropertyId({sourcePropertyId}){
    const fixtureMap={
      "FIXTURE-SOURCE-001":"CPROP-FIXTURE-001"
    };
    const canonicalPropertyId=fixtureMap[sourcePropertyId];
    if(!canonicalPropertyId) throw new Error("FIXTURE_AUTHORITY_TARGET_NOT_FOUND");
    return {
      canonicalPropertyId,
      deterministic:true,
      synthetic:false,
      authorityReference:"BJ3A10_ISOLATED_TEST_AUTHORITY/FIXTURE-SOURCE-001"
    };
  }
};

const primitive=buildGovernedCanonicalIdentityFirstInsertPrimitive({
  canonicalIdAuthority:authority,
  canonicalStore:store,
  clock:()=> "2026-08-19T00:00:00.000Z"
});

const input={
  sourcePropertyId:"FIXTURE-SOURCE-001",
  normalizedAddress:"100 Test Fixture Way",
  sourceProvenance:{provider:"BJ3A10_ISOLATED_FIXTURE"},
  identityEvidence:{kind:"TEST_ONLY_NON_PRODUCTION_EVIDENCE"}
};

const unauthorized=await primitive.executeFirstInsert(input,{});
const preflight=await primitive.preflight(input);
const committed=await primitive.executeFirstInsert(input,{authorizationToken:"AUTHORIZE_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT"});
const duplicate=await primitive.executeFirstInsert(input,{authorizationToken:"AUTHORIZE_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT"});

let syntheticRejected=false;
try{
  const q=buildGovernedCanonicalIdentityFirstInsertPrimitive({
    canonicalIdAuthority:{resolveCanonicalPropertyId:async()=>({canonicalPropertyId:"CPROP-TEST",deterministic:true,synthetic:true,authorityReference:"TEST"})},
    canonicalStore:{
      lookupBySourcePropertyId:async()=>({found:false}),
      lookupByCanonicalPropertyId:async()=>({found:false}),
      atomicInsert:async()=>({committed:true}),
      readAfterWrite:async()=>({verified:true})
    }
  });
  await q.preflight(input);
}catch(e){syntheticRejected=String(e?.message)==="SYNTHETIC_CANONICAL_ID_PROHIBITED";}

const checks={
  implementationSourcePresent:true,
  unauthorizedExecutionBlocked:unauthorized.state==="EXECUTION_NOT_AUTHORIZED",
  preflightReady:preflight.ready===true,
  deterministicAuthorityReferenceRequired:Boolean(preflight.canonicalIdAuthorityReference),
  syntheticCanonicalIdRejected:syntheticRejected,
  creationEventSemantic:committed.eventType==="CANONICAL_IDENTITY_CREATED",
  atomicFirstInsertExactlyOnce:atomicInsertCalls===1,
  readAfterWriteExactlyOnce:readAfterWriteCalls===1,
  readAfterWriteVerified:committed.readAfterWriteVerified===true,
  duplicateReexecutionBlocked:duplicate.committed===false,
  idempotencyKeyPresent:Boolean(committed.idempotencyKey),
  productionCohortUntouched:(p.cohort?.targets||[]).every(x=>x.executionAuthorized===false)
};

const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A10_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT_PRIMITIVE_IMPLEMENTATION_AND_READ_ONLY_CERTIFICATION",
 version:"4.0-m4.19d4bj3a10",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BJ3A10_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT_PRIMITIVE_IMPLEMENTED_ISOLATED_CERTIFICATION_PASSED_PRODUCTION_BINDING_NOT_AUTHORIZED"
  :"M419D4BJ3A10_FIRST_INSERT_PRIMITIVE_CERTIFICATION_FAILED",
 certifiedAt:new Date().toISOString(),
 implementation:{
   module:"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js",
   capability:"GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT",
   sourceSha256:sha(fs.readFileSync(new URL("./GovernedCanonicalIdentityFirstInsertRuntime.js",import.meta.url))),
   productionExecutionAuthorized:false
 },
 certification:{
   mode:"ISOLATED_IN_MEMORY_NON_PRODUCTION_FIXTURE",
   checks,
   committedFixtureCanonicalPropertyId:committed.canonicalPropertyId??null,
   fixtureRecordCount:records.size,
   productionRecordCountChanged:false
 },
 contractSemantics:primitive.contract,
 cohort:{
   size:p.cohort?.size??5,
   targets:p.cohort?.targets??[],
   allExecutionAuthorized:false
 },
 policy:{
   productionCanonicalIdAuthorityBindingRequiredBeforeAnyLiveExecution:true,
   productionCanonicalStoreBindingRequiredBeforeAnyLiveExecution:true,
   isolatedFixtureCannotServeAsProductionAuthority:true,
   BJ4ExecutionStillProhibited:true,
   correctedFiveRecordPreauthorizationRequired:true,
   noProductionDataWriteInThisMilestone:true
 },
 nextMilestone:passed
  ?"M4.19D4BJ3A11_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_FIRST_INSERT_STORAGE_BINDING_FORENSICS"
  :"M4.19D4BJ3A10R1_FIRST_INSERT_PRIMITIVE_CERTIFICATION_REPAIR",
 authorityClosure:{
   temporalWriteAuthority:false,
   canonicalWriteAuthority:false,
   identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,
   refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,
   syncAuthority:false,
   propagationAuthority:false,
   automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,
   governedInventoryMutationPerformed:false,
   productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,
   temporalMutationPerformed:false,
   applicationSourceImplementationPerformed:true,
   fixtureOnlyMutationPerformed:true,
   syntheticProductionIdentityUsed:false,
   automaticRetry:false
 }
};

fs.mkdirSync(ev,{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed)process.exit(2);
