#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const bj4bPath=path.join(ev,"m4-19d4bj4b-controlled-five-property-canonical-identity-creation-reexecution-preauthorization.json");
const a2Path=path.join(ev,"m4-19d4bj4a2-canonical-creation-event-store-lineage-reconciliation.json");
const out=path.join(ev,"m4-19d4bj4b1-physical-canonical-creation-event-store-binding-reconciliation.json");

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const isEvidence=p=>path.resolve(p).startsWith(path.resolve(ev)+path.sep);
const inside=(p,base)=>path.resolve(p).startsWith(path.resolve(base)+path.sep);

for(const p of [bj4bPath,a2Path]) if(!fs.existsSync(p)) throw new Error("required evidence missing: "+p);
const B=read(bj4bPath), A2=read(a2Path);
if(B.state!=="M419D4BJ4B_PHYSICAL_CANONICAL_EVENT_STORE_NOT_YET_BOUND_BJ4B1_TARGETED_RECONCILIATION_REQUIRED")
 throw new Error("BJ4B state mismatch: "+B.state);

console.log("[BJ4B1] BJ4B targeted reconciliation state accepted");
console.log("[BJ4B1] tracing physical event persistence from original executable/runtime sources only");
console.log("[BJ4B1] evidence artifacts are lineage clues only; writes remain OFF");

const roots=[
 path.join(app,"src/runtime"),
 path.join(app,"src/broker-product/property-explorer/intelligence"),
 path.join(app,"server"),
 path.join(app,"tools")
].filter(fs.existsSync);

function walk(d,out=[]){
 for(const ent of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,ent.name);
  if(ent.isDirectory()){
   if(["node_modules","dist","build",".git","explorer4"].includes(ent.name)) continue;
   walk(p,out);
  } else if(/\.(?:js|mjs|cjs|jsx|ts|tsx)$/.test(ent.name)) out.push(p);
 }
 return out;
}
const files=roots.flatMap(r=>walk(r,[]));
const patterns=[
 /CANONICAL_IDENTITY_CREATED/g,
 /canonical.*event.*store/ig,
 /event.*store/ig,
 /append.*event/ig,
 /write.*event/ig,
 /event.*path/ig,
 /identity-decision-execution-data/ig,
 /canonical-property-identity-data/ig
];
const sourceHits=[];
for(const f of files){
 let t; try{t=fs.readFileSync(f,"utf8")}catch{continue}
 let score=0, signals={};
 for(const re0 of patterns){
  const re=new RegExp(re0.source,re0.flags);
  const n=(t.match(re)||[]).length;
  if(n){score+=n; signals[re0.source]=n}
 }
 if(score) sourceHits.push({path:f,score,signals});
}
sourceHits.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const pathRx=/["'`](\/[^"'`\n]+?\.(?:jsonl|json))["'`]/g;
const relativeRx=/["'`]([^"'`\n]*(?:event|identity)[^"'`\n]*\.(?:jsonl|json))["'`]/ig;
const candidates=new Map();

function addCandidate(p,origin,kind){
 if(!p) return;
 let q=p;
 if(!path.isAbsolute(q)){
   const bases=[app,path.join(app,"src"),path.join(app,"public"),repo];
   q=bases.map(b=>path.resolve(b,q)).find(fs.existsSync)||path.resolve(app,q);
 }
 if(!fs.existsSync(q) || isEvidence(q)) return;
 let st; try{st=fs.statSync(q)}catch{return}
 if(!st.isFile()) return;
 let text=""; try{text=fs.readFileSync(q,"utf8")}catch{return}
 const x=candidates.get(q)||{
  path:q,origins:[],bytes:st.size,sha256:sha(q),
  identityCreatedCount:0,eventTypeCount:0,canonicalPropertyIdCount:0,
  idempotencyCount:0,creationSemanticCount:0
 };
 x.origins.push({origin,kind});
 x.identityCreatedCount=(text.match(/CANONICAL_IDENTITY_CREATED/g)||[]).length;
 x.eventTypeCount=(text.match(/"(?:eventType|event|type)"\s*:/g)||[]).length;
 x.canonicalPropertyIdCount=(text.match(/"canonicalPropertyId"\s*:/g)||[]).length;
 x.idempotencyCount=(text.match(/idempotency/ig)||[]).length;
 x.creationSemanticCount=(text.match(/(?:CREATED|CREATE|creation|createdAt)/g)||[]).length;
 candidates.set(q,x);
}

// Preserve BJ4B candidate universe, but add executable-source references.
for(const x of B.adjudication?.physicalEventCandidates||[]) addCandidate(x.path,"BJ4B","prior_candidate");

for(const h of sourceHits.slice(0,80)){
 let t=fs.readFileSync(h.path,"utf8"), m;
 pathRx.lastIndex=0;
 while((m=pathRx.exec(t))) addCandidate(m[1],h.path,"absolute_source_reference");
 relativeRx.lastIndex=0;
 while((m=relativeRx.exec(t))) addCandidate(m[1],h.path,"relative_source_reference");
}

// Search likely production-validation files by filename only, not arbitrary evidence.
for(const base of [path.join(app,"src/production-validation"),path.join(app,"public/production-validation-data")]){
 if(!fs.existsSync(base)) continue;
 for(const ent of fs.readdirSync(base)){
  if(/\.(json|jsonl)$/i.test(ent) && /(event|identity|canonical|execution|history|commit)/i.test(ent))
    addCandidate(path.join(base,ent),base,"bounded_production_validation_inventory");
 }
}

const inspected=[...candidates.values()];
for(const x of inspected){
 const originalSourceRefs=x.origins.filter(o=>!o.origin.includes("/evidence/") && o.kind.includes("source_reference")).length;
 x.originalExecutableReferenceCount=originalSourceRefs;
 x.score=
   (x.identityCreatedCount>0?50:0)+
   Math.min(x.creationSemanticCount,20)*2+
   (x.eventTypeCount>0?10:0)+
   (x.canonicalPropertyIdCount>0?5:0)+
   (x.idempotencyCount>0?3:0)+
   originalSourceRefs*20+
   (/event/i.test(path.basename(x.path))?8:0)-
   (/canonical-property-identity-data/i.test(path.basename(x.path))?8:0);
}
inspected.sort((a,b)=>b.score-a.score||b.originalExecutableReferenceCount-a.originalExecutableReferenceCount||a.path.localeCompare(b.path));

const top=inspected[0]||null, second=inspected[1]||null;
const uniquelyProven=!!top &&
  top.originalExecutableReferenceCount>0 &&
  (top.identityCreatedCount>0 || /event/i.test(path.basename(top.path))) &&
  (!second || top.score>=second.score+15 || top.path===second.path);

const canonicalStore=B.adjudication?.authoritativeCanonicalStore||null;
const mirror=B.adjudication?.runtimeMirror||null;

if(uniquelyProven){
 const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B1_PHYSICAL_CANONICAL_CREATION_EVENT_STORE_BINDING_RECONCILIATION",
  version:"4.0-m4.19d4bj4b1",status:"PASSED",
  state:"M419D4BJ4B1_PHYSICAL_CANONICAL_CREATION_EVENT_STORE_UNIQUELY_BOUND_BJ4B2_FINAL_REPREAUTHORIZATION_READY",
  certifiedAt:new Date().toISOString(),
  binding:{
   authoritativeCanonicalStore:canonicalStore,
   runtimeMirror:mirror,
   physicalCanonicalCreationEventStore:top.path,
   physicalEventStoreSha256:top.sha256,
   evidenceArtifact:false,
   confidence:"HIGH",
   proof:top
  },
  sourceForensics:{rootsScanned:roots,candidateSourceFiles:files.length,topExecutableHits:sourceHits.slice(0,20),inspectedPhysicalCandidates:inspected.slice(0,20)},
  cohort:{size:B.cohort?.size,cohortHash:B.cohort?.cohortHash,frozenHashMatches:B.cohort?.frozenHashMatches},
  policy:{noProductionWrite:true,noAutomaticRetry:true,separateBJ4B2RepreauthorizationRequired:true},
  nextMilestone:"M4.19D4BJ4B2_FINAL_FIVE_PROPERTY_REEXECUTION_REPREAUTHORIZATION",
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,automaticRetry:false}
 };
 fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
 console.log(JSON.stringify(result,null,2));
 process.exit(0);
}

// If no pre-existing physical store can be proven, adjudicate the real capability gap rather than guessing.
const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ4B1_PHYSICAL_CANONICAL_CREATION_EVENT_STORE_BINDING_RECONCILIATION",
 version:"4.0-m4.19d4bj4b1",status:"PASSED",
 state:"M419D4BJ4B1_NO_PREEXISTING_PHYSICAL_CANONICAL_CREATION_EVENT_STORE_UNIQUELY_PROVEN_CONTROLLED_EVENT_STORE_ADAPTER_DESIGN_PREAUTHORIZATION_REQUIRED",
 certifiedAt:new Date().toISOString(),
 adjudication:{
  authoritativeCanonicalStore:canonicalStore,
  runtimeMirror:mirror,
  preexistingPhysicalCreationEventStoreProven:false,
  reason:"Bounded original executable-source tracing did not uniquely prove a physical production persistence target for CANONICAL_IDENTITY_CREATED events. Candidate data files are not promoted to write authority by content similarity alone.",
  topCandidates:inspected.slice(0,20)
 },
 sourceForensics:{rootsScanned:roots,candidateSourceFiles:files.length,topExecutableHits:sourceHits.slice(0,20)},
 cohort:{size:B.cohort?.size,cohortHash:B.cohort?.cohortHash,frozenHashMatches:B.cohort?.frozenHashMatches},
 policy:{
  evidenceArtifactCannotBePhysicalStore:true,
  contentSimilarityCannotCreateWriteAuthority:true,
  existingCanonicalStoreMustRemainUntouched:true,
  noProductionWrite:true,noAutomaticRetry:true,
  controlledImplementationRequiresSeparatePreauthorization:true
 },
 nextMilestone:"M4.19D4BJ4B1A_GOVERNED_CANONICAL_CREATION_EVENT_STORE_ADAPTER_DESIGN_AND_PREAUTHORIZATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,automaticRetry:false}
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
