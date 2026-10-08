#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,norm,flatten,addressLike} from "./M419D4AV22Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const av21Path=path.join(ev,"m4-19d4av2-1-bounded-canonical-to-inventory-identity-lineage-recovery.json");
const av21ManifestPath=path.join(ev,"m4-19d4av2-1-inventory-binding-candidate-manifest.json");
const auAuditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const resultPath=path.join(ev,"m4-19d4av2-2-structural-same-record-identity-lineage-validation.json");
const auditPath=path.join(ev,"m4-19d4av2-2-false-positive-lineage-rejection-audit.json");
const mappingPath=path.join(ev,"m4-19d4av2-2-authoritative-mapping-candidate-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
  const out={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      networkRequestsPerformed:0,currentStateMutationPerformed:false,temporalMutationPerformed:false,
      canonicalMutationPerformed:false,identityMutationPerformed:false,downstreamMaterializationPerformed:false,
      syntheticIdentityUsed:false,proximityIdentityUsed:false,transitiveTokenIdentityAccepted:false,
      automaticRetry:false
    }};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
}

for(const p of [av21Path,av21ManifestPath,auAuditPath,inventoryPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AV2_2_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}

const av21=JSON.parse(fs.readFileSync(av21Path,"utf8"));
if(av21.state!=="M419D4AV2_1_UNIQUE_CANONICAL_TO_GOVERNED_BASE_INVENTORY_LINEAGE_RECOVERED_AV_REPREAUTHORIZATION_READY"){
  finish("BLOCKED","M419D4AV2_2_AV2_1_UNIQUE_LINEAGE_STATE_REQUIRED",{observed:av21.state},3);
}

const manifest=JSON.parse(fs.readFileSync(av21ManifestPath,"utf8"));
const obs=JSON.parse(fs.readFileSync(auAuditPath,"utf8")).appendedObservation;
const invText=fs.readFileSync(inventoryPath,"utf8");
const inv=JSON.parse(invText);

function recordsOf(doc){
  if(Array.isArray(doc)) return doc;
  for(const k of ["records","properties","items","features","inventory","data"]) if(Array.isArray(doc?.[k])) return doc[k];
  const arr=Object.values(doc||{}).filter(Array.isArray);
  return arr.length===1?arr[0]:[];
}
const records=recordsOf(inv);
const idx=manifest?.uniqueCandidate?.recordIndex;
if(!Number.isInteger(idx)||!records[idx]) finish("BLOCKED","M419D4AV2_2_AV2_1_CANDIDATE_RECORD_MISSING",{recordIndex:idx},3);

const candidate=records[idx];
const candidateFlat=flatten(candidate);
const candidateAddresses=candidateFlat
  .filter(e=>(typeof e.value==="string"||typeof e.value==="number") && (/address|street|location|identityKey/i.test(e.key)||addressLike(e.value)))
  .map(e=>({path:e.path,value:String(e.value),normalized:norm(e.value)}))
  .filter(x=>addressLike(x.value)||/\|/.test(x.value));

const certifiedAddress=norm(obs.address);
const certifiedStreetNumber=(certifiedAddress.match(/\d{2,6}/)||[])[0]||null;
const candidateAddressMatch=candidateAddresses.some(x=>{
  if(x.normalized===certifiedAddress) return true;
  if(x.normalized.includes(certifiedAddress)||certifiedAddress.includes(x.normalized)) return true;
  return false;
});
const candidateStreetNumbers=[...new Set(candidateAddresses.flatMap(x=>x.normalized.match(/\d{2,6}/g)||[]))];
const explicitAddressContradiction=!!(
  candidateAddresses.length &&
  !candidateAddressMatch &&
  certifiedStreetNumber &&
  candidateStreetNumbers.length &&
  !candidateStreetNumbers.includes(certifiedStreetNumber)
);

const priorEvidence=manifest?.uniqueCandidate?.evidence??[];
const transitiveOnly=priorEvidence.length>0 && priorEvidence.every(e=>Number(e.depth)>=1);

console.log(`[AV2.2] AV2.1 candidate record=${idx}`);
console.log(`[AV2.2] certified address=${obs.address}`);
console.log(`[AV2.2] candidate address-like values=${candidateAddresses.length}`);
console.log(`[AV2.2] transitive-only prior evidence=${transitiveOnly}`);
console.log(`[AV2.2] explicit address contradiction=${explicitAddressContradiction}`);

const rejection={
  av21CandidateRecordIndex:idx,
  av21LineageScore:manifest?.uniqueCandidate?.score??null,
  certifiedIdentity:{
    canonicalPropertyId:obs.canonicalPropertyId,
    sourcePropertyId:obs.sourcePropertyId,
    address:obs.address
  },
  candidateAddresses,
  candidateAvailableSf:candidate.availableSf??candidate.availableSF??candidate.available_sf??null,
  priorBindingEvidence:priorEvidence,
  transitiveOnly,
  explicitAddressContradiction,
  rejected: transitiveOnly || explicitAddressContradiction
};

if(!rejection.rejected){
  finish("BLOCKED","M419D4AV2_2_AV2_1_CANDIDATE_NOT_PROVEN_FALSE_POSITIVE_MANUAL_REVIEW_REQUIRED",{rejection},3);
}

const roots=[ev,path.join(app,"public"),path.join(app,"src"),path.join(app,"server")].filter(fs.existsSync);
const exts=new Set([".json",".jsonl"]);
const files=[];
function collect(dir){
  let ents=[]; try{ents=fs.readdirSync(dir,{withFileTypes:true})}catch{return}
  for(const e of ents){
    const p=path.join(dir,e.name);
    if(e.isDirectory()){
      if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
      collect(p);
    } else if(exts.has(path.extname(p).toLowerCase())){
      try{if(fs.statSync(p).size<=4*1024*1024) files.push(p)}catch{}
    }
  }
}
for(const r of roots) collect(r);

const cid=norm(obs.canonicalPropertyId), sid=norm(obs.sourcePropertyId), addr=norm(obs.address);
const structuralMappings=[];

function inspectObject(obj,file,objPath="$"){
  if(!obj||typeof obj!=="object") return;
  const flat=flatten(obj,objPath);
  const vals=flat.filter(e=>typeof e.value==="string"||typeof e.value==="number").map(e=>({path:e.path,key:e.key,norm:norm(e.value),raw:e.value}));
  const hasCID=vals.some(x=>x.norm===cid);
  const hasSID=vals.some(x=>x.norm===sid);
  const addressVals=vals.filter(x=>/address|street|location|identityKey/i.test(x.key)||addressLike(x.raw));
  const hasAddr=addressVals.some(x=>x.norm===addr||x.norm.includes(addr)||addr.includes(x.norm));
  if(!(hasCID||hasSID||hasAddr)) return;

  const keys=vals.filter(x=>/identityKey|inventoryKey|baseInventoryKey|recordKey|propertyKey|assetKey|sourceKey/i.test(x.key))
    .filter(x=>x.norm && x.norm!==cid && x.norm!==sid)
    .slice(0,20);

  if(keys.length){
    structuralMappings.push({
      file,objPath,
      sameObjectCanonicalId:hasCID,
      sameObjectSourceId:hasSID,
      sameObjectAddress:hasAddr,
      addressEvidence:addressVals.slice(0,10).map(x=>({path:x.path,value:x.raw})),
      candidateKeys:keys.map(x=>({path:x.path,key:x.key,value:x.raw,normalized:x.norm}))
    });
  }
}

for(let i=0;i<files.length;i++){
  if(i>0&&i%100===0) console.log(`[AV2.2] structural mapping scan ${i}/${files.length}`);
  const p=files[i];
  let text=""; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  const up=text.toUpperCase();
  if(!up.includes(cid)&&!up.includes(sid)&&!up.includes(addr)&&!up.includes("14117 BESSEMER")) continue;
  if(path.extname(p).toLowerCase()===".jsonl"){
    const lines=text.split("\n").filter(Boolean).slice(0,10000);
    for(let j=0;j<lines.length;j++){try{inspectObject(JSON.parse(lines[j]),p,`$line[${j}]`)}catch{}}
  } else {
    try{
      const obj=JSON.parse(text);
      if(Array.isArray(obj)) obj.forEach((x,j)=>inspectObject(x,p,`$[${j}]`));
      else {
        inspectObject(obj,p,"$");
        for(const [k,v] of Object.entries(obj||{})) if(Array.isArray(v)) v.forEach((x,j)=>inspectObject(x,p,`$.${k}[${j}]`));
      }
    }catch{}
  }
}

const inventoryKeyMatches=[];
for(const m of structuralMappings){
  for(const k of m.candidateKeys){
    const hits=[];
    records.forEach((r,i)=>{
      const f=flatten(r);
      if(f.some(e=>(typeof e.value==="string"||typeof e.value==="number")&&norm(e.value)===k.normalized)) hits.push(i);
    });
    if(hits.length) inventoryKeyMatches.push({...m,key:k,inventoryRecordIndices:hits});
  }
}

const uniqueMappings=inventoryKeyMatches.filter(x=>x.inventoryRecordIndices.length===1);
const byIndex=new Map();
for(const m of uniqueMappings){
  const i=m.inventoryRecordIndices[0];
  if(!byIndex.has(i)) byIndex.set(i,[]);
  byIndex.get(i).push(m);
}
const candidateIndices=[...byIndex.keys()];
const uniqueIndex=candidateIndices.length===1?candidateIndices[0]:null;

write(auditPath,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV2_2_FALSE_POSITIVE_LINEAGE_REJECTION_AUDIT",
  version:VERSION,generatedAt:new Date().toISOString(),
  av21Rejection:rejection,
  structuralFilesScanned:files.length,
  structuralMappingCount:structuralMappings.length,
  inventoryKeyMatchCount:inventoryKeyMatches.length,
  uniqueInventoryRecordCandidateCount:candidateIndices.length,
  uniqueInventoryRecordCandidates:candidateIndices,
  structuralMappings:structuralMappings.slice(0,100),
  inventoryKeyMatches:inventoryKeyMatches.slice(0,100)
});

if(uniqueIndex===null){
  write(mappingPath,{
    contract:"SCIIP_EXPLORER_4_M4_19D4AV2_2_AUTHORITATIVE_MAPPING_CANDIDATE_MANIFEST",
    version:VERSION,generatedAt:new Date().toISOString(),
    rejectedAv21RecordIndex:idx,
    uniqueInventoryRecord:null,
    candidateIndices,
    executionAuthorized:false
  });
  finish("PASSED","M419D4AV2_2_AV2_1_FALSE_POSITIVE_REJECTED_NO_UNIQUE_STRUCTURAL_MAPPING_RECOVERED_AUTHORITATIVE_MAPPING_REQUIRED",{
    validation:{
      rejectedAv21RecordIndex:idx,
      rejectedCandidateAddresses:candidateAddresses,
      explicitAddressContradiction,
      transitiveOnly,
      structuralFilesScanned:files.length,
      structuralMappingCount:structuralMappings.length,
      candidateIndices
    },
    policy:{
      transitiveTokenPropagationInsufficientForIdentity:true,
      sameParsedRecordOrAuthoritativeMappingRequired:true,
      addressContradictionBlocksIdentity:true,
      syntheticIdentityProhibited:true,
      currentStateMutationNotPerformed:true
    },
    artifacts:{falsePositiveRejectionAudit:auditPath,mappingCandidateManifest:mappingPath},
    nextMilestone:"M4.19D4AV3_OPERATOR_OR_AUTHORITATIVE_CANONICAL_TO_BASE_INVENTORY_MAPPING_GATE"
  });
}

const mappedRecord=records[uniqueIndex];
const mappings=byIndex.get(uniqueIndex);
write(mappingPath,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV2_2_AUTHORITATIVE_MAPPING_CANDIDATE_MANIFEST",
  version:VERSION,generatedAt:new Date().toISOString(),
  rejectedAv21RecordIndex:idx,
  uniqueInventoryRecord:{
    recordIndex:uniqueIndex,
    mappingEvidence:mappings,
    currentAvailableSf:mappedRecord.availableSf??mappedRecord.availableSF??mappedRecord.available_sf??null
  },
  certifiedObservation:{
    observationId:obs.observationId,
    canonicalPropertyId:obs.canonicalPropertyId,
    sourcePropertyId:obs.sourcePropertyId,
    address:obs.address,
    proposedAvailableSf:obs.value
  },
  executionAuthorized:false
});

finish("PASSED","M419D4AV2_2_AV2_1_FALSE_POSITIVE_REJECTED_UNIQUE_STRUCTURAL_INVENTORY_MAPPING_RECOVERED_REPREAUTHORIZATION_READY",{
  validation:{
    rejectedAv21RecordIndex:idx,
    explicitAddressContradiction,
    transitiveOnly,
    mappedRecordIndex:uniqueIndex,
    structuralMappingEvidence:mappings,
    currentAvailableSf:mappedRecord.availableSf??mappedRecord.availableSF??mappedRecord.available_sf??null,
    proposedAvailableSf:obs.value
  },
  policy:{
    transitiveTokenPropagationInsufficientForIdentity:true,
    sameParsedRecordOrAuthoritativeMappingRequired:true,
    addressContradictionBlocksIdentity:true,
    currentStateMutationNotPerformed:true
  },
  artifacts:{falsePositiveRejectionAudit:auditPath,mappingCandidateManifest:mappingPath},
  nextMilestone:"M4.19D4AV3_CURRENT_STATE_PROMOTION_REPREAUTHORIZATION_USING_STRUCTURALLY_CERTIFIED_MAPPING"
});
