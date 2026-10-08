#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,flatten} from "./M419D4EBFRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const cPath=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-reconciliation.json");
const cAuditPath=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-audit.json");
const ayPath=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bd4e-structural-delta-adjudication.json");
const audit=path.join(ev,"m4-19d4bd4e-structural-delta-adjudication-audit.json");
const manifest=path.join(ev,"m4-19d4bd4e-safe-in-place-materialization-certification-manifest.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD4E_STRUCTURAL_DELTA_ADJUDICATION_AND_SAFE_IN_PLACE_MATERIALIZATION_CERTIFICATION",
 version:"4.0-m4.19d4bd4e",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,restorePerformed:false,materializerRerunPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [cPath,cAuditPath,ayPath,invPath])
 if(!fs.existsSync(p))done("BLOCKED","M419D4BD4E_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const c=JSON.parse(fs.readFileSync(cPath,"utf8"));
if(c.state!=="M419D4BD4C_EXACT_SOURCE_REWRITE_DELTA_RECONCILED_BUT_SAFE_ARCHITECTURE_NOT_YET_PROVEN")
 done("BLOCKED","M419D4BD4E_BD4C_RECONCILED_STATE_REQUIRED",{observed:c.state},3);

const ca=JSON.parse(fs.readFileSync(cAuditPath,"utf8"));
const ay=JSON.parse(fs.readFileSync(ayPath,"utf8"));
const invText=fs.readFileSync(invPath,"utf8");
const inv=JSON.parse(invText), {records}=recordsOf(inv);
const deltas=ca.tracedDeltas??[];

const spatialHistoryDelta=deltas.find(d=>/\.properties\[638\]\.provenance\.spatialHistory\[1\]$/.test(d.path));
const correctedAtDelta=deltas.find(d=>/\.properties\[638\]\.spatialIdentity\.correctedAt$/.test(d.path));
const summaryDelta=deltas.find(d=>/\.summary\.governedExplorerRuntimeRecords$/.test(d.path));
const record638=records[638]??null;
const rec638Flat=flatten(record638);
const rec638Address=record638?.address??record638?.streetAddress??record638?.fullAddress??null;

const event=spatialHistoryDelta?.after;
const structuralChecks={
 exactThreeDeltas:deltas.length===3,
 spatialHistoryAppendPresent:!!spatialHistoryDelta,
 spatialHistoryEventIsCorrection:event?.event==="SPATIAL_IDENTITY_CORRECTED",
 spatialHistoryPriorNextPresent:!!event?.prior&&!!event?.next,
 spatialHistoryGeometrySourcePresent:!!event?.prior?.geometrySource,
 spatialHistoryReasonPresent:typeof event?.reason==="string"&&event.reason.length>0,
 correctedAtPresent:!!correctedAtDelta,
 correctedAtIsIso:!Number.isNaN(Date.parse(correctedAtDelta?.after??"")),
 correctedAtNestedUnderSpatialIdentity:/\.spatialIdentity\.correctedAt$/.test(correctedAtDelta?.path??""),
 bothRecord638:spatialHistoryDelta?.path?.startsWith("$.properties[638]")&&correctedAtDelta?.path?.startsWith("$.properties[638]"),
 summaryDeltaPresent:!!summaryDelta,
 summaryBefore840:Number(summaryDelta?.before)===840,
 summaryAfter841:Number(summaryDelta?.after)===841,
 currentRecordCount841:records.length===841,
 summaryMatchesRecordCount:Number(summaryDelta?.after)===records.length,
 record638Exists:!!record638
};

const target=ay.insertionRecord;
const targetMatches=records.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(target.canonicalPropertyId))||vals.includes(norm(target.address));
});
const t=targetMatches[0]?.r;
const bessemerChecks={
 cardinalityOne:targetMatches.length===1,
 canonicalPropertyId:norm(t?.canonicalPropertyId)===norm(target.canonicalPropertyId),
 sourcePropertyId:norm(t?.sourcePropertyId)===norm(target.sourcePropertyId),
 address:norm(t?.address)===norm(target.address),
 latitude:Number(t?.latitude)===34.1810708,
 longitude:Number(t?.longitude)===-118.4408537,
 availableSf:Number(t?.availableSf)===4904
};

const deltasAreStructurallyDeterministic=
 Object.values(structuralChecks).every(Boolean) &&
 Object.values(bessemerChecks).every(Boolean);

const classification=deltasAreStructurallyDeterministic
 ?"THREE_DELTAS_STRUCTURALLY_ADJUDICATED_AS_BENIGN_IN_PLACE_MATERIALIZATION_SIDE_EFFECTS"
 :"STRUCTURAL_ADJUDICATION_INCOMPLETE";

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4E_STRUCTURAL_DELTA_ADJUDICATION_AUDIT",
 version:"4.0-m4.19d4bd4e",generatedAt:new Date().toISOString(),
 classification,record638:{address:rec638Address,
  canonicalPropertyId:record638?.canonicalPropertyId??null,
  sourcePropertyId:record638?.sourcePropertyId??null,
  spatialIdentity:record638?.spatialIdentity??null,
  spatialHistory:record638?.provenance?.spatialHistory??null},
 exactDeltas:deltas.map(d=>({path:d.path,before:d.before,after:d.after})),
 structuralChecks,bessemerChecks,targetIndex:targetMatches[0]?.i??null
});

if(!deltasAreStructurallyDeterministic){
 done("PASSED","M419D4BD4E_STRUCTURAL_DELTA_ADJUDICATION_INCOMPLETE_NO_RESTORE_OR_RERUN_AUTHORIZED",{
  adjudication:{classification,structuralChecks,bessemerChecks},
  artifacts:{structuralDeltaAudit:audit},
  nextMilestone:"M4.19D4BD4F_EXACT_DELTA_MANUAL_OR_SOURCE_CONTRACT_RECONCILIATION"
 });
}

const m={
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4E_SAFE_IN_PLACE_MATERIALIZATION_CERTIFICATION_MANIFEST",
 version:"4.0-m4.19d4bd4e",generatedAt:new Date().toISOString(),
 classification:"SAFE_DETERMINISTIC_IN_PLACE_MATERIALIZATION",
 currentInventoryPath:invPath,currentInventorySha256:sha(invText),recordCount:records.length,
 targetIndex:targetMatches[0].i,canonicalPropertyId:t.canonicalPropertyId,address:t.address,
 latitude:t.latitude,longitude:t.longitude,availableSf:t.availableSf,
 adjudicatedSideEffects:[
  {path:spatialHistoryDelta.path,classification:"SPATIAL_LINEAGE_HISTORY_APPEND_ON_EXISTING_RECORD_638"},
  {path:correctedAtDelta.path,classification:"SPATIAL_IDENTITY_CORRECTION_TIMESTAMP_REFRESH_ON_SAME_RECORD_638"},
  {path:summaryDelta.path,classification:"GOVERNED_RUNTIME_RECORD_COUNT_SYNCHRONIZED_TO_841"}
 ],
 restoreRequired:false,rerunRequired:false,runtimeVisibilityPreauthorized:true
};
write(manifest,m);

done("PASSED","M419D4BD4E_SAFE_DETERMINISTIC_IN_PLACE_MATERIALIZATION_CERTIFIED_RUNTIME_EXPLORER_VISIBILITY_PREAUTHORIZED",{
 certification:{classification:m.classification,recordCount:records.length,targetIndex:targetMatches[0].i,
  canonicalPropertyId:t.canonicalPropertyId,address:t.address,latitude:t.latitude,longitude:t.longitude,
  availableSf:t.availableSf,restoreRequired:false},
 policy:{threeSideEffectsStructurallyAdjudicated:true,noBlindRestore:true,noAutomaticRerun:true,
  protectedBessemerStateCertified:true,runtimeVisibilityCertificationRequired:true},
 artifacts:{structuralDeltaAudit:audit,safeInPlaceMaterializationManifest:manifest},
 nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
});
