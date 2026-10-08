#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {buildGovernedProductionCanonicalIdAuthority,inspectCanonicalNamespace} from "./GovernedProductionCanonicalIdAuthorityRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a11r2-canonical-id-authority-gap-design.json");
const out=path.join(ev,"m4-19d4bj3a12-governed-production-canonical-id-authority-namespace-certification.json");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");

if(!fs.existsSync(prior)) throw new Error("BJ3A11R2 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
const required="M419D4BJ3A11R2_CANONICAL_ID_AUTHORITY_GAP_ADJUDICATED_CONTROLLED_AUTHORITY_DESIGN_PREAUTHORIZED_IMPLEMENTATION_NOT_EXECUTED";
if(p.state!==required) throw new Error(`BJ3A11R2 state mismatch: ${p.state}`);

console.log("[BJ3A12] R2 design authorization accepted");
console.log("[BJ3A12] discovering existing canonical namespace read-only");

// Collect canonical IDs from bounded known runtime/evidence data without mutating anything.
const candidates=[
 path.join(app,"src/production-validation"),
 path.join(app,"src/runtime"),
 path.join(app,"public/explorer"),
 path.join(ev)
].filter(fs.existsSync);

const ids=new Set();
let filesInspected=0;
function walk(d){
 for(const ent of fs.readdirSync(d,{withFileTypes:true})){
   const q=path.join(d,ent.name);
   if(ent.isDirectory()){
     if(["node_modules",".git","dist","build","explorer4"].includes(ent.name)) continue;
     walk(q);
   } else if(/\.(json|jsonl|js|mjs)$/.test(ent.name)){
     let s=""; try{s=fs.readFileSync(q,"utf8")}catch{continue}
     filesInspected++;
     for(const m of s.matchAll(/\bCPROP-([A-F0-9]{8,64})\b/ig)) ids.add(`CPROP-${m[1].toUpperCase()}`);
   }
 }
}
for(const d of candidates) walk(d);

const canonicalIds=[...ids].sort();
const namespace=inspectCanonicalNamespace(canonicalIds);
console.log(`[BJ3A12] canonical IDs observed=${canonicalIds.length}; lengths=${namespace.observedHexPrefixLengths.join(",")||"none"}`);

let authority=null;
let sampleA=null,sampleB=null,sampleRepeat=null;
let implementationReady=false;
let blockers=[];

if(canonicalIds.length===0) blockers.push("NO_EXISTING_CANONICAL_IDS_RECOVERED");
if(!namespace.namespaceHomogeneous) blockers.push("CANONICAL_NAMESPACE_NOT_HOMOGENEOUS");

if(blockers.length===0){
  authority=buildGovernedProductionCanonicalIdAuthority({existingCanonicalIds:canonicalIds});
  sampleA=await authority.resolveCanonicalPropertyId({
    sourcePropertyId:"BJ3A12-FIXTURE-001",
    normalizedAddress:"100 Namespace Certification Way",
    sourceProvenance:{provider:"BJ3A12_READ_ONLY_FIXTURE"},
    identityEvidence:{kind:"READ_ONLY_NAMESPACE_CERTIFICATION"}
  });
  sampleRepeat=await authority.resolveCanonicalPropertyId({
    sourcePropertyId:"BJ3A12-FIXTURE-001",
    normalizedAddress:"100 Namespace Certification Way",
    sourceProvenance:{provider:"BJ3A12_READ_ONLY_FIXTURE"},
    identityEvidence:{kind:"READ_ONLY_NAMESPACE_CERTIFICATION"}
  });
  sampleB=await authority.resolveCanonicalPropertyId({
    sourcePropertyId:"BJ3A12-FIXTURE-002",
    normalizedAddress:"200 Namespace Certification Way",
    sourceProvenance:{provider:"BJ3A12_READ_ONLY_FIXTURE"},
    identityEvidence:{kind:"READ_ONLY_NAMESPACE_CERTIFICATION"}
  });
  implementationReady=true;
}

const checks={
  priorDesignHashPresent:Boolean(p.designHash),
  existingNamespaceRecovered:canonicalIds.length>0,
  namespaceHomogeneous:namespace.namespaceHomogeneous,
  dominantPrefixLengthKnown:Number.isInteger(namespace.dominantHexPrefixLength),
  deterministicRepeat:implementationReady ? sampleA.canonicalPropertyId===sampleRepeat.canonicalPropertyId && sampleA.derivationHash===sampleRepeat.derivationHash : false,
  distinctInputDistinctId:implementationReady ? sampleA.canonicalPropertyId!==sampleB.canonicalPropertyId : false,
  canonicalFormatCompatible:implementationReady ? new RegExp(`^CPROP-[A-F0-9]{${namespace.dominantHexPrefixLength}}$`).test(sampleA.canonicalPropertyId) : false,
  noExistingCollisionForFixtures:implementationReady ? !canonicalIds.includes(sampleA.canonicalPropertyId) && !canonicalIds.includes(sampleB.canonicalPropertyId) : false,
  authorityReadOnlyContract:implementationReady ? authority.contract.noPersistenceInsideAuthority===true : false,
  noProductionExecution:true
};
const passed=Object.values(checks).every(Boolean);

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A12_GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY_IMPLEMENTATION_AND_READ_ONLY_NAMESPACE_CERTIFICATION",
 version:"4.0-m4.19d4bj3a12",
 status:passed?"PASSED":"BLOCKED",
 state:passed
   ?"M419D4BJ3A12_PRODUCTION_CANONICAL_ID_AUTHORITY_IMPLEMENTED_NAMESPACE_CERTIFIED_READ_ONLY_FIRST_INSERT_BINDING_PREAUTHORIZATION_READY"
   :"M419D4BJ3A12_CANONICAL_NAMESPACE_CERTIFICATION_BLOCKED_RECONCILIATION_REQUIRED",
 certifiedAt:new Date().toISOString(),
 implementation:{
   module:"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js",
   factory:"buildGovernedProductionCanonicalIdAuthority",
   method:"resolveCanonicalPropertyId",
   sourceSha256:sha(fs.readFileSync(new URL("./GovernedProductionCanonicalIdAuthorityRuntime.js",import.meta.url))),
   productionExecutionAuthorized:false
 },
 namespaceCertification:{
   filesInspected,
   canonicalIdCount:canonicalIds.length,
   namespace,
   checks,
   blockers,
   sampleDerivations:implementationReady?[sampleA,sampleB]:[],
   existingCanonicalIdsRewritten:false
 },
 policy:{
   namespaceCompatibilityCertifiedBeforeUse:passed,
   canonicalAuthorityIsReadOnly:true,
   firstInsertStillRequiresSeparateProductionStoreBinding:true,
   fiveRecordExecutionStillNotAuthorized:true,
   BJ4ExecutionStillProhibited:true,
   noSyntheticIdentity:true,
   noNetworkRequest:true
 },
 nextMilestone:passed
   ?"M4.19D4BJ3A13_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_BINDING_AND_DRY_RUN_CERTIFICATION"
   :"M4.19D4BJ3A12R1_CANONICAL_NAMESPACE_COMPATIBILITY_RECONCILIATION",
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,governedInventoryMutationPerformed:false,
   productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,
   temporalMutationPerformed:false,applicationSourceImplementationPerformed:true,
   identityCreationExecuted:false,existingCanonicalIdRewritePerformed:false
 }
};

fs.mkdirSync(ev,{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!passed) process.exit(2);
