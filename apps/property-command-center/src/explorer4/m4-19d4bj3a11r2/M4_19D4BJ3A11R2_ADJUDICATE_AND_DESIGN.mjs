#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||"."); const app=path.join(repo,"apps/property-command-center"); const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a11r1-targeted-production-binding-reconciliation.json");
if(!fs.existsSync(prior)) throw new Error("BJ3A11R1 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A11R1_STORAGE_SUBSTRATE_RECONCILED_CANONICAL_ID_AUTHORITY_CAPABILITY_GAP_REQUIRES_CONTROLLED_AUTHORITY_DESIGN") throw new Error("BJ3A11R1 state mismatch");
console.log("[BJ3A11R2] certified authority gap accepted");
console.log("[BJ3A11R2] designing authority contract only; implementation/execution remain OFF");

const stable=x=>JSON.stringify(x,Object.keys(x).sort());
const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
const design={
 capability:"GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY",
 purpose:"Resolve a canonicalPropertyId for a source property before governed canonical first insert.",
 separationOfDuties:{
  canonicalIdAuthority:"ID derivation/resolution only",
  firstInsertPrimitive:"duplicate recheck, source/address binding, atomic insert, read-after-write",
  canonicalStore:"physical canonical persistence only",
  propagation:"separate future authority"
 },
 inputContract:["sourcePropertyId","normalizedAddress","sourceProvenance","identityEvidence"],
 outputContract:["canonicalPropertyId","authorityVersion","derivationVersion","derivationHash","resolutionState"],
 requirements:{
  deterministic:true,
  namespaceControlled:true,
  sourcePropertyIdBound:true,
  normalizedAddressBound:true,
  provenanceBound:true,
  identityEvidenceBound:true,
  collisionCheckRequired:true,
  duplicateRecheckRequiredByFirstInsert:true,
  idempotent:true,
  noRandomUuid:true,
  noTimestampDerivedId:true,
  noDirectSyntheticCPROP:true,
  noPersistenceInsideAuthority:true,
  noAvailabilityMutation:true,
  noTemporalMutation:true,
  noPropagation:true,
  readOnlyCertificationBeforeProductionUse:true,
  explicitFutureExecutionAuthorization:true
 },
 proposedCallable:{
  module:"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js",
  factory:"buildGovernedProductionCanonicalIdAuthority",
  method:"resolveCanonicalPropertyId"
 },
 canonicalIdDerivation:{
  scheme:"CPROP-<UPPERCASE_HEX_PREFIX>",
  material:["authorityVersion","sourcePropertyId","normalizedAddress","sourceProvenance","identityEvidence"],
  digest:"SHA-256",
  prefixLength:"TO_BE_CERTIFIED_AGAINST_EXISTING_CANONICAL_NAMESPACE_BEFORE_IMPLEMENTATION",
  note:"R2 does not choose a prefix length or create an ID; namespace compatibility must be proven in the implementation/certification milestone."
 }
};
const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A11R2_GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY_CAPABILITY_GAP_ADJUDICATION_AND_DESIGN",
 version:"4.0-m4.19d4bj3a11-r2",status:"PASSED",
 state:"M419D4BJ3A11R2_CANONICAL_ID_AUTHORITY_GAP_ADJUDICATED_CONTROLLED_AUTHORITY_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED",
 certifiedAt:new Date().toISOString(),
 adjudication:{existingProductionCanonicalIdAuthorityProven:false,storageSubstrateProven:true,firstInsertPrimitivePresent:true,capabilityGapCertified:true,
 reason:"BJ3A11R1 proved physical storage and first-insert semantics but no callable production authority that derives/resolves a new canonicalPropertyId."},
 design,designHash:sha(design),
 policy:{designOnly:true,implementationAuthorizedNextMilestone:true,productionExecutionAuthorized:false,BJ4ExecutionStillProhibited:true,noSyntheticIdentity:true,
 namespaceCompatibilityMustBeCertifiedBeforeUse:true,existingCanonicalIdsMustNeverBeRewritten:true},
 nextMilestone:"M4.19D4BJ3A12_GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY_IMPLEMENTATION_AND_READ_ONLY_NAMESPACE_CERTIFICATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false}
};
fs.writeFileSync(path.join(ev,"m4-19d4bj3a11r2-canonical-id-authority-gap-design.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
