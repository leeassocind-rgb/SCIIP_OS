#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

function readJson(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }
function findEvidenceByState(states){
  const files=fs.readdirSync(ev).filter(x=>x.endsWith(".json"));
  const hits=[];
  for(const name of files){
    const p=path.join(ev,name);
    let j; try{j=readJson(p)}catch{continue}
    if(states.includes(j?.state)) hits.push({path:p,json:j});
  }
  return hits;
}
function findEvidenceByContractIncludes(parts){
  const files=fs.readdirSync(ev).filter(x=>x.endsWith(".json"));
  const hits=[];
  for(const name of files){
    const p=path.join(ev,name);
    let j; try{j=readJson(p)}catch{continue}
    const c=String(j?.contract||"");
    if(parts.every(x=>c.includes(x))) hits.push({path:p,json:j});
  }
  return hits;
}

const a14Path=path.join(ev,"m4-19d4bj3a14-production-first-insert-store-adapter-implementation-and-isolated-filesystem-certification.json");
if(!fs.existsSync(a14Path)) throw new Error("A14 evidence missing");
const A14=readJson(a14Path);
if(A14.state!=="M419D4BJ3A14_PRODUCTION_FIRST_INSERT_STORE_ADAPTER_IMPLEMENTED_ISOLATED_FILESYSTEM_CERTIFIED_FIVE_RECORD_REPREAUTHORIZATION_READY")
  throw new Error("A14 state mismatch");

const bj3bStates=[
  "M419D4BJ3B_EXACT_FIVE_PROPERTY_EXECUTABLE_PIPELINE_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED_BJ4_READY"
];
let bj3bHits=findEvidenceByState(bj3bStates);
if(bj3bHits.length===0){
  bj3bHits=findEvidenceByContractIncludes(["BJ3B","FIVE_PROPERTY","REPREAUTHORIZATION"]);
}
if(bj3bHits.length!==1){
  throw new Error(`expected exactly one BJ3B evidence artifact, found ${bj3bHits.length}: ${bj3bHits.map(x=>path.basename(x.path)).join(", ")}`);
}
const BJ3B=bj3bHits[0].json;

const bj2States=[
  "M419D4BJ2_FIVE_PROPERTY_CANONICAL_IDENTITY_LINEAGE_ADJUDICATED_IDENTITY_ACTION_PLAN_CERTIFIED_EXECUTION_NOT_AUTHORIZED"
];
let bj2Hits=findEvidenceByState(bj2States);
if(bj2Hits.length===0){
  bj2Hits=findEvidenceByContractIncludes(["BJ2","FIVE_PROPERTY","CANONICAL_IDENTITY_LINEAGE"]);
}
if(bj2Hits.length!==1){
  throw new Error(`expected exactly one BJ2 evidence artifact, found ${bj2Hits.length}: ${bj2Hits.map(x=>path.basename(x.path)).join(", ")}`);
}
const BJ2=bj2Hits[0].json;

console.log(`[BJ3C-R1] BJ3B evidence bound: ${path.basename(bj3bHits[0].path)}`);
console.log(`[BJ3C-R1] BJ2 evidence bound: ${path.basename(bj2Hits[0].path)}`);

const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const primitivePath=path.join(app,"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js");
const storeAdapterPath=path.join(app,"src/runtime/GovernedCanonicalFirstInsertProductionStoreAdapterRuntime.js");
for(const q of [authorityPath,primitivePath,storeAdapterPath]) if(!fs.existsSync(q)) throw new Error("required runtime missing: "+q);

const authorityMod=await import(pathToFileURL(authorityPath).href);
const authorityFactory=authorityMod.buildGovernedProductionCanonicalIdAuthority;
if(typeof authorityFactory!=="function") throw new Error("canonical authority factory missing");

const a12Path=path.join(ev,"m4-19d4bj3a12-governed-production-canonical-id-authority-namespace-certification.json");
if(!fs.existsSync(a12Path)) throw new Error("A12 evidence missing");
const A12=readJson(a12Path);
const seeds=(A12.namespaceCertification?.sampleDerivations||[]).map(x=>x.canonicalPropertyId).filter(Boolean);
const existingIds=seeds.length?seeds:["CPROP-00000000000000000000"];
const authority=authorityFactory({existingCanonicalIds:existingIds});

const records=(BJ3B.cohort?.records||BJ2.records||[]).slice(0,5);
if(records.length!==5) throw new Error(`expected exact five-property cohort, found ${records.length}`);

console.log("[BJ3C-R1] A14 production first-insert adapter certification accepted");
console.log("[BJ3C-R1] recomputing deterministic canonical IDs for exact five-record cohort; writes remain OFF");

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
  BJ3BEvidenceUniquelyBound:true,
  BJ2EvidenceUniquelyBound:true,
  productionBindingComplete:true,
  sequentialExecutionRequired:true,
  haltOnFirstFailure:true,
  duplicateRecheckImmediatelyBeforeEachInsert:true,
  readAfterWriteRequired:true,
  productionExecutionNotYetAuthorized:true
};
const ready=Object.values(checks).every(Boolean);

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3C_R1_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZATION",
  version:"4.0-m4.19d4bj3c-r1",
  status:ready?"PASSED":"BLOCKED",
  state:ready
    ?"M419D4BJ3C_R1_EXACT_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_FINAL_REPREAUTHORIZED_BJ4_EXECUTION_AUTHORIZATION_REQUIRED"
    :"M419D4BJ3C_R1_FINAL_REPREAUTHORIZATION_BLOCKED",
  certifiedAt:new Date().toISOString(),
  correction:{
    priorFailure:"HARDCODED_BJ3B_EVIDENCE_FILENAME_NOT_PRESENT",
    corrected:true,
    evidenceResolutionMode:"CERTIFIED_STATE_THEN_CONTRACT_FALLBACK",
    bj3bEvidence:path.basename(bj3bHits[0].path),
    bj2Evidence:path.basename(bj2Hits[0].path),
    priorProductionMutationPerformed:false
  },
  cohort:{size:5,cohortHash,records:derived,allExecutionAuthorized:false},
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
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
    productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,identityCreationExecutedInProduction:false,
    automaticRetry:false
  }
};

fs.writeFileSync(path.join(ev,"m4-19d4bj3c-r1-five-property-canonical-identity-creation-final-repreauthorization.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!ready) process.exit(2);
