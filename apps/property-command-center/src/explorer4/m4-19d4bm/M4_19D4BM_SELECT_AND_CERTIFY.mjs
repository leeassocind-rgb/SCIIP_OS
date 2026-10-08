#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const blPath=path.join(ev,"m4-19d4bl-five-property-canonical-identity-creation-and-runtime-visibility-lifecycle-closure.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const eventPath=path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const out=path.join(ev,"m4-19d4bm-next-controlled-ten-property-cohort-readiness-and-selection.json");

for(const p of [blPath,inventoryPath,canonicalPath,eventPath,runtimePath])
 if(!fs.existsSync(p)) throw new Error("required input missing: "+p);

const BL=JSON.parse(fs.readFileSync(blPath,"utf8"));
if(BL.state!=="M419D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSED_NEXT_CONTROLLED_COHORT_READY")
 throw new Error("BL closure state mismatch");
if(BL.readiness?.controlledCohortReady!==true || BL.readiness?.recommendedNextCohortSize!==10)
 throw new Error("BL ten-property readiness not proven");

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const hashes={
 inventory:sha(inventoryPath),
 canonical:sha(canonicalPath),
 events:sha(eventPath),
 runtime:sha(runtimePath)
};
if(hashes.inventory!==BL.storageParity?.governedInventorySha256) throw new Error("governed inventory drift since BL");
if(hashes.canonical!==BL.storageParity?.canonicalSha256) throw new Error("canonical store drift since BL");
if(hashes.events!==BL.storageParity?.creationEventSha256) throw new Error("event store drift since BL");
if(hashes.runtime!==BL.storageParity?.runtimeMirrorSha256) throw new Error("runtime mirror drift since BL");

function arrays(x,p=[],out=[]){
 if(Array.isArray(x)){ out.push({path:p,rows:x}); for(let i=0;i<x.length;i++) if(x[i]&&typeof x[i]==="object") arrays(x[i],p.concat(i),out); }
 else if(x&&typeof x==="object") for(const [k,v] of Object.entries(x)) if(v&&typeof v==="object") arrays(v,p.concat(k),out);
 return out;
}
function val(o,keys){
 for(const k of keys) if(o && o[k]!==undefined && o[k]!==null && String(o[k]).trim()!=="") return o[k];
 return null;
}
const inv=JSON.parse(fs.readFileSync(inventoryPath,"utf8"));
const candidates=arrays(inv).filter(a=>a.rows.length && a.rows.some(r=>r&&typeof r==="object"&&!Array.isArray(r)));
for(const a of candidates){
 a.score=a.rows.reduce((s,r)=>{
  if(!r||typeof r!=="object"||Array.isArray(r)) return s;
  const sid=val(r,["sourcePropertyId","propertyId","Property_ID","PropertyID","id","buildingId","Building_ID"]);
  const addr=val(r,["address","Address","propertyAddress","Property_Address","streetAddress"]);
  return s+(sid?5:0)+(addr?5:0);
 },0);
}
candidates.sort((a,b)=>b.score-a.score || b.rows.length-a.rows.length);
if(!candidates.length || candidates[0].score===0) throw new Error("governed inventory record container unresolved");
const rows=candidates[0].rows;

const canonicalObj=JSON.parse(fs.readFileSync(canonicalPath,"utf8"));
const canonicalObjects=[];
(function walk(x){
 if(Array.isArray(x)) for(const v of x) walk(v);
 else if(x&&typeof x==="object"){ canonicalObjects.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") walk(v); }
})(canonicalObj);
const knownSource=new Set(canonicalObjects.map(x=>x?.sourcePropertyId).filter(Boolean));
const knownAddress=new Set(canonicalObjects.map(x=>String(x?.normalizedAddress||x?.address||"").trim().toLowerCase()).filter(Boolean));

const normalized=[];
for(let i=0;i<rows.length;i++){
 const r=rows[i];
 if(!r||typeof r!=="object"||Array.isArray(r)) continue;
 const sourcePropertyId=val(r,["sourcePropertyId","propertyId","Property_ID","PropertyID","id","buildingId","Building_ID"]);
 const address=val(r,["address","Address","propertyAddress","Property_Address","streetAddress"]);
 if(!sourcePropertyId || !address) continue;
 const addr=String(address).trim();
 const sid=String(sourcePropertyId).trim();
 if(knownSource.has(sid)) continue;
 if(knownAddress.has(addr.toLowerCase())) continue;
 normalized.push({
  sourcePropertyId:sid,
  address:addr,
  city:val(r,["city","City"]),
  state:val(r,["state","State"]),
  buildingSf:val(r,["buildingSf","buildingSF","Building SF","Building_SF","squareFeet","sf"]),
  status:val(r,["status","Status"]),
  originalIndex:i
 });
}
normalized.sort((a,b)=>a.sourcePropertyId.localeCompare(b.sourcePropertyId)||a.address.localeCompare(b.address)||a.originalIndex-b.originalIndex);

const dedup=[];
const seenS=new Set(),seenA=new Set();
for(const r of normalized){
 const ak=r.address.toLowerCase();
 if(seenS.has(r.sourcePropertyId)||seenA.has(ak)) continue;
 seenS.add(r.sourcePropertyId); seenA.add(ak); dedup.push(r);
}
if(dedup.length<10) throw new Error(`fewer than 10 eligible noncanonical governed inventory records: ${dedup.length}`);
const cohort=dedup.slice(0,10).map((r,i)=>({...r,cohortPosition:i+1}));
const cohortHash=crypto.createHash("sha256").update(JSON.stringify(cohort.map(x=>({
 cohortPosition:x.cohortPosition,sourcePropertyId:x.sourcePropertyId,address:x.address
})))).digest("hex");

const checks={
 blLifecycleClosed:true,
 blRecommendedTen:true,
 inventoryHashStable:hashes.inventory===BL.storageParity.governedInventorySha256,
 canonicalHashStable:hashes.canonical===BL.storageParity.canonicalSha256,
 eventHashStable:hashes.events===BL.storageParity.creationEventSha256,
 runtimeHashStable:hashes.runtime===BL.storageParity.runtimeMirrorSha256,
 canonicalRuntimeParity:hashes.canonical===hashes.runtime,
 inventoryContainerResolved:true,
 atLeastTenEligibleCandidates:dedup.length>=10,
 exactTenSelected:cohort.length===10,
 selectedSourceIdsUnique:new Set(cohort.map(x=>x.sourcePropertyId)).size===10,
 selectedAddressesUnique:new Set(cohort.map(x=>x.address.toLowerCase())).size===10,
 noSelectedSourceAlreadyCanonical:cohort.every(x=>!knownSource.has(x.sourcePropertyId)),
 noSelectedAddressAlreadyCanonical:cohort.every(x=>!knownAddress.has(x.address.toLowerCase()))
};
const passed=Object.values(checks).every(Boolean);

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_READINESS_AND_SELECTION",
 version:"4.0-m4.19d4bm",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_DETERMINISTICALLY_SELECTED_CREATION_PREAUTHORIZATION_READY"
  :"M419D4BM_TEN_PROPERTY_COHORT_SELECTION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 prerequisite:{
  blState:BL.state,
  priorCohortSize:BL.closure?.cohortSize,
  recommendedNextCohortSize:BL.readiness?.recommendedNextCohortSize,
  expansionFactor:BL.readiness?.expansionFactor
 },
 sourceBinding:{
  governedInventory:inventoryPath,
  inventoryRecordContainerPath:candidates[0].path,
  inventoryRecordCount:rows.length,
  eligibleNoncanonicalCount:dedup.length,
  canonicalStore:canonicalPath,
  creationEventStore:eventPath,
  runtimeMirror:runtimePath,
  hashes
 },
 selection:{
  method:"DETERMINISTIC_SOURCE_PROPERTY_ID_THEN_ADDRESS_ASCENDING",
  size:cohort.length,
  cohortHash,
  cohort
 },
 checks,
 preauthorization:{
  cohortSelectionCertified:passed,
  productionExecutionAuthorized:false,
  maximumCanonicalIdentityCreations:10,
  sequentialExecutionRequired:true,
  haltOnFirstFailure:true,
  duplicateRecheckBeforeEachInsert:true,
  canonicalReadAfterWriteRequired:true,
  creationEventAppendRequired:true,
  eventReadAfterAppendRequired:true,
  runtimePropagationRequiresSeparateAuthorization:true,
  browserVisibilityRequiresSeparateCertification:true,
  noTemporalOrAvailabilityMutation:true,
  noGovernedInventoryMutation:true
 },
 policy:{
  selectionReadOnly:true,
  broadScaleOutAuthorized:false,
  canonicalCreationNotExecuted:true,
  eventAppendNotExecuted:true,
  runtimePropagationNotExecuted:true,
  browserInteractionNotExecuted:true,
  separateTenPropertyCreationExecutionPreauthorizationRequired:true
 },
 nextMilestone:passed
  ?"M4.19D4BM1_CONTROLLED_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION_PREAUTHORIZATION"
  :"M4.19D4BM_R1_COHORT_SELECTION_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
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
