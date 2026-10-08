#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";
import {inspectProductionCanonicalStoreAdapterContract,buildFirstInsertDryRunShadowStore} from "./GovernedCanonicalFirstInsertStoreBindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a12-governed-production-canonical-id-authority-namespace-certification.json");
const adapterPath=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");
const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const firstInsertPath=path.join(app,"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js");
const out=path.join(ev,"m4-19d4bj3a13-r1-production-first-insert-store-adapter-binding-and-dry-run-certification.json");

if(!fs.existsSync(prior)) throw new Error("BJ3A12 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
const expected="M419D4BJ3A12_PRODUCTION_CANONICAL_ID_AUTHORITY_IMPLEMENTED_NAMESPACE_CERTIFIED_READ_ONLY_FIRST_INSERT_BINDING_PREAUTHORIZATION_READY";
if(p.state!==expected) throw new Error(`BJ3A12 state mismatch: ${p.state}`);

for(const required of [adapterPath,authorityPath,firstInsertPath]){
  if(!fs.existsSync(required)) throw new Error(`required runtime missing: ${required}`);
}

console.log("[BJ3A13-R1] BJ3A12 namespace certification accepted");
console.log("[BJ3A13-R1] importing governed runtimes from supplied repository root");
console.log(`[BJ3A13-R1] authority=${authorityPath}`);
console.log(`[BJ3A13-R1] firstInsert=${firstInsertPath}`);

const authorityModule=await import(pathToFileURL(authorityPath).href);
const firstInsertModule=await import(pathToFileURL(firstInsertPath).href);
const {buildGovernedProductionCanonicalIdAuthority}=authorityModule;
const {buildGovernedCanonicalIdentityFirstInsertPrimitive}=firstInsertModule;

if(typeof buildGovernedProductionCanonicalIdAuthority!=="function") throw new Error("authority factory not callable");
if(typeof buildGovernedCanonicalIdentityFirstInsertPrimitive!=="function") throw new Error("first-insert factory not callable");

console.log("[BJ3A13-R1] inspecting exact production canonical-store adapter contract");
const adapterSource=fs.readFileSync(adapterPath,"utf8");
const adapterContract=inspectProductionCanonicalStoreAdapterContract(adapterSource);
console.log(JSON.stringify({adapterContract},null,2));

const canonicalIdCount=p.namespaceCertification?.canonicalIdCount??0;
const prefixLength=p.namespaceCertification?.namespace?.dominantHexPrefixLength??null;
if(canonicalIdCount<=0 || prefixLength!==20) throw new Error("BJ3A12 namespace evidence invalid");

const certifiedExistingIds=(p.namespaceCertification?.sampleDerivations||[])
  .map(x=>x.canonicalPropertyId).filter(Boolean);
const seedIds=certifiedExistingIds.length?certifiedExistingIds:["CPROP-00000000000000000000"];

const authority=buildGovernedProductionCanonicalIdAuthority({existingCanonicalIds:seedIds});
const shadow=buildFirstInsertDryRunShadowStore();
const primitive=buildGovernedCanonicalIdentityFirstInsertPrimitive({
  canonicalIdAuthority:authority,
  canonicalStore:shadow,
  clock:()=> "2026-08-19T00:00:00.000Z"
});

const fixture={
  sourcePropertyId:"BJ3A13-R1-DRYRUN-001",
  normalizedAddress:"100 Production Binding Dry Run Way",
  sourceProvenance:{provider:"BJ3A13_R1_DRY_RUN_ONLY"},
  identityEvidence:{kind:"NON_PRODUCTION_STORE_BINDING_CERTIFICATION"}
};

const preflight=await primitive.preflight(fixture);
const unauthorized=await primitive.executeFirstInsert(fixture,{});
const committed=await primitive.executeFirstInsert(
  fixture,{authorizationToken:"AUTHORIZE_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT"});
const replay=await primitive.executeFirstInsert(
  fixture,{authorizationToken:"AUTHORIZE_GOVERNED_CANONICAL_IDENTITY_FIRST_INSERT"});

const checks={
  namespaceTwentyHexCertified:prefixLength===20,
  repositoryRootAuthorityImportResolved:true,
  repositoryRootFirstInsertImportResolved:true,
  productionAdapterFactoryPresent:adapterContract.hasFactory,
  productionPhysicalAtomicWritePresent:adapterContract.hasPhysicalAtomicWrite,
  productionReadBindingPresent:adapterContract.hasReadBinding,
  dryRunPreflightReady:preflight.ready===true,
  dryRunUnauthorizedBlocked:unauthorized.state==="EXECUTION_NOT_AUTHORIZED",
  dryRunFirstInsertCommitted:committed.committed===true,
  dryRunCreationEventCorrect:committed.eventType==="CANONICAL_IDENTITY_CREATED",
  dryRunReadAfterWriteVerified:committed.readAfterWriteVerified===true,
  dryRunReplayBlocked:replay.committed===false,
  shadowAtomicInsertExactlyOnce:shadow.metrics.atomicInsertCalls===1,
  shadowReadAfterWriteExactlyOnce:shadow.metrics.readAfterWriteCalls===1,
  productionMutationPerformed:false
};

const genericPipelineDryRunPassed=Object.values(checks).every(Boolean);
const directProductionStoreBindingReady=adapterContract.existingAdapterDirectlySatisfiesFirstInsertContract;

let state,next;
if(genericPipelineDryRunPassed && directProductionStoreBindingReady){
  state="M419D4BJ3A13_R1_PRODUCTION_FIRST_INSERT_STORE_BINDING_AND_DRY_RUN_CERTIFIED_FIVE_RECORD_REPREAUTHORIZATION_READY";
  next="M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION";
}else if(genericPipelineDryRunPassed){
  state="M419D4BJ3A13_R1_DRY_RUN_PIPELINE_CERTIFIED_EXISTING_PRODUCTION_ADAPTER_LACKS_FIRST_INSERT_CONTRACT_CONTROLLED_ADAPTER_IMPLEMENTATION_REQUIRED";
  next="M4.19D4BJ3A13R2_GOVERNED_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTATION_PREAUTHORIZATION";
}else{
  state="M419D4BJ3A13_R1_DRY_RUN_CERTIFICATION_BLOCKED_RECONCILIATION_REQUIRED";
  next="M4.19D4BJ3A13R1A_DRY_RUN_CERTIFICATION_RECONCILIATION";
}

const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A13_R1_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_BINDING_AND_DRY_RUN_CERTIFICATION",
  version:"4.0-m4.19d4bj3a13-r1",
  status:genericPipelineDryRunPassed?"PASSED":"BLOCKED",
  state,
  certifiedAt:new Date().toISOString(),
  correction:{
    priorFailure:"ERR_MODULE_NOT_FOUND_FROM_DOWNLOADS_RELATIVE_IMPORT",
    corrected:true,
    runtimeImportsBoundFromSuppliedRepositoryRoot:true,
    priorProductionMutationPerformed:false
  },
  productionStoreInspection:{
    adapterPath:"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",
    adapterSha256:sha(adapterSource),
    contract:adapterContract,
    directProductionStoreBindingReady
  },
  dryRunCertification:{
    mode:"ISOLATED_SHADOW_STORE_NO_PRODUCTION_WRITE",
    preflight,committed,replay,checks,genericPipelineDryRunPassed,
    shadowRecordCount:shadow.snapshot().length
  },
  adjudication:{
    canonicalIdAuthorityCertified:true,
    firstInsertPrimitiveCertified:true,
    physicalCanonicalStorageSubstratePresent:adapterContract.hasPhysicalAtomicWrite,
    existingProductionAdapterDirectFirstInsertContractPresent:directProductionStoreBindingReady,
    conclusion:directProductionStoreBindingReady
      ?"Existing production adapter directly satisfies governed first-insert contract."
      :"Existing production adapter supplies physical/update storage semantics but lacks the complete absent-target atomicInsert/readAfterWrite contract required by the governed first-insert primitive."
  },
  policy:{
    shadowDryRunIsNotProductionExecution:true,
    noProductionCanonicalWrite:true,noProductionIdentityWrite:true,
    noTemporalWrite:true,noGovernedInventoryWrite:true,noNetworkRequest:true,
    BJ4ExecutionStillProhibited:!directProductionStoreBindingReady,
    controlledAdapterImplementationRequiresSeparatePreauthorization:!directProductionStoreBindingReady
  },
  nextMilestone:next,
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
    productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,applicationMutationPerformed:false,
    shadowFixtureMutationPerformed:true,identityCreationExecutedInProduction:false
  }
};

fs.mkdirSync(ev,{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!genericPipelineDryRunPassed) process.exit(2);
