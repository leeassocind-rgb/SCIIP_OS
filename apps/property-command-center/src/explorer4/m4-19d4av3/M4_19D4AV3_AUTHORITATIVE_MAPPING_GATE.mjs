#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,flatten,recordsOf,addressTokens} from "./M419D4AV34Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prereq=path.join(ev,"m4-19d4av2-2-structural-same-record-identity-lineage-validation.json");
const auAudit=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");

const result=path.join(ev,"m4-19d4av3-authoritative-canonical-to-base-inventory-mapping-gate.json");
const audit=path.join(ev,"m4-19d4av3-inventory-record-resolution-audit.json");
const manifest=path.join(ev,"m4-19d4av3-authoritative-inventory-mapping-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AV3_OPERATOR_OR_AUTHORITATIVE_CANONICAL_TO_BASE_INVENTORY_MAPPING_GATE",
  version:"4.0-m4.19d4av3",status,state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
   syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,currentStateMutationPerformed:false,temporalMutationPerformed:false,
   canonicalMutationPerformed:false,identityMutationPerformed:false,syntheticIdentityUsed:false,
   proximityIdentityUsed:false,operatorGuessUsed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [prereq,auAudit,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4AV3_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const p2=JSON.parse(fs.readFileSync(prereq,"utf8"));
if(p2.state!=="M419D4AV2_2_AV2_1_FALSE_POSITIVE_REJECTED_NO_UNIQUE_STRUCTURAL_MAPPING_RECOVERED_AUTHORITATIVE_MAPPING_REQUIRED")
 done("BLOCKED","M419D4AV3_AV2_2_AUTHORITATIVE_MAPPING_REQUIRED_STATE_EXPECTED",{observed:p2.state},3);

const obs=JSON.parse(fs.readFileSync(auAudit,"utf8")).appendedObservation;
const invText=fs.readFileSync(invPath,"utf8"), inv=JSON.parse(invText), records=recordsOf(inv);
if(!records.length) done("BLOCKED","M419D4AV3_INVENTORY_RECORDS_NOT_RECOVERED",{},3);

const target=addressTokens(obs.address);
const survivorIndices=(p2?.validation?.candidateIndices??[]).filter(i=>Number.isInteger(i));
const disqualified=new Set([p2?.validation?.rejectedAv21RecordIndex].filter(Number.isInteger));

function evidenceForRecord(r,index){
 const flat=flatten(r);
 const scalar=flat.filter(e=>typeof e.value==="string"||typeof e.value==="number");
 const addrFields=scalar.filter(e=>/address|street|location|identityKey|city|zip/i.test(e.key));
 let exact=0, street=0, number=0, cityVanNuys=0;
 const evidence=[];
 for(const e of addrFields){
  const n=norm(e.value);
  if(n===target.n || n.includes(target.n) || target.n.includes(n)){
   exact++; evidence.push({type:"ADDRESS_EXACT_OR_CONTAINS",path:e.path,value:e.value});
  }
  if(target.street && n.includes(target.street)){
   street++; evidence.push({type:"STREET_MATCH",path:e.path,value:e.value});
  }
  if(target.nums.some(x=>(n.match(/\b\d{2,6}\b/g)||[]).includes(x))){
   number++; evidence.push({type:"STREET_NUMBER_MATCH",path:e.path,value:e.value});
  }
  if(n.includes("VAN NUYS")){cityVanNuys++;evidence.push({type:"CITY_MATCH",path:e.path,value:e.value});}
 }
 const explicitAddress=addrFields.find(e=>/^address$/i.test(e.key))?.value ?? r.address ?? null;
 let classification="NO_MATCH";
 if(exact>0 || (street>0 && number>0)) classification="STRONG_ADDRESS_MATCH";
 else if(number>0 && cityVanNuys>0) classification="POSSIBLE_ADDRESS_MATCH";
 return {index,classification,explicitAddress,evidence:evidence.slice(0,20),
  currentAvailableSf:r.availableSf??r.availableSF??r.available_sf??null,
  identityKey:scalar.find(e=>/identityKey/i.test(e.key))?.value??null,
  keys:Object.keys(r).slice(0,60)};
}

console.log(`[AV3] inventory records=${records.length}; prior structural candidates=${survivorIndices.join(",")||"none"}`);
const survivorInspection=survivorIndices.map(i=>records[i]?evidenceForRecord(records[i],i):{index:i,missing:true});
for(const x of survivorInspection) console.log(`[AV3] candidate ${x.index}: ${x.explicitAddress??"NO_ADDRESS"} => ${x.classification??"MISSING"}`);

const all=records.map((r,i)=>evidenceForRecord(r,i));
const strong=all.filter(x=>x.classification==="STRONG_ADDRESS_MATCH"&&!disqualified.has(x.index));
const possible=all.filter(x=>x.classification==="POSSIBLE_ADDRESS_MATCH"&&!disqualified.has(x.index));

console.log(`[AV3] whole-inventory strong Bessemer matches=${strong.length}; possible matches=${possible.length}`);

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AV3_INVENTORY_RECORD_RESOLUTION_AUDIT",
 version:"4.0-m4.19d4av3",generatedAt:new Date().toISOString(),
 target:{canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address},
 inventoryPath:invPath,inventorySha256:sha(invText),inventoryRecordCount:records.length,
 disqualifiedIndices:[...disqualified],survivorInspection,strongMatches:strong,possibleMatches:possible.slice(0,30)
});

if(strong.length===1){
 const x=strong[0];
 write(manifest,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV3_AUTHORITATIVE_INVENTORY_MAPPING_MANIFEST",version:"4.0-m4.19d4av3",
  generatedAt:new Date().toISOString(),classification:"UNIQUE_EXISTING_RECORD",
  canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address,
  inventoryRecordIndex:x.index,mappingEvidence:x.evidence,currentAvailableSf:x.currentAvailableSf,
  proposedAvailableSf:obs.value,observationId:obs.observationId,executionAuthorized:false
 });
 done("PASSED","M419D4AV3_UNIQUE_EXISTING_GOVERNED_INVENTORY_RECORD_CERTIFIED_AV4_READY",{
  resolution:{classification:"UNIQUE_EXISTING_RECORD",recordIndex:x.index,address:x.explicitAddress,
   currentAvailableSf:x.currentAvailableSf,proposedAvailableSf:obs.value,evidence:x.evidence},
  artifacts:{resolutionAudit:audit,authoritativeMappingManifest:manifest},
  nextMilestone:"M4.19D4AV4_CURRENT_STATE_PATH_CERTIFICATION"
 });
}
if(strong.length===0 && possible.length===0){
 write(manifest,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV3_AUTHORITATIVE_INVENTORY_MAPPING_MANIFEST",version:"4.0-m4.19d4av3",
  generatedAt:new Date().toISOString(),classification:"BASE_INVENTORY_RECORD_ABSENT",
  canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address,
  inventoryRecordIndex:null,inventoryRecordCount:records.length,proposedAvailableSf:obs.value,
  observationId:obs.observationId,executionAuthorized:false
 });
 done("PASSED","M419D4AV3_CERTIFIED_PROPERTY_ABSENT_FROM_GOVERNED_BASE_INVENTORY_AV4_INSERTION_PATH_CERTIFICATION_READY",{
  resolution:{classification:"BASE_INVENTORY_RECORD_ABSENT",inventoryRecordCount:records.length,
   proposedAvailableSf:obs.value,strongMatchCount:0,possibleMatchCount:0},
  artifacts:{resolutionAudit:audit,authoritativeMappingManifest:manifest},
  nextMilestone:"M4.19D4AV4_CURRENT_STATE_PATH_CERTIFICATION"
 });
}
done("PASSED","M419D4AV3_AMBIGUOUS_INVENTORY_IDENTITY_OPERATOR_REVIEW_REQUIRED",{
 resolution:{classification:"AMBIGUOUS",strongMatches:strong,possibleMatches:possible.slice(0,20)},
 artifacts:{resolutionAudit:audit},
 nextMilestone:"M4.19D4AV3_OPERATOR_REVIEW"
});
