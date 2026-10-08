#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bm2aPath=path.join(ev,"m4-19d4bm2a-dual-store-production-adapter-contract-binding-and-execution-readiness.json");
const r3Path=path.join(ev,"m4-19d4bm1-r3-ten-property-canonical-id-derivation-and-execution-manifest-finalization.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const firstInsertPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
const out=path.join(ev,"m4-19d4bm2b-production-canonical-store-shape-compatibility-and-first-insert-binding-adjudication.json");

for(const p of [bm2aPath,r3Path,canonicalPath,eventPath,firstInsertPath])
 if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const A=JSON.parse(fs.readFileSync(bm2aPath,"utf8"));
const R3=JSON.parse(fs.readFileSync(r3Path,"utf8"));

if(A.state!=="M419D4BM2A_DUAL_STORE_ADAPTER_CONTRACTS_BOUND_FROZEN_MANIFEST_STABLE_BM2_COMMIT_IMPLEMENTATION_READY")
 throw new Error("BM2A state mismatch");
if(R3.state!=="M419D4BM1_R3_TEN_CANONICAL_IDS_DERIVED_DETERMINISTIC_COLLISION_FREE_EXECUTION_MANIFEST_FINALIZED_BM2_EXECUTION_AUTHORIZATION_REQUIRED")
 throw new Error("R3 state mismatch");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const canonicalSha=sha(canonicalPath), eventSha=sha(eventPath), adapterSha=sha(firstInsertPath);

if(canonicalSha!==R3.executionManifest.manifest.canonicalStore.sha256) throw new Error("canonical store drift since R3");
if(eventSha!==R3.executionManifest.manifest.eventStore.sha256) throw new Error("event store drift since R3");
if(adapterSha!==R3.executionManifest.manifest.firstInsertAdapter.sha256) throw new Error("first-insert adapter drift since R3");

const canonicalRoot=JSON.parse(fs.readFileSync(canonicalPath,"utf8"));
const canonicalTopLevelType=Array.isArray(canonicalRoot)?"ARRAY":(canonicalRoot&&typeof canonicalRoot==="object"?"OBJECT":typeof canonicalRoot);

const topLevelKeys=canonicalTopLevelType==="OBJECT"?Object.keys(canonicalRoot).sort():[];
const topLevelArrays=[];
if(canonicalTopLevelType==="OBJECT"){
 for(const [k,v] of Object.entries(canonicalRoot)){
  if(Array.isArray(v)){
   const canonicalCount=v.reduce((n,x)=>n+(x&&typeof x==="object"&&x.canonicalPropertyId?1:0),0);
   const sourceCount=v.reduce((n,x)=>n+(x&&typeof x==="object"&&x.sourcePropertyId?1:0),0);
   topLevelArrays.push({key:k,length:v.length,canonicalCount,sourceCount});
  }
 }
}

const src=fs.readFileSync(firstInsertPath,"utf8");
const adapterRequiresTopLevelArray=/if\s*\(\s*!Array\.isArray\(x\)\s*\)\s*throw new Error\(["']canonical store must be an array["']\)/.test(src);
const adapterReadStoreArrayGuard=/Array\.isArray\(x\)/.test(src);
const adapterHasContainerPathConfig=/containerPath|recordContainer|canonicalContainer|eventsPath|identitiesPath/.test(src);
const adapterUsesJsonParse=/JSON\.parse/.test(src);
const adapterHasAtomicInsert=/atomicInsert/.test(src);
const adapterHasReadAfterWrite=/readAfterWrite/.test(src);

const directCompatible=
 canonicalTopLevelType==="ARRAY" &&
 adapterRequiresTopLevelArray &&
 adapterHasAtomicInsert &&
 adapterHasReadAfterWrite;

const shapeGapCertified=
 canonicalTopLevelType==="OBJECT" &&
 adapterRequiresTopLevelArray &&
 !adapterHasContainerPathConfig;

const checks={
 bm2aPassed:A.status==="PASSED",
 r3Passed:R3.status==="PASSED",
 canonicalHashStable:true,
 eventHashStable:true,
 adapterHashStable:true,
 canonicalTopLevelShapeResolved:true,
 adapterArrayRequirementDetected:adapterRequiresTopLevelArray,
 adapterAtomicInsertDetected:adapterHasAtomicInsert,
 adapterReadAfterWriteDetected:adapterHasReadAfterWrite,
 directCompatibilityCertified:directCompatible,
 shapeCapabilityGapCertified:shapeGapCertified
};

const status=shapeGapCertified||directCompatible?"PASSED":"BLOCKED";
const state=shapeGapCertified
 ?"M419D4BM2B_PRODUCTION_CANONICAL_STORE_OBJECT_SHAPE_INCOMPATIBLE_WITH_ARRAY_ONLY_FIRST_INSERT_ADAPTER_BRIDGE_IMPLEMENTATION_PREAUTHORIZATION_READY"
 : directCompatible
 ?"M419D4BM2B_PRODUCTION_CANONICAL_STORE_DIRECT_FIRST_INSERT_BINDING_CERTIFIED_BM2_EXECUTION_READY"
 :"M419D4BM2B_CANONICAL_STORE_SHAPE_COMPATIBILITY_UNRESOLVED";

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM2B_PRODUCTION_CANONICAL_STORE_SHAPE_COMPATIBILITY_AND_FIRST_INSERT_BINDING_ADJUDICATION",
 version:"4.0-m4.19d4bm2b",
 status,
 state,
 certifiedAt:new Date().toISOString(),
 adjudication:{
  canonicalStore:{
   path:canonicalPath,
   sha256:canonicalSha,
   topLevelType:canonicalTopLevelType,
   topLevelKeys,
   topLevelArrays
  },
  firstInsertAdapter:{
   path:firstInsertPath,
   sha256:adapterSha,
   requiresTopLevelArray:adapterRequiresTopLevelArray,
   hasArrayGuard:adapterReadStoreArrayGuard,
   hasContainerPathConfiguration:adapterHasContainerPathConfig,
   hasAtomicInsert:adapterHasAtomicInsert,
   hasReadAfterWrite:adapterHasReadAfterWrite
  },
  directProductionBindingCompatible:directCompatible,
  productionShapeCapabilityGapCertified:shapeGapCertified,
  conclusion:shapeGapCertified
   ?"Existing first-insert adapter is valid for array-backed stores but cannot be directly bound to the authoritative structured production canonical dataset without a shape-aware adapter/bridge."
   : directCompatible
   ?"Existing first-insert adapter directly satisfies the live production canonical store shape."
   :"Compatibility could not be uniquely adjudicated."
 },
 checks,
 policy:{
  adjudicationReadOnly:true,
  bm2ExecutionAuthorized:false,
  noAdapterInvocation:true,
  noProductionCanonicalWrite:true,
  noProductionEventWrite:true,
  noRuntimePropagation:true,
  noInventoryMutation:true,
  noTemporalMutation:true,
  noNetworkRequest:true
 },
 nextMilestone:shapeGapCertified
  ?"M4.19D4BM2C_PRODUCTION_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE_DESIGN_AND_PREAUTHORIZATION"
  : directCompatible
  ?"M4.19D4BM2_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_DUAL_STORE_COMMIT_EXECUTION"
  :"M4.19D4BM2B_R1_CANONICAL_STORE_SHAPE_FORENSICS",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
  syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,
  productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,
  downstreamPropagationPerformed:false,applicationMutationPerformed:false,uiMutationPerformed:false,automaticRetry:false
 }
};
fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(status!=="PASSED") process.exit(2);
