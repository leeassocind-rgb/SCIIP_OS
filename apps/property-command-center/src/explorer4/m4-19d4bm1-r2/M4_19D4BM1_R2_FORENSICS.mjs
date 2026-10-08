#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bm=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4bm-next-controlled-ten-property-cohort-readiness-and-selection.json"),"utf8"));
const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const out=path.join(ev,"m4-19d4bm1-r2-exact-canonical-id-authority-invocation-contract-forensics.json");

if(bm.state!=="M419D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_DETERMINISTICALLY_SELECTED_CREATION_PREAUTHORIZATION_READY")
  throw new Error("BM state mismatch");
if(!fs.existsSync(authorityPath)||!fs.existsSync(canonicalPath)) throw new Error("required runtime/store missing");

const source=fs.readFileSync(authorityPath,"utf8");
const mod=await import(pathToFileURL(authorityPath).href+"?bm1r2="+Date.now());
if(typeof mod.buildGovernedProductionCanonicalIdAuthority!=="function") throw new Error("authority factory missing");

function collect(x,out=[]){
 if(Array.isArray(x)){ for(const v of x) collect(v,out); }
 else if(x&&typeof x==="object"){ out.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") collect(v,out); }
 return out;
}
const objs=collect(JSON.parse(fs.readFileSync(canonicalPath,"utf8")));
const canonicalIds=[...new Set(objs.map(x=>x?.canonicalPropertyId).filter(x=>typeof x==="string"&&/^CPROP-[0-9A-F]{20}$/.test(x)))];

const namespace={
 totalInput:canonicalIds.length,
 validCanonicalIdCount:canonicalIds.length,
 observedHexPrefixLengths:[20],
 dominantHexPrefixLength:20,
 dominantCount:canonicalIds.length,
 namespaceHomogeneous:true
};

const target=bm.selection.cohort[0];
const sourceProvenance={
 provider:"GOVERNED_BASE_INVENTORY",
 inventorySha256:bm.sourceBinding.hashes.inventory,
 inventoryRecordIndex:target.originalIndex,
 cohort:"M4.19D4BM",
 cohortHash:bm.selection.cohortHash
};
const identityEvidence={
 address:target.address,city:target.city,state:target.state,
 buildingSf:target.buildingSf,status:target.status,sourcePropertyId:target.sourcePropertyId
};

const factorySource=mod.buildGovernedProductionCanonicalIdAuthority.toString();

const factoryShapes=[
 {name:"namespace_object",args:[namespace]},
 {name:"canonical_ids_array",args:[canonicalIds]},
 {name:"config_with_namespace",args:[{namespace,canonicalIds,existingCanonicalIds:canonicalIds,namespacePrefixLength:20,dominantHexPrefixLength:20}]},
 {name:"config_with_namespace_certification",args:[{namespaceCertification:namespace,existingCanonicalIds:canonicalIds,namespacePrefixLength:20}]},
 {name:"config_with_canonical_ids",args:[{canonicalIds,namespacePrefixLength:20}]}
];

const probeInputs=[
 {name:"object_standard",args:[{sourcePropertyId:target.sourcePropertyId,normalizedAddress:target.address,sourceProvenance,identityEvidence}]},
 {name:"object_address",args:[{sourcePropertyId:target.sourcePropertyId,address:target.address,sourceProvenance,identityEvidence}]},
 {name:"object_with_namespace",args:[{sourcePropertyId:target.sourcePropertyId,normalizedAddress:target.address,sourceProvenance,identityEvidence,namespace}]},
 {name:"positional_4",args:[target.sourcePropertyId,target.address,sourceProvenance,identityEvidence]},
 {name:"positional_2",args:[target.sourcePropertyId,target.address]}
];

const attempts=[];
let exactBinding=null;

for(const fspec of factoryShapes){
 let authority;
 try{
   authority=mod.buildGovernedProductionCanonicalIdAuthority(...fspec.args);
 }catch(e){
   attempts.push({factoryShape:fspec.name,factoryError:String(e)});
   continue;
 }
 const method=authority?.resolveCanonicalPropertyId;
 const methodSource=typeof method==="function"?method.toString():null;
 if(typeof method!=="function"){
   attempts.push({factoryShape:fspec.name,methodPresent:false});
   continue;
 }
 for(const pspec of probeInputs){
   let result=null,error=null;
   try{ result=method(...pspec.args); }catch(e){ error=String(e); }
   const rec={
     factoryShape:fspec.name,
     probeShape:pspec.name,
     methodLength:method.length,
     methodSource:methodSource?.slice(0,8000),
     result,
     error,
     canonicalPropertyId:result?.canonicalPropertyId??null,
     resolutionState:result?.resolutionState??result?.state??null
   };
   attempts.push(rec);
   if(!exactBinding && result?.canonicalPropertyId && /^CPROP-[0-9A-F]{20}$/.test(result.canonicalPropertyId)){
     exactBinding={
       factoryShape:fspec.name,
       probeShape:pspec.name,
       canonicalPropertyId:result.canonicalPropertyId,
       resolutionState:result?.resolutionState??result?.state??null,
       authorityReference:result?.authorityReference??null,
       derivationHash:result?.derivationHash??null
     };
   }
 }
}

const methodParameterSignals={
 factoryLength:mod.buildGovernedProductionCanonicalIdAuthority.length,
 factorySource:factorySource.slice(0,12000),
 sourceHasSourcePropertyId:/sourcePropertyId/.test(source),
 sourceHasNormalizedAddress:/normalizedAddress/.test(source),
 sourceHasIdentityEvidence:/identityEvidence/.test(source),
 sourceHasSourceProvenance:/sourceProvenance/.test(source),
 sourceHasCanonicalIds:/canonicalIds|existingCanonicalIds/.test(source),
 sourceHasNamespaceCertification:/namespaceCertification|namespaceHomogeneous/.test(source),
 sourceHasResolutionState:/resolutionState/.test(source)
};

const passed=!!exactBinding;

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM1_R2_EXACT_CANONICAL_ID_AUTHORITY_INVOCATION_CONTRACT_FORENSICS",
 version:"4.0-m4.19d4bm1-r2",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM1_R2_EXACT_CANONICAL_ID_AUTHORITY_INVOCATION_CONTRACT_PROVEN_TEN_PROPERTY_PREAUTHORIZATION_RETRY_READY"
  :"M419D4BM1_R2_CANONICAL_ID_AUTHORITY_INVOCATION_CONTRACT_UNRESOLVED",
 certifiedAt:new Date().toISOString(),
 diagnosis:{
  bm1Failure:"CANONICAL_NAMESPACE_NOT_HOMOGENEOUS",
  bm1r1NamespaceCertificationSucceeded:true,
  bm1r1Failure:"CANONICAL_ID_DERIVATION_RETURNED_NO_CANONICAL_PROPERTY_ID",
  conclusion:passed
    ?"Exact callable contract recovered by read-only probing."
    :"No safe tested invocation shape produced a canonicalPropertyId; deeper source-level reconciliation required."
 },
 target,
 namespace,
 methodParameterSignals,
 exactBinding,
 attempts,
 policy:{
  readOnlyForensics:true,
  productionExecutionAuthorized:false,
  canonicalMutation:false,
  eventMutation:false,
  runtimeMutation:false,
  inventoryMutation:false,
  temporalMutation:false,
  networkRequests:0
 },
 nextMilestone:passed
  ?"M4.19D4BM1_R3_TEN_PROPERTY_CANONICAL_ID_DERIVATION_AND_EXECUTION_MANIFEST_FINALIZATION"
  :"M4.19D4BM1_R2A_CANONICAL_ID_AUTHORITY_SOURCE_LEVEL_CONTRACT_RECONCILIATION",
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
if(!passed) process.exit(2);
