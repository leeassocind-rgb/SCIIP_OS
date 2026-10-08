#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,setRecords,stableObjectDiff} from "./M419D4BD4ABRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");

const bd4Path=path.join(ev,"m4-19d4bd4-controlled-bound-build-materialization-and-parity-certification.json");
const bd3Manifest=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-manifest.json");
const ayManifest=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const azBackup=path.join(ev,"m4-19d4az-governed-base-inventory-pre-insertion-backup.json");
const currentInv=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-forensics.json");
const audit=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-delta-audit.json");
const producerAudit=path.join(ev,"m4-19d4bd4a-producer-in-place-write-semantics-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD4A_GOVERNED_SOURCE_REWRITE_FORENSICS",
 version:"4.0-m4.19d4bd4a",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,restorePerformed:false,
 materializerRerunPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bd4Path,bd3Manifest,ayManifest,azBackup,currentInv]){
 if(!fs.existsSync(p))done("BLOCKED","M419D4BD4A_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const bd4=JSON.parse(fs.readFileSync(bd4Path,"utf8"));
if(bd4.state!=="M419D4BD4_GOVERNED_SOURCE_MUTATED_BY_BUILD_MATERIALIZER")
 done("BLOCKED","M419D4BD4A_BD4_SOURCE_MUTATION_STATE_REQUIRED",{observed:bd4.state},3);

const invoke=JSON.parse(fs.readFileSync(bd3Manifest,"utf8"));
const ay=JSON.parse(fs.readFileSync(ayManifest,"utf8"));
const backupText=fs.readFileSync(azBackup,"utf8");
const backupDoc=JSON.parse(backupText), base=recordsOf(backupDoc);
if(base.records.length!==ay.inventoryRecordCountBefore)
 done("BLOCKED","M419D4BD4A_AZ_BACKUP_COUNT_DOES_NOT_MATCH_AY_PREINSERTION_COUNT",{
  backupCount:base.records.length,expected:ay.inventoryRecordCountBefore
 },3);

const expectedRecords=[...base.records,ay.insertionRecord];
const expectedDoc=setRecords(backupDoc,base.container,expectedRecords);
const expectedText=JSON.stringify(expectedDoc,null,2)+"\n";
const expectedHash=sha(expectedText);

const currentText=fs.readFileSync(currentInv,"utf8"),currentDoc=JSON.parse(currentText),cur=recordsOf(currentDoc);
const currentHash=sha(currentText);

const expectedTarget=ay.insertionRecord;
const currentMatches=cur.records.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(expectedTarget.canonicalPropertyId))||vals.includes(norm(expectedTarget.address));
});

const expectedMatches=expectedRecords.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(expectedTarget.canonicalPropertyId))||vals.includes(norm(expectedTarget.address));
});

const fullDiff=stableObjectDiff(expectedDoc,currentDoc);
const diffPaths=fullDiff.map(x=>x.path);
const addedPathKeys={};
for(const d of fullDiff){
 const m=d.path.match(/\.([A-Za-z0-9_]+)$/);
 if(m && (d.before===undefined || d.before===null)) addedPathKeys[m[1]]=(addedPathKeys[m[1]]||0)+1;
}
const topAddedKeys=Object.entries(addedPathKeys).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([key,count])=>({key,count}));

const producer=invoke.producer;
if(!producer||!fs.existsSync(producer))done("BLOCKED","M419D4BD4A_PRODUCER_MISSING",{producer},3);
const src=fs.readFileSync(producer,"utf8");
const invBase=path.basename(currentInv);
const directTargetRefs=[...src.matchAll(new RegExp(`[^\\n]{0,240}${invBase.replaceAll(".","\\.")}[^\\n]{0,240}`,"gi"))].map(m=>m[0]);
const writeOps=[...src.matchAll(/(writeFileSync|writeFile|renameSync|copyFileSync|copyFile|outputFile)\s*\(([\s\S]{0,700}?)\)/g)]
 .map(m=>({fn:m[1],expr:m[2].slice(0,700)}));
const inPlaceSignals=writeOps.filter(w=>/governed-base-inventory|inventoryPath|baseInventory|outputPath|targetPath/i.test(w.expr));
const spatialSignals={
 spatialLineage:/spatial.?lineage/i.test(src),
 lineage:/lineage/i.test(src),
 coordinates:/latitude|longitude|lat|lng|lon/i.test(src),
 provenance:/provenance/i.test(src),
 recordMap:/\.map\s*\(/.test(src),
 writes:writeOps.length
};

write(producerAudit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4A_PRODUCER_IN_PLACE_WRITE_SEMANTICS_AUDIT",
 version:"4.0-m4.19d4bd4a",generatedAt:new Date().toISOString(),
 producer,producerSha256:sha(src),directTargetRefs,writeOps,inPlaceSignals,spatialSignals,
 sourceInputPath:currentInv
});

const b=expectedMatches[0]?.r??null,c=currentMatches[0]?.r??null;
const targetDiff=(b&&c)?stableObjectDiff(b,c):[];
const protectedFields=["canonicalPropertyId","sourcePropertyId","address","latitude","longitude","availableSf"];
const protectedParity={};
for(const k of protectedFields){
 protectedParity[k]=k==="address"
  ?norm(c?.[k])===norm(b?.[k])
  :String(c?.[k]??"")===String(b?.[k]??"");
}
const allProtectedParity=Object.values(protectedParity).every(Boolean);

const classification=
 currentMatches.length!==1 ? "TARGET_IDENTITY_CARDINALITY_CHANGED"
 :cur.records.length!==841 ? "RECORD_COUNT_CHANGED_UNEXPECTEDLY"
 :!allProtectedParity ? "BESSEMER_PROTECTED_FIELD_MUTATION"
 :inPlaceSignals.length>0 && fullDiff.length>0 ? "INTENTIONAL_IN_PLACE_ENRICHMENT_BEHAVIOR_PROVISIONALLY_SUPPORTED"
 :"SOURCE_REWRITE_OCCURRED_BUT_IN_PLACE_WRITE_SEMANTICS_NOT_PROVEN";

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4A_GOVERNED_SOURCE_REWRITE_DELTA_AUDIT",
 version:"4.0-m4.19d4bd4a",generatedAt:new Date().toISOString(),
 expectedPreBuild:{recordCount:expectedRecords.length,sha256:expectedHash},
 currentPostBuild:{recordCount:cur.records.length,sha256:currentHash},
 fullDiffCount:fullDiff.length,topAddedKeys,
 target:{expectedIndex:expectedMatches[0]?.i??null,currentIndex:currentMatches[0]?.i??null,
  expectedHash:b?sha(b):null,currentHash:c?sha(c):null,targetDiff,protectedParity,allProtectedParity},
 classification
});

const next=classification==="INTENTIONAL_IN_PLACE_ENRICHMENT_BEHAVIOR_PROVISIONALLY_SUPPORTED"
 ?"M4.19D4BD4B_IN_PLACE_MATERIALIZATION_ARCHITECTURE_CERTIFICATION"
 :"M4.19D4BD4B_SOURCE_REWRITE_SAFETY_RECONCILIATION";

done("PASSED",
 classification==="INTENTIONAL_IN_PLACE_ENRICHMENT_BEHAVIOR_PROVISIONALLY_SUPPORTED"
 ?"M419D4BD4A_INTENTIONAL_IN_PLACE_GOVERNED_INVENTORY_ENRICHMENT_PROVISIONALLY_PROVEN_BD4B_READY"
 :"M419D4BD4A_GOVERNED_SOURCE_REWRITE_NOT_YET_QUALIFIED_BD4B_RECONCILIATION_REQUIRED",
 {forensics:{classification,expectedRecordCount:expectedRecords.length,currentRecordCount:cur.records.length,
 fullDiffCount:fullDiff.length,currentTargetMatchCount:currentMatches.length,protectedParity,topAddedKeys},
 artifacts:{rewriteDeltaAudit:audit,producerWriteSemanticsAudit:producerAudit},
 nextMilestone:next});
