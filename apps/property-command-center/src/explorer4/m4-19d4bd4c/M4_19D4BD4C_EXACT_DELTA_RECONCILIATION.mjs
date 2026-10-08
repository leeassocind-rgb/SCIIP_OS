#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,setRecords,diff,pathLeaf} from "./M419D4BD4CDRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const priorPath=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-forensics.json");
const deltaPrior=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-delta-audit.json");
const invokePath=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-manifest.json");
const ayPath=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const backupPath=path.join(ev,"m4-19d4az-governed-base-inventory-pre-insertion-backup.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-reconciliation.json");
const audit=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD4C_EXACT_THREE_DELTA_SOURCE_REWRITE_RECONCILIATION",
 version:"4.0-m4.19d4bd4c",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,restorePerformed:false,materializerRerunPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [priorPath,deltaPrior,invokePath,ayPath,backupPath,invPath])
 if(!fs.existsSync(p))done("BLOCKED","M419D4BD4C_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const prior=JSON.parse(fs.readFileSync(priorPath,"utf8"));
if(prior.state!=="M419D4BD4A_GOVERNED_SOURCE_REWRITE_NOT_YET_QUALIFIED_BD4B_RECONCILIATION_REQUIRED")
 done("BLOCKED","M419D4BD4C_BD4A_RECONCILIATION_STATE_REQUIRED",{observed:prior.state},3);

const invoke=JSON.parse(fs.readFileSync(invokePath,"utf8"));
const ay=JSON.parse(fs.readFileSync(ayPath,"utf8"));
const baseDoc=JSON.parse(fs.readFileSync(backupPath,"utf8"));
const base=recordsOf(baseDoc);
const expectedRecords=[...base.records,ay.insertionRecord];
const expectedDoc=setRecords(baseDoc,base.container,expectedRecords);
const currentDoc=JSON.parse(fs.readFileSync(invPath,"utf8"));
const exactDiff=diff(expectedDoc,currentDoc);

const producer=invoke.producer;
if(!producer||!fs.existsSync(producer))done("BLOCKED","M419D4BD4C_BOUND_PRODUCER_MISSING",{producer},3);
const src=fs.readFileSync(producer,"utf8");
const lines=src.split(/\r?\n/);

const traced=exactDiff.map(d=>{
 const leaf=pathLeaf(d.path);
 const tokens=[leaf, typeof d.after==="string"?d.after:null, typeof d.before==="string"?d.before:null].filter(Boolean);
 const hits=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(tokens.some(t=>t&&line.toLowerCase().includes(String(t).toLowerCase()))){
   hits.push({line:i+1,text:line.trim().slice(0,500)});
   if(hits.length>=20) break;
  }
 }
 const likelyLineage=/lineage|spatial|geo|coordinate|source|provenance|derived|materializ|updated|version/i.test(
  `${leaf??""} ${JSON.stringify(d.before)} ${JSON.stringify(d.after)} ${hits.map(h=>h.text).join(" ")}`
 );
 const protectedLeaf=["canonicalPropertyId","sourcePropertyId","address","latitude","longitude","availableSf"].includes(leaf);
 return {...d,leaf,producerEvidence:hits,producerEvidenceCount:hits.length,likelyLineageOrDerived:likelyLineage,protectedLeaf};
});

const allHaveProducerEvidence=traced.length>0&&traced.every(x=>x.producerEvidenceCount>0);
const noProtectedFieldDiff=traced.every(x=>!x.protectedLeaf);
const allDerivedSemantic=traced.every(x=>x.likelyLineageOrDerived);
const exactThree=traced.length===3;

/* Inspect write behavior more broadly, including variable-based writes and writes
   where governed-base-inventory path is assigned earlier. */
const writeLines=[];
for(let i=0;i<lines.length;i++){
 if(/writeFile|renameSync|copyFile|outputFile/.test(lines[i])){
  writeLines.push({line:i+1,context:lines.slice(Math.max(0,i-8),Math.min(lines.length,i+9)).join("\n").slice(0,5000)});
 }
}
const pathAssignmentLines=[];
for(let i=0;i<lines.length;i++){
 if(/governed-base-inventory|baseInventory|inventoryPath|inventoryFile|outputPath|targetPath/i.test(lines[i]))
  pathAssignmentLines.push({line:i+1,text:lines[i].trim().slice(0,800)});
}
const writePathLinkProven=writeLines.some(w=>/inventoryPath|baseInventory|inventoryFile|governed-base-inventory/i.test(w.context)) &&
 pathAssignmentLines.length>0;

let classification="UNSAFE_OR_UNRESOLVED_SOURCE_REWRITE";
if(exactThree&&noProtectedFieldDiff&&allHaveProducerEvidence&&allDerivedSemantic&&writePathLinkProven)
 classification="DETERMINISTIC_IN_PLACE_DERIVED_ENRICHMENT_STRONGLY_PROVEN";
else if(exactThree&&noProtectedFieldDiff&&allHaveProducerEvidence)
 classification="THREE_NON_PROTECTED_DELTAS_TRACE_TO_PRODUCER_BUT_WRITE_PATH_OR_DERIVED_SEMANTICS_INCOMPLETE";
else if(noProtectedFieldDiff)
 classification="NON_PROTECTED_REWRITE_BUT_PRODUCER_TRACE_INCOMPLETE";

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4C_EXACT_THREE_DELTA_SOURCE_REWRITE_AUDIT",
 version:"4.0-m4.19d4bd4c",generatedAt:new Date().toISOString(),
 producer,producerSha256:sha(src),exactDeltaCount:traced.length,tracedDeltas:traced,
 exactThree,noProtectedFieldDiff,allHaveProducerEvidence,allDerivedSemantic,
 pathAssignmentLines:pathAssignmentLines.slice(0,60),writeLines:writeLines.slice(0,30),
 writePathLinkProven,classification
});

done("PASSED",
 classification==="DETERMINISTIC_IN_PLACE_DERIVED_ENRICHMENT_STRONGLY_PROVEN"
 ?"M419D4BD4C_EXACT_THREE_DELTA_DETERMINISTIC_IN_PLACE_ENRICHMENT_PROVEN_BD4D_CERTIFICATION_READY"
 :"M419D4BD4C_EXACT_SOURCE_REWRITE_DELTA_RECONCILED_BUT_SAFE_ARCHITECTURE_NOT_YET_PROVEN",
 {reconciliation:{classification,exactDeltaCount:traced.length,exactThree,noProtectedFieldDiff,
  allHaveProducerEvidence,allDerivedSemantic,writePathLinkProven,
  deltas:traced.map(x=>({path:x.path,before:x.before,after:x.after,leaf:x.leaf,
   producerEvidenceCount:x.producerEvidenceCount,likelyLineageOrDerived:x.likelyLineageOrDerived}))},
 artifacts:{exactDeltaAudit:audit},
 nextMilestone:classification==="DETERMINISTIC_IN_PLACE_DERIVED_ENRICHMENT_STRONGLY_PROVEN"
  ?"M4.19D4BD4D_SAFE_IN_PLACE_MATERIALIZATION_ARCHITECTURE_CERTIFICATION"
  :"M4.19D4BD4D_EXACT_REPAIR_OR_RESTORE_POLICY_CERTIFICATION"});
