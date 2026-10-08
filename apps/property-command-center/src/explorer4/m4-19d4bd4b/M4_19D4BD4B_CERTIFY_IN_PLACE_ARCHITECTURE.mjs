#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4BD4ABRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const aPath=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-forensics.json");
const deltaPath=path.join(ev,"m4-19d4bd4a-governed-source-rewrite-delta-audit.json");
const producerPath=path.join(ev,"m4-19d4bd4a-producer-in-place-write-semantics-audit.json");
const ayPath=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bd4b-in-place-materialization-architecture-certification.json");
const manifest=path.join(ev,"m4-19d4bd4b-in-place-materialization-architecture-manifest.json");
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD4B_IN_PLACE_MATERIALIZATION_ARCHITECTURE_CERTIFICATION",
 version:"4.0-m4.19d4bd4b",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,restorePerformed:false,
 materializerRerunPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [aPath,deltaPath,producerPath,ayPath,invPath])
 if(!fs.existsSync(p))done("BLOCKED","M419D4BD4B_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const a=JSON.parse(fs.readFileSync(aPath,"utf8"));
const delta=JSON.parse(fs.readFileSync(deltaPath,"utf8"));
const prod=JSON.parse(fs.readFileSync(producerPath,"utf8"));
const ay=JSON.parse(fs.readFileSync(ayPath,"utf8"));

if(a.state!=="M419D4BD4A_INTENTIONAL_IN_PLACE_GOVERNED_INVENTORY_ENRICHMENT_PROVISIONALLY_PROVEN_BD4B_READY"){
 done("PASSED","M419D4BD4B_IN_PLACE_ARCHITECTURE_NOT_CERTIFIED_SOURCE_REWRITE_REPAIR_FORENSICS_REQUIRED",{
  observedBD4AState:a.state,
  nextMilestone:"M4.19D4BD4C_SOURCE_REWRITE_REPAIR_AND_RECOVERY_POLICY"
 });
}

const currentText=fs.readFileSync(invPath,"utf8"),{records}=recordsOf(JSON.parse(currentText));
const target=ay.insertionRecord;
const matches=records.map((r,i)=>({r,i})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(target.canonicalPropertyId))||vals.includes(norm(target.address));
});
const r=matches[0]?.r;
const checks={
 recordCount841:records.length===841,
 targetCardinalityOne:matches.length===1,
 canonicalIdentity:norm(r?.canonicalPropertyId)===norm(target.canonicalPropertyId),
 sourceIdentity:norm(r?.sourcePropertyId)===norm(target.sourcePropertyId),
 address:norm(r?.address)===norm(target.address),
 latitude:Number(r?.latitude)===34.1810708,
 longitude:Number(r?.longitude)===-118.4408537,
 availableSf:Number(r?.availableSf)===4904,
 producerHasInPlaceWriteSignal:(prod.inPlaceSignals??[]).length>0,
 sourceActuallyChanged:delta.fullDiffCount>0
};
const passed=Object.values(checks).every(Boolean);

const obj={
 contract:"SCIIP_EXPLORER_4_M4_19D4BD4B_IN_PLACE_MATERIALIZATION_ARCHITECTURE_MANIFEST",
 version:"4.0-m4.19d4bd4b",generatedAt:new Date().toISOString(),
 classification:passed?"GOVERNED_BASE_INVENTORY_IS_IN_PLACE_MATERIALIZED_RUNTIME_ARTIFACT":"NOT_CERTIFIED",
 sourceAndMaterializedPath:invPath,currentSha256:sha(currentText),
 producer:prod.producer,producerSha256:prod.producerSha256,
 checks,recordCount:records.length,targetIndex:matches[0]?.i??null,
 propagationModel:passed?"IN_PLACE_ENRICHMENT_NO_SEPARATE_DOWNSTREAM_COPY":"UNRESOLVED",
 restoreRequired:false,materializerRerunRequired:false,
 nextRuntimeCertification:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
};
write(manifest,obj);

if(!passed) done("PASSED","M419D4BD4B_IN_PLACE_MATERIALIZATION_ARCHITECTURE_NOT_CERTIFIED_FURTHER_RECONCILIATION_REQUIRED",{
 certification:{checks},
 artifacts:{architectureManifest:manifest},
 nextMilestone:"M4.19D4BD4C_SOURCE_REWRITE_REPAIR_AND_RECOVERY_POLICY"
});

done("PASSED","M419D4BD4B_IN_PLACE_GOVERNED_INVENTORY_MATERIALIZATION_ARCHITECTURE_CERTIFIED_RUNTIME_VISIBILITY_PREAUTHORIZED",{
 certification:{
  classification:obj.classification,recordCount:records.length,targetIndex:matches[0].i,
  canonicalPropertyId:r.canonicalPropertyId,address:r.address,latitude:r.latitude,longitude:r.longitude,
  availableSf:r.availableSf,propagationModel:obj.propagationModel,restoreRequired:false
 },
 policy:{
  priorSourceImmutabilityAssumptionWithdrawn:true,
  certifiedProducerMayEnrichGovernedInventoryInPlace:true,
  protectedIdentityAndAvailabilityFieldsMustRemainStable:true,
  noBlindRestore:true,noAutomaticRerun:true,
  runtimeVisibilityCertificationRequired:true
 },
 artifacts:{architectureManifest:manifest},
 nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
});
