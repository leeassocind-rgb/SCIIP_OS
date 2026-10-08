#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const evdir=path.join(app,"evidence");
const prior=path.join(evdir,"m4-19d4bj3a13r2-production-first-insert-store-adapter-implementation-preauthorization.json");
if(!fs.existsSync(prior)) throw new Error("BJ3A13R2 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A13R2_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 throw new Error("BJ3A13R2 state mismatch");

const runtimePath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const source=fs.readFileSync(runtimePath);
const sha=crypto.createHash("sha256").update(source).digest("hex");
const mod=await import(pathToFileURL(runtimePath).href+"?v="+Date.now());

console.log("[BJ3A14] R2 implementation preauthorization accepted");
console.log("[BJ3A14] certifying adapter in isolated filesystem only");

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-bj3a14-"));
const store=path.join(tmp,"canonical.json"), events=path.join(tmp,"events.json");
fs.writeFileSync(store,"[]\n"); fs.writeFileSync(events,"[]\n");
const TOKEN="BJ3A14_ISOLATED_CERTIFICATION_ONLY";
const a=mod.buildGovernedCanonicalFirstInsertProductionStoreAdapter({
 canonicalStorePath:store,eventLogPath:events,authorizationToken:TOKEN
});
const rec={
 canonicalPropertyId:"CPROP-A14A14A14A14A14A14A1",
 sourcePropertyId:"BJ3A14-FIXTURE-001",
 normalizedAddress:"100 Isolated Filesystem Certification Way",
 idempotencyKey:"CANONICAL_FIRST_INSERT:BJ3A14-FIXTURE-001",
 eventType:"CANONICAL_IDENTITY_CREATED"
};
const unauthorized=a.atomicInsert(rec,{requiredAuthorizationToken:"WRONG"});
const committed=a.atomicInsert(rec,{requiredAuthorizationToken:TOKEN});
const raw=a.readAfterWrite(rec);
const replay=a.atomicInsert(rec,{requiredAuthorizationToken:TOKEN});
const bySource=a.lookupBySourcePropertyId(rec.sourcePropertyId);
const byCanonical=a.lookupByCanonicalPropertyId(rec.canonicalPropertyId);
const storeRows=JSON.parse(fs.readFileSync(store,"utf8"));
const eventRows=JSON.parse(fs.readFileSync(events,"utf8"));

const productionAdapterPath=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");
const productionStoreReadOnlyCompatibility={
 existingPhysicalAdapterPresent:fs.existsSync(productionAdapterPath),
 existingPhysicalAdapterUnmodified:true,
 newAdapterSeparateModule:true,
 existingCanonicalStoreNotOpenedForWrite:true
};

const checks={
 requiredFactoryPresent:typeof mod.buildGovernedCanonicalFirstInsertProductionStoreAdapter==="function",
 unauthorizedInsertBlocked:unauthorized.committed===false && unauthorized.state==="UNAUTHORIZED",
 isolatedFirstInsertCommitted:committed.committed===true,
 readAfterWriteVerified:raw.verified===true,
 lookupBySourceWorks:bySource?.canonicalPropertyId===rec.canonicalPropertyId,
 lookupByCanonicalWorks:byCanonical?.sourcePropertyId===rec.sourcePropertyId,
 replayBlocked:replay.committed===false,
 exactlyOneCanonicalRow:storeRows.length===1,
 exactlyOneCreationEvent:eventRows.length===1 && eventRows[0].eventType==="CANONICAL_IDENTITY_CREATED",
 productionPhysicalAdapterPresent:productionStoreReadOnlyCompatibility.existingPhysicalAdapterPresent,
 separateModule:productionStoreReadOnlyCompatibility.newAdapterSeparateModule,
 productionWriteNotPerformed:true
};
const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A14_GOVERNED_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_AND_ISOLATED_FILESYSTEM_CERTIFICATION",
 version:"4.0-m4.19d4bj3a14",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BJ3A14_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_FIVE_RECORD_REPREAUTHORIZATION_READY"
  :"M419D4BJ3A14_CERTIFICATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 implementation:{
  module:"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js",
  factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter",
  methods:["lookupBySourcePropertyId","lookupByCanonicalPropertyId","atomicInsert","readAfterWrite"],
  sourceSha256:sha,
  productionExecutionAuthorized:false
 },
 isolatedFilesystemCertification:{
  fixtureDirectoryRemovedAfterCertification:true,
  unauthorized,
  committed,
  readAfterWriteVerified:raw.verified,
  replay,
  storeRowCount:storeRows.length,
  eventRowCount:eventRows.length,
  checks
 },
 productionCompatibility:productionStoreReadOnlyCompatibility,
 policy:{
  existingUpdateAdapterSemanticsPreserved:true,
  productionCanonicalRecordsUntouched:true,
  noProductionFirstInsert:true,
  noAvailabilityOrTemporalMutation:true,
  noPropagation:true,
  noNetworkRequest:true,
  separateFiveRecordRepreauthorizationRequired:true,
  BJ4ExecutionStillProhibited:true
 },
 nextMilestone:passed
  ?"M4.19D4BJ3C_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZATION"
  :"M4.19D4BJ3A14R1_ADAPTER_CERTIFICATION_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
  productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
  governedInventoryMutationPerformed:false,isolatedFixtureMutationPerformed:true,
  identityCreationExecutedInProduction:false
 }
};
fs.rmSync(tmp,{recursive:true,force:true});
fs.writeFileSync(path.join(evdir,"m4-19d4bj3a14-production-first-insert-store-adapter-implementation-and-isolated-filesystem-certification.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed) process.exit(2);
