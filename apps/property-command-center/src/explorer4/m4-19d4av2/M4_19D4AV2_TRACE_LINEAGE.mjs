#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,norm,flatten} from "./M419D4AV2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const av1Path=path.join(ev,"m4-19d4av1-governed-base-inventory-record-identity-reconciliation.json");
const auAuditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const resultPath=path.join(ev,"m4-19d4av2-canonical-to-governed-base-inventory-identity-lineage-forensics.json");
const lineageAuditPath=path.join(ev,"m4-19d4av2-canonical-inventory-identity-lineage-audit.json");
const candidateManifestPath=path.join(ev,"m4-19d4av2-governed-inventory-lineage-candidate-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const o={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
  automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,currentStateMutationPerformed:false,temporalMutationPerformed:false,
  canonicalMutationPerformed:false,identityMutationPerformed:false,downstreamMaterializationPerformed:false,
  syntheticIdentityUsed:false,proximityIdentityUsed:false,automaticRetry:false
 }};
 write(resultPath,o); console.log(JSON.stringify(o,null,2)); process.exit(code);
}

for(const p of [av1Path,auAuditPath,inventoryPath]){
 if(!fs.existsSync(p)) finish("BLOCKED","M419D4AV2_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const av1=JSON.parse(fs.readFileSync(av1Path,"utf8"));
if(av1.state!=="M419D4AV1_NO_UNIQUE_STRONG_CURRENT_STATE_RECORD_BINDING_RECOVERED_FURTHER_IDENTITY_LINEAGE_REQUIRED"){
 finish("BLOCKED","M419D4AV2_AV1_LINEAGE_REQUIRED_STATE_EXPECTED",{observed:av1.state},3);
}

const obs=JSON.parse(fs.readFileSync(auAuditPath,"utf8")).appendedObservation;
const invText=fs.readFileSync(inventoryPath,"utf8");
const inv=JSON.parse(invText);

function recordsOf(doc){
 if(Array.isArray(doc)) return doc;
 for(const k of ["records","properties","items","features","inventory","data"]){
  if(Array.isArray(doc?.[k])) return doc[k];
 }
 const arrays=Object.values(doc||{}).filter(Array.isArray);
 return arrays.length===1?arrays[0]:[];
}
const records=recordsOf(inv);
if(!records.length) finish("BLOCKED","M419D4AV2_INVENTORY_RECORDS_NOT_RECOVERED",{},3);

const cid=norm(obs.canonicalPropertyId), sid=norm(obs.sourcePropertyId), addr=norm(obs.address);
const exactSeeds=new Set([cid,sid,addr].filter(Boolean));
const discovered=new Map();
for(const s of exactSeeds) discovered.set(s,{value:s,origin:"CERTIFIED_OBSERVATION",depth:0});

const roots=[
 path.join(app,"evidence"),
 path.join(app,"public"),
 path.join(app,"src"),
 path.join(app,"server")
].filter(fs.existsSync);

const exts=new Set([".json",".jsonl",".js",".mjs",".ts",".tsx",".jsx",".csv",".tsv",".txt"]);
const files=[];
function collect(dir){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory()){
   if(["node_modules",".git","dist","build","coverage"].includes(e.name)) continue;
   collect(p);
  } else if(exts.has(path.extname(p).toLowerCase())){
   try{ if(fs.statSync(p).size<=8*1024*1024) files.push(p); }catch{}
  }
 }
}
for(const r of roots) collect(r);

const lineageHits=[];
for(let pass=0;pass<3;pass++){
 let additions=0;
 const known=[...discovered.keys()];
 for(const p of files){
  let text=""; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  const upper=text.toUpperCase();
  const matched=known.filter(x=>x.length>=6&&upper.includes(x)).slice(0,30);
  if(!matched.length) continue;

  const tokens=new Set();
  const regexes=[
   /\b(?:CPROP|PROPERTY|PROP|ASSET|BLDG|BUILDING|INV|BASE|NODE|ENTITY)-[A-Z0-9_-]{6,}\b/gi,
   /\b[A-F0-9]{16,64}\b/gi
  ];
  for(const re of regexes) for(const m of text.matchAll(re)) tokens.add(norm(m[0]));

  let obj=null; if(path.extname(p).toLowerCase()===".json"){try{obj=JSON.parse(text)}catch{}}
  if(obj){
   for(const e of flatten(obj)){
    if(typeof e.value==="string"||typeof e.value==="number"){
     const v=norm(e.value);
     if(/id|key|identity|property|asset|inventory|source/i.test(e.key)&&v.length>=6) tokens.add(v);
    }
   }
  }

  const newTokens=[];
  for(const t of tokens){
   if(!discovered.has(t) && t.length<=160){
    discovered.set(t,{value:t,origin:p,depth:pass+1,via:matched.slice(0,10)});
    newTokens.push(t); additions++;
   }
  }
  lineageHits.push({pass,file:p,matchedKnown:matched.slice(0,10),newTokenCount:newTokens.length,newTokens:newTokens.slice(0,30)});
 }
 if(additions===0) break;
}

const lineageValues=[...discovered.keys()];
const candidates=records.map((r,index)=>{
 const flat=flatten(r);
 let score=0; const evidence=[];
 for(const e of flat){
  if(typeof e.value!=="string"&&typeof e.value!=="number") continue;
  const v=norm(e.value); if(!v) continue;
  if(discovered.has(v)){
   const d=discovered.get(v);
   let pts=20;
   if(d.depth===0) pts=100;
   else if(d.depth===1) pts=60;
   else if(d.depth===2) pts=40;
   else pts=25;
   score+=pts;
   evidence.push({type:"LINEAGE_TOKEN_MATCH",path:e.path,value:e.value,depth:d.depth,origin:d.origin});
  }
 }
 return {index,score,evidence:evidence.slice(0,40),topLevelKeys:Object.keys(r).slice(0,50),
  availableSf: r.availableSf ?? r.availableSF ?? r.available_sf ?? null};
}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);

const top=candidates[0]??null, second=candidates[1]??null;
const unique=!!(top && top.score>=40 && (!second || top.score>second.score));

write(lineageAuditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AV2_CANONICAL_INVENTORY_IDENTITY_LINEAGE_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 certifiedIdentity:{canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address},
 filesScanned:files.length,
 lineageTokenCount:discovered.size,
 lineageHits:lineageHits.filter(x=>x.newTokenCount>0).slice(0,200),
 candidateCount:candidates.length,
 candidates:candidates.slice(0,30),
 uniqueStrongLineageCandidate:unique
});

if(!unique){
 write(candidateManifestPath,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV2_GOVERNED_INVENTORY_LINEAGE_CANDIDATE_MANIFEST",
  version:VERSION,generatedAt:new Date().toISOString(),
  uniqueCandidate:null,
  candidateCount:candidates.length,
  candidates:candidates.slice(0,20),
  executionAuthorized:false
 });
 finish("PASSED","M419D4AV2_CANONICAL_TO_INVENTORY_LINEAGE_NOT_UNIQUELY_RECOVERED_OPERATOR_OR_AUTHORITATIVE_MAPPING_REQUIRED",{
  forensics:{filesScanned:files.length,lineageTokenCount:discovered.size,candidateCount:candidates.length,topCandidates:candidates.slice(0,10)},
  artifacts:{lineageAudit:lineageAuditPath,candidateManifest:candidateManifestPath},
  nextMilestone:"M4.19D4AV3_OPERATOR_OR_AUTHORITATIVE_CANONICAL_TO_BASE_INVENTORY_MAPPING_GATE"
 });
}

const manifest={
 contract:"SCIIP_EXPLORER_4_M4_19D4AV2_GOVERNED_INVENTORY_LINEAGE_CANDIDATE_MANIFEST",
 version:VERSION,generatedAt:new Date().toISOString(),
 uniqueCandidate:{
  recordIndex:top.index,
  score:top.score,
  evidence:top.evidence,
  currentAvailableSf:top.availableSf
 },
 certifiedObservation:{
  observationId:obs.observationId,
  canonicalPropertyId:obs.canonicalPropertyId,
  sourcePropertyId:obs.sourcePropertyId,
  address:obs.address,
  proposedAvailableSf:obs.value
 },
 executionAuthorized:false
};
write(candidateManifestPath,manifest);

finish("PASSED","M419D4AV2_UNIQUE_CANONICAL_TO_GOVERNED_BASE_INVENTORY_LINEAGE_RECOVERED_AV_REPREAUTHORIZATION_READY",{
 forensics:{
  filesScanned:files.length,
  lineageTokenCount:discovered.size,
  matchedRecordIndex:top.index,
  lineageScore:top.score,
  bindingEvidence:top.evidence,
  currentAvailableSf:top.availableSf,
  proposedAvailableSf:obs.value
 },
 policy:{
  exactLineageEvidenceRequired:true,
  syntheticIdentityProhibited:true,
  proximityIdentityProhibited:true,
  currentStateMutationNotPerformed:true
 },
 artifacts:{lineageAudit:lineageAuditPath,candidateManifest:candidateManifestPath},
 nextMilestone:"M4.19D4AV3_CURRENT_STATE_PROMOTION_REPREAUTHORIZATION_USING_CERTIFIED_IDENTITY_LINEAGE"
});
