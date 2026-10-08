#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4AWAXRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const awPath=path.join(ev,"m4-19d4aw-governed-base-inventory-record-creation-contract-definition.json");
const aoPath=path.join(ev,"m4-19d4ao-bound-coordinate-evidence.json");
const aq2Path=path.join(ev,"m4-19d4aq2-qualified-lightbox-parcel-evidence.json");
const atInput=path.join(ev,"m4-19d4at-single-record-availability-refresh-input.json");
const auAudit=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const av3Map=path.join(ev,"m4-19d4av3-authoritative-inventory-mapping-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4ax-governed-base-inventory-record-creation-readiness-validation.json");
const manifest=path.join(ev,"m4-19d4ax-governed-base-inventory-record-creation-candidate-manifest.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_READINESS_VALIDATION",
 version:"4.0-m4.19d4ax-r1",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateInsertionPerformed:false,currentStateMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,syntheticRecordUsed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [awPath,aoPath,aq2Path,atInput,auAudit,av3Map,invPath]){
 if(!fs.existsSync(p)) done("BLOCKED","M419D4AX_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const aw=JSON.parse(fs.readFileSync(awPath,"utf8"));
if(aw.state!=="M419D4AW_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CONTRACT_CERTIFIED_EXECUTION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4AX_AW_CREATION_CONTRACT_STATE_REQUIRED",{observed:aw.state},3);

const coord=JSON.parse(fs.readFileSync(aoPath,"utf8"));
const parcel=JSON.parse(fs.readFileSync(aq2Path,"utf8"));
const avail=JSON.parse(fs.readFileSync(atInput,"utf8"));
const obs=JSON.parse(fs.readFileSync(auAudit,"utf8")).appendedObservation;
const av3=JSON.parse(fs.readFileSync(av3Map,"utf8"));
const invText=fs.readFileSync(invPath,"utf8"), inv=JSON.parse(invText), records=recordsOf(inv);

const failures=[];
if(av3.classification!=="BASE_INVENTORY_RECORD_ABSENT") failures.push("AV3_ABSENCE_CERTIFICATION_REQUIRED");
if(!obs.canonicalPropertyId) failures.push("CANONICAL_PROPERTY_ID_REQUIRED");
if(!obs.sourcePropertyId) failures.push("SOURCE_PROPERTY_ID_REQUIRED");
if(!obs.address) failures.push("ADDRESS_REQUIRED");
if(!Number.isFinite(Number(coord.latitude))) failures.push("SOURCE_BACKED_LATITUDE_REQUIRED");
if(!Number.isFinite(Number(coord.longitude))) failures.push("SOURCE_BACKED_LONGITUDE_REQUIRED");
if(!Number.isFinite(Number(avail.availableSf))) failures.push("SOURCE_BACKED_AVAILABLE_SF_REQUIRED");
if(!avail.provider) failures.push("AVAILABILITY_PROVIDER_REQUIRED");
if(!avail.observationTimestamp) failures.push("AVAILABILITY_OBSERVATION_TIMESTAMP_REQUIRED");

const targetAddr=norm(obs.address);
const duplicateCandidates=records.map((r,i)=>({i,r})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.propertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(obs.canonicalPropertyId))||vals.includes(norm(obs.sourcePropertyId))||vals.includes(targetAddr);
});
if(duplicateCandidates.length) failures.push("DUPLICATE_CURRENT_STATE_RECORD_DETECTED");

const candidate={
 canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address,
 city:"Van Nuys",state:"CA",postalCode:"91401",
 latitude:Number(coord.latitude),longitude:Number(coord.longitude),
 availableSf:Number(avail.availableSf),availabilityStatus:avail.status,
 availabilityProvider:avail.provider,availabilitySourceType:avail.sourceType,
 availabilityObservationTimestamp:avail.observationTimestamp,
 availabilityEvidenceHash:avail.rawEvidenceHash,
 parcelAddress:parcel.selectedParcelAddress??null,
 parcelHasGeometry:parcel.selectedHasGeometry??false,
 parcelEvidenceQualified:parcel.sourceNativeParcelEvidenceQualified??false,
 provenance:{canonicalSource:"SCIIP",coordinateSource:"GOOGLE_MAPS_GEOCODING_API",
 parcelSource:"LIGHTBOX",availabilitySource:avail.provider,temporalObservationId:obs.observationId}
};
const candidateHash=sha(candidate);
write(manifest,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CANDIDATE_MANIFEST",
 version:"4.0-m4.19d4ax-r1",generatedAt:new Date().toISOString(),
 candidate,candidateHash,validationFailures:failures,executionAuthorized:false
});

if(failures.length){
 done("PASSED","M419D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_NOT_READY_RECONCILIATION_REQUIRED",{
  validation:{ready:false,failures,candidateHash},artifacts:{creationCandidateManifest:manifest},
  nextMilestone:"M4.19D4AX1_CREATION_CANDIDATE_RECONCILIATION"
 });
}
done("PASSED","M419D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_READY_INSERTION_PREAUTHORIZATION_REQUIRED",{
 validation:{ready:true,canonicalPropertyId:candidate.canonicalPropertyId,address:candidate.address,
 latitude:candidate.latitude,longitude:candidate.longitude,availableSf:candidate.availableSf,
 availabilityProvider:candidate.availabilityProvider,parcelEvidenceQualified:candidate.parcelEvidenceQualified,candidateHash},
 policy:{duplicateCheckPassed:true,sourceBackedCoordinatesRequired:true,sourceBackedAvailabilityRequired:true,insertionNotAuthorized:true},
 artifacts:{creationCandidateManifest:manifest},
 nextMilestone:"M4.19D4AY_GOVERNED_BASE_INVENTORY_SINGLE_RECORD_INSERTION_PREAUTHORIZATION"
});
