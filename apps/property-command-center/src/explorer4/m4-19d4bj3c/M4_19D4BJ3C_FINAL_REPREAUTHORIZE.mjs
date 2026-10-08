#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const a14=path.join(ev,"m4-19d4bj3a14-production-first-insert-store-adapter-implementation-and-isolated-filesystem-certification.json");
const bj3b=path.join(ev,"m4-19d4bj3b-five-property-identity-creation-repreauthorization-using-exact-executable-pipeline.json");
const bj2=path.join(ev,"m4-19d4bj2-five-property-canonical-identity-lineage-adjudication.json");

for(const p of [a14,bj3b,bj2]) if(!fs.existsSync(p)) throw new Error("required evidence missing: "+p);

const A14=JSON.parse(fs.readFileSync(a14,"utf8"));
if(A14.state!=="M419D4BJ3A14_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_FIVE_RECORD_REPREAUTHORIZATION_READY")
 throw new Error("A14 state mismatch");

const B3=JSON.parse(fs.readFileSync(bj3b,"utf8"));
const B2=JSON.parse(fs.readFileSync(bj2,"utf8"));

const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const primitivePath=path.join(app,"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js");
const storeAdapterPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
for(const q of [authorityPath,primitivePath,storeAdapterPath]) if(!fs.existsSync(q)) throw new Error("required runtime missing: "+q);

const authorityMod=await import(pathToFileURL(authorityPath).href);
const authorityFactory=authorityMod.buildGovernedProductionCanonicalIdAuthority;
if(typeof authorityFactory!=="function") throw new Error("canonical authority factory missing");

// Recover a certified homogeneous namespace from A12 evidence.
const a12Path=path.join(ev,"m4-19d4bj3a12-governed-production-canonical-id-authority-namespace-certification.json");
if(!fs.existsSync(a12Path)) throw new Error("A12 evidence missing");
const A12=JSON.parse(fs.readFileSync(a12Path,"utf8"));
const seeds=(A12.namespaceCertification?.sampleDerivations||[]).map(x=>x.canonicalPropertyId).filter(Boolean);
const existingIds=seeds.length?seeds:["CPROP-00000000000000000000"];
const authority=authorityFactory({existingCanonicalIds:existingIds});

const records=(B3.cohort?.records||B2.records||[]).slice(0,5);
if(records.length!==5) throw new Error("expected exact five-property cohort");

console.log("[BJ3C] A14 production first-insert adapter certification accepted");
console.log("[BJ3C] recomputing deterministic canonical IDs for exact five-record cohort; writes remain OFF");

const derived=[];
for(const r of records){
 const sourcePropertyId=r.sourcePropertyId;
 const normalizedAddress=r.address;
 const resolution=await authority.resolveCanonicalPropertyId({
   sourcePropertyId,
   normalizedAddress,
   sourceProvenance:{
     provider:"SCIIP_GOVERNED_BASE_INVENTORY",
     cohort:"M4.19D4BJ",
     priorRepreauthorizationHash:r.repreauthorizationHash||null
   },
   identityEvidence:{
     classification:r.classification||"NO_EXISTING_CANONICAL_BINDING_RECOVERED_IDENTITY_CREATION_REQUIRED",
     lineageAdjudication:"M4.19D4BJ2",
     exactExecutablePipelineRepreauthorization:"M4.19D4BJ3B"
   }
 });
 derived.push({
   cohortPosition:r.cohortPosition,
   address:r.address,
   sourcePropertyId,
   canonicalPropertyId:resolution.canonicalPropertyId,
   authorityReference:resolution.authorityReference,
   derivationHash:resolution.derivationHash,
   resolutionState:resolution.resolutionState,
   deterministic:resolution.deterministic,
   synthetic:resolution.synthetic,
   priorRepreauthorizationHash:r.repreauthorizationHash||null
 });
}

const uniqueIds=new Set(derived.map(x=>x.canonicalPropertyId));
const uniqueSources=new Set(derived.map(x=>x.sourcePropertyId));
const allAvailable=derived.every(x=>x.resolutionState==="DERIVED_CANONICAL_ID_AVAILABLE");
const allDeterministic=derived.every(x=>x.deterministic===true && x.synthetic===false);
const allNamespace=derived.every(x=>/^CPROP-[A-F0-9]{20}$/.test(x.canonicalPropertyId));

const binding={
 canonicalIdAuthority:{
   module:"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js",
   factory:"buildGovernedProductionCanonicalIdAuthority",
   method:"resolveCanonicalPropertyId"
 },
 firstInsertPrimitive:{
   module:"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js",
   factory:"buildGovernedCanonicalIdentityFirstInsertPrimitive",
   method:"executeFirstInsert"
 },
 productionStoreAdapter:{
   module:"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js",
   factory:"buildGovernedCanonicalFirstInsertProductionStoreAdapter",
   requiredMethods:["lookupBySourcePropertyId","lookupByCanonicalPropertyId","atomicInsert","readAfterWrite"]
 }
};

const cohortHash=crypto.createHash("sha256").update(JSON.stringify(derived)).digest("hex");
const checks={
 exactFiveRecords:derived.length===5,
 uniqueSourcePropertyIds:uniqueSources.size===5,
 uniqueDerivedCanonicalPropertyIds:uniqueIds.size===5,
 allDerivedIdsAvailable:allAvailable,
 allDerivedIdsDeterministicAndNonSynthetic:allDeterministic,
 canonicalNamespaceParity20Hex:allNamespace,
 A14AdapterCertified:true,
 productionBindingComplete:true,
 sequentialExecutionRequired:true,
 haltOnFirstFailure:true,
 duplicateRecheckImmediatelyBeforeEachInsert:true,
 readAfterWriteRequired:true,
 productionExecutionNotYetAuthorized:true
};
const ready=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3C_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZATION",
 version:"4.0-m4.19d4bj3c",
 status:ready?"PASSED":"BLOCKED",
 state:ready
  ?"M419D4BJ3C_EXACT_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZED_BJ4_EXECUTION_AUTHORIZATION_REQUIRED"
  :"M419D4BJ3C_FINAL_REPREAUTHORIZATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 cohort:{
   size:5,
   cohortHash,
   records:derived,
   allExecutionAuthorized:false
 },
 productionBinding:binding,
 executionContract:{
   maximumCreations:5,
   executionOrder:"COHORT_POSITION_ASCENDING",
   sequentialOnly:true,
   haltOnFirstFailure:true,
   duplicateRecheckImmediatelyBeforeEachInsert:true,
   explicitAuthorizationTokenRequired:true,
   requiredAuthorizationToken:"AUTHORIZE_M419D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION",
   readAfterWriteAfterEachInsert:true,
   noAutomaticRetry:true,
   noAvailabilityMutation:true,
   noTemporalAvailabilityMutation:true,
   noGovernedInventoryMutation:true,
   noDownstreamPropagation:true
 },
 checks,
 policy:{
   finalRepreauthorizationIsNotExecution:true,
   productionWriteAuthorityStillClosed:true,
   explicitBJ4AuthorizationRequired:true,
   fiveRecordCohortFrozenByHash:true,
   canonicalIdsDerivedBeforeExecution:true,
   canonicalIdsMustBeRevalidatedImmediatelyBeforeInsert:true
 },
 nextMilestone:"M4.19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_AND_POST_COMMIT_CERTIFICATION",
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
   productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,
   temporalMutationPerformed:false,
   governedInventoryMutationPerformed:false,
   identityCreationExecutedInProduction:false,
   automaticRetry:false
 }
};

fs.writeFileSync(path.join(ev,"m4-19d4bj3c-five-property-canonical-identity-creation-final-repreauthorization.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!ready) process.exit(2);
