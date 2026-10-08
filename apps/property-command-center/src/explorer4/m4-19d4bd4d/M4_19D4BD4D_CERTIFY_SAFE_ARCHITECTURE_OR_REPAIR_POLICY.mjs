#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4BD4CDRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const cPath=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-reconciliation.json");
const cAudit=path.join(ev,"m4-19d4bd4c-exact-three-delta-source-rewrite-audit.json");
const ayPath=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bd4d-safe-architecture-or-repair-policy-certification.json");
const manifest=path.join(ev,"m4-19d4bd4d-source-rewrite-safety-and-recovery-policy-manifest.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD4D_SAFE_IN_PLACE_ARCHITECTURE_OR_REPAIR_POLICY_CERTIFICATION",
 version:"4.0-m4.19d4bd4d",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,restorePerformed:false,materializerRerunPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [cPath,cAudit,ayPath,invPath])
 if(!fs.existsSync(p))done("BLOCKED","M419D4BD4D_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const c=JSON.parse(fs.readFileSync(cPath,"utf8"));
const ca=JSON.parse(fs.readFileSync(cAudit,"utf8"));
const ay=JSON.parse(fs.readFileSync(ayPath,"utf8"));
const text=fs.readFileSync(invPath,"utf8");
const {records}=recordsOf(JSON.parse(text));
const t=ay.insertionRecord;
const matches=records.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(t.canonicalPropertyId))||vals.includes(norm(t.address));
});
const r=matches[0]?.r;

const protectedChecks={
 recordCount841:records.length===841,
 targetCardinalityOne:matches.length===1,
 canonicalPropertyId:norm(r?.canonicalPropertyId)===norm(t.canonicalPropertyId),
 sourcePropertyId:norm(r?.sourcePropertyId)===norm(t.sourcePropertyId),
 address:norm(r?.address)===norm(t.address),
 latitude:Number(r?.latitude)===34.1810708,
 longitude:Number(r?.longitude)===-118.4408537,
 availableSf:Number(r?.availableSf)===4904
};
const protectedPassed=Object.values(protectedChecks).every(Boolean);
const safeProof=c.state==="M419D4BD4C_EXACT_THREE_DELTA_DETERMINISTIC_IN_PLACE_ENRICHMENT_PROVEN_BD4D_CERTIFICATION_READY" &&
 protectedPassed;

const policy={
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4D_SOURCE_REWRITE_SAFETY_AND_RECOVERY_POLICY_MANIFEST",
 version:"4.0-m4.19d4bd4d",generatedAt:new Date().toISOString(),
 currentInventoryPath:invPath,currentInventorySha256:sha(text),
 exactDeltaCount:ca.exactDeltaCount,classification:ca.classification,
 protectedChecks,protectedPassed,
 safeInPlaceArchitectureCertified:safeProof,
 restoreRequired:safeProof?false:null,
 restoreAuthorized:false,
 rerunAuthorized:false,
 recoveryBasis:safeProof
  ?"No restore: producer deterministically enriched only non-protected derived fields and Bessemer protected state is exact."
  :"Do not mutate automatically. Preserve current file and AZ backup; next milestone must decide exact restore/patch from the three certified deltas.",
 runtimeVisibilityPreauthorized:safeProof
};
write(manifest,policy);

if(safeProof){
 done("PASSED","M419D4BD4D_SAFE_DETERMINISTIC_IN_PLACE_MATERIALIZATION_ARCHITECTURE_CERTIFIED_RUNTIME_VISIBILITY_PREAUTHORIZED",{
  certification:{classification:ca.classification,recordCount:records.length,targetIndex:matches[0].i,
   canonicalPropertyId:r.canonicalPropertyId,address:r.address,latitude:r.latitude,longitude:r.longitude,
   availableSf:r.availableSf,exactDeltaCount:ca.exactDeltaCount,restoreRequired:false},
  policy:{priorSourceImmutabilityAssumptionWithdrawn:true,
   governedInventoryMayCarryDeterministicDerivedEnrichment:true,
   protectedIdentityCoordinateAvailabilityFieldsRemainImmutable:true,
   noBlindRestore:true,noAutomaticRerun:true},
  artifacts:{safetyAndRecoveryPolicy:manifest},
  nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
 });
}

done("PASSED","M419D4BD4D_SAFE_IN_PLACE_ARCHITECTURE_NOT_CERTIFIED_EXACT_REPAIR_POLICY_REQUIRED_NO_MUTATION_AUTHORIZED",{
 certification:{classification:ca.classification,protectedChecks},
 policy:{noBlindRestore:true,noAutomaticRerun:true,currentFilePreserved:true,azBackupPreserved:true},
 artifacts:{safetyAndRecoveryPolicy:manifest},
 nextMilestone:"M4.19D4BD4E_EXACT_THREE_DELTA_REPAIR_OR_RESTORE_PREAUTHORIZATION"
});
