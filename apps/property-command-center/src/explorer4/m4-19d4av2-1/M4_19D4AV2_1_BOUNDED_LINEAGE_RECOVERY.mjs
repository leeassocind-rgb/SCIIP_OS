#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,norm,flatten,admissiblePath} from "./M419D4AV21Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const av1Path=path.join(ev,"m4-19d4av1-governed-base-inventory-record-identity-reconciliation.json");
const auAuditPath=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const resultPath=path.join(ev,"m4-19d4av2-1-bounded-canonical-to-inventory-identity-lineage-recovery.json");
const auditPath=path.join(ev,"m4-19d4av2-1-bounded-lineage-recovery-audit.json");
const manifestPath=path.join(ev,"m4-19d4av2-1-inventory-binding-candidate-manifest.json");

const MAX_FILES=1200;
const MAX_FILE_BYTES=3*1024*1024;
const MAX_NEW_TOKENS=250;
const MAX_SECONDARY_FILES=200;

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
  syntheticIdentityUsed:false,proximityIdentityUsed:false,automaticRetry:false
 }};
 write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
}

for(const p of [av1Path,auAuditPath,inventoryPath]){
 if(!fs.existsSync(p)) finish("BLOCKED","M419D4AV2_1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const av1=JSON.parse(fs.readFileSync(av1Path,"utf8"));
if(av1.state!=="M419D4AV1_NO_UNIQUE_STRONG_CURRENT_STATE_RECORD_BINDING_RECOVERED_FURTHER_IDENTITY_LINEAGE_REQUIRED"){
 finish("BLOCKED","M419D4AV2_1_AV1_LINEAGE_REQUIRED_STATE_EXPECTED",{observed:av1.state},3);
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
if(!records.length) finish("BLOCKED","M419D4AV2_1_INVENTORY_RECORDS_NOT_RECOVERED",{},3);

const seedValues=[
 obs.canonicalPropertyId,
 obs.sourcePropertyId,
 obs.address,
 "14117 BESSEMER ST",
 "14117-14123 BESSEMER ST"
].map(norm).filter(Boolean);

console.log(`[AV2.1] bounded scan starting; inventory records=${records.length}`);
console.log(`[AV2.1] exact seeds=${seedValues.length}; max files=${MAX_FILES}; max file bytes=${MAX_FILE_BYTES}`);

const roots=[
 ev,
 path.join(app,"public"),
 path.join(app,"src"),
 path.join(app,"server")
].filter(fs.existsSync);

const exts=new Set([".json",".jsonl",".js",".mjs",".ts",".tsx",".jsx",".csv",".tsv",".txt"]);
const files=[];
function collect(dir){
 if(files.length>=MAX_FILES) return;
 let ents=[]; try{ents=fs.readdirSync(dir,{withFileTypes:true})}catch{return}
 for(const e of ents){
  if(files.length>=MAX_FILES) break;
  const p=path.join(dir,e.name);
  if(e.isDirectory()){
   if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
   collect(p);
  } else {
   const ext=path.extname(p).toLowerCase();
   if(!exts.has(ext) || !admissiblePath(p)) continue;
   try{
    const sz=fs.statSync(p).size;
    if(sz<=MAX_FILE_BYTES) files.push(p);
   }catch{}
  }
 }
}
for(const r of roots) collect(r);
console.log(`[AV2.1] admissible files collected=${files.length}`);

const directHits=[];
const discovered=new Map();
for(const s of seedValues) discovered.set(s,{value:s,depth:0,origin:"CERTIFIED_OBSERVATION"});

for(let i=0;i<files.length;i++){
 const p=files[i];
 if(i>0 && i%100===0) console.log(`[AV2.1] direct pass ${i}/${files.length}`);
 let text=""; try{text=fs.readFileSync(p,"utf8")}catch{continue}
 const upper=text.toUpperCase();
 const matched=seedValues.filter(s=>s.length>=6&&upper.includes(s));
 if(!matched.length) continue;

 const tokens=new Set();
 for(const m of text.matchAll(/\b(?:CPROP|PROPERTY|PROP|ASSET|BLDG|BUILDING|INV|BASE|NODE|ENTITY)-[A-Z0-9_-]{6,}\b/gi)) tokens.add(norm(m[0]));
 let obj=null;
 if(path.extname(p).toLowerCase()===".json"){
  try{obj=JSON.parse(text)}catch{}
 }
 if(obj){
  for(const e of flatten(obj)){
   if(typeof e.value!=="string"&&typeof e.value!=="number") continue;
   const v=norm(e.value);
   if(v.length<6||v.length>160) continue;
   if(/id|key|identity|property|asset|inventory|source|record/i.test(e.key)) tokens.add(v);
  }
 }
 const added=[];
 for(const t of tokens){
  if(discovered.size>=seedValues.length+MAX_NEW_TOKENS) break;
  if(!discovered.has(t)){
   discovered.set(t,{value:t,depth:1,origin:p,via:matched});
   added.push(t);
  }
 }
 directHits.push({file:p,matchedSeeds:matched,newTokens:added.slice(0,40)});
}
console.log(`[AV2.1] direct-hit files=${directHits.length}; lineage tokens=${discovered.size}`);

const secondaryCandidates=files.filter(p=>!directHits.some(h=>h.file===p)).slice(0,MAX_SECONDARY_FILES);
const depth1=[...discovered.entries()].filter(([,d])=>d.depth===1).map(([k])=>k);
const secondaryHits=[];

for(let i=0;i<secondaryCandidates.length;i++){
 const p=secondaryCandidates[i];
 if(i>0 && i%50===0) console.log(`[AV2.1] bounded secondary pass ${i}/${secondaryCandidates.length}`);
 let text=""; try{text=fs.readFileSync(p,"utf8")}catch{continue}
 const upper=text.toUpperCase();
 const matched=depth1.filter(s=>s.length>=8&&upper.includes(s)).slice(0,20);
 if(!matched.length) continue;

 const tokens=new Set();
 for(const m of text.matchAll(/\b(?:CPROP|PROPERTY|PROP|ASSET|BLDG|BUILDING|INV|BASE|NODE|ENTITY)-[A-Z0-9_-]{6,}\b/gi)) tokens.add(norm(m[0]));
 const added=[];
 for(const t of tokens){
  if(discovered.size>=seedValues.length+MAX_NEW_TOKENS) break;
  if(!discovered.has(t)){
   discovered.set(t,{value:t,depth:2,origin:p,via:matched});
   added.push(t);
  }
 }
 secondaryHits.push({file:p,matchedDepth1:matched,newTokens:added.slice(0,30)});
}
console.log(`[AV2.1] secondary-hit files=${secondaryHits.length}; final lineage tokens=${discovered.size}`);

const candidates=records.map((r,index)=>{
 const flat=flatten(r);
 let score=0; const evidence=[];
 for(const e of flat){
  if(typeof e.value!=="string"&&typeof e.value!=="number") continue;
  const v=norm(e.value); if(!v||!discovered.has(v)) continue;
  const d=discovered.get(v);
  const pts=d.depth===0?100:d.depth===1?60:35;
  score+=pts;
  evidence.push({type:"BOUNDED_LINEAGE_TOKEN_MATCH",path:e.path,value:e.value,depth:d.depth,origin:d.origin});
 }
 return {
  index,score,evidence:evidence.slice(0,30),
  availableSf:r.availableSf??r.availableSF??r.available_sf??null,
  keys:Object.keys(r).slice(0,50)
 };
}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);

const top=candidates[0]??null, second=candidates[1]??null;
const unique=!!(top && top.score>=60 && (!second || top.score>second.score));

write(auditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AV2_1_BOUNDED_LINEAGE_RECOVERY_AUDIT",
 version:VERSION,generatedAt:new Date().toISOString(),
 bounds:{MAX_FILES,MAX_FILE_BYTES,MAX_NEW_TOKENS,MAX_SECONDARY_FILES},
 certifiedIdentity:{
  canonicalPropertyId:obs.canonicalPropertyId,
  sourcePropertyId:obs.sourcePropertyId,
  address:obs.address
 },
 inventoryRecordCount:records.length,
 admissibleFilesScanned:files.length,
 directHitFileCount:directHits.length,
 secondaryHitFileCount:secondaryHits.length,
 lineageTokenCount:discovered.size,
 directHits:directHits.slice(0,100),
 secondaryHits:secondaryHits.slice(0,100),
 candidateCount:candidates.length,
 candidates:candidates.slice(0,25),
 uniqueStrongCandidate:unique
});

if(!unique){
 write(manifestPath,{
  contract:"SCIIP_EXPLORER_4_M4_19D4AV2_1_INVENTORY_BINDING_CANDIDATE_MANIFEST",
  version:VERSION,generatedAt:new Date().toISOString(),
  uniqueCandidate:null,
  candidates:candidates.slice(0,20),
  executionAuthorized:false
 });
 finish("PASSED","M419D4AV2_1_BOUNDED_LINEAGE_RECOVERY_COMPLETE_NO_UNIQUE_INVENTORY_BINDING_OPERATOR_OR_AUTHORITATIVE_MAPPING_REQUIRED",{
  recovery:{
   inventoryRecordCount:records.length,
   admissibleFilesScanned:files.length,
   directHitFileCount:directHits.length,
   secondaryHitFileCount:secondaryHits.length,
   lineageTokenCount:discovered.size,
   candidateCount:candidates.length,
   topCandidates:candidates.slice(0,10)
  },
  policy:{
   repositoryWideRecursiveTokenExpansionProhibited:true,
   boundedExactLineageSearch:true,
   syntheticIdentityProhibited:true,
   proximityIdentityProhibited:true,
   currentStateMutationNotPerformed:true
  },
  artifacts:{boundedLineageAudit:auditPath,candidateManifest:manifestPath},
  nextMilestone:"M4.19D4AV3_OPERATOR_OR_AUTHORITATIVE_CANONICAL_TO_BASE_INVENTORY_MAPPING_GATE"
 });
}

const manifest={
 contract:"SCIIP_EXPLORER_4_M4_19D4AV2_1_INVENTORY_BINDING_CANDIDATE_MANIFEST",
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
write(manifestPath,manifest);

finish("PASSED","M419D4AV2_1_UNIQUE_CANONICAL_TO_GOVERNED_BASE_INVENTORY_LINEAGE_RECOVERED_AV_REPREAUTHORIZATION_READY",{
 recovery:{
  inventoryRecordCount:records.length,
  admissibleFilesScanned:files.length,
  directHitFileCount:directHits.length,
  secondaryHitFileCount:secondaryHits.length,
  lineageTokenCount:discovered.size,
  matchedRecordIndex:top.index,
  lineageScore:top.score,
  bindingEvidence:top.evidence,
  currentAvailableSf:top.availableSf,
  proposedAvailableSf:obs.value
 },
 policy:{
  repositoryWideRecursiveTokenExpansionProhibited:true,
  boundedExactLineageSearch:true,
  syntheticIdentityProhibited:true,
  proximityIdentityProhibited:true,
  currentStateMutationNotPerformed:true
 },
 artifacts:{boundedLineageAudit:auditPath,candidateManifest:manifestPath},
 nextMilestone:"M4.19D4AV3_CURRENT_STATE_PROMOTION_REPREAUTHORIZATION_USING_BOUNDED_CERTIFIED_IDENTITY_LINEAGE"
});
