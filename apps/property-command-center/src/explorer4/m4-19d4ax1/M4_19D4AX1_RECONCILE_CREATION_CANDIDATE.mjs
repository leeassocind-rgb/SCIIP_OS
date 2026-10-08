#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,recoverCoordinatePair} from "./M419D4AX1AYRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");

const axPath=path.join(ev,"m4-19d4ax-governed-base-inventory-record-creation-readiness-validation.json");
const aoBound=path.join(ev,"m4-19d4ao-bound-coordinate-evidence.json");
const aoResult=path.join(ev,"m4-19d4ao-controlled-single-google-geocode-evidence-read-and-coordinate-binding.json");
const aoAudit=path.join(ev,"m4-19d4ao-coordinate-binding-audit.json");
const aq2=path.join(ev,"m4-19d4aq2-qualified-lightbox-parcel-evidence.json");
const at=path.join(ev,"m4-19d4at-single-record-availability-refresh-input.json");
const au=path.join(ev,"m4-19d4au-market-availability-observation-append-audit.json");
const av3=path.join(ev,"m4-19d4av3-authoritative-inventory-mapping-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");

const result=path.join(ev,"m4-19d4ax1-creation-candidate-reconciliation.json");
const coordAudit=path.join(ev,"m4-19d4ax1-coordinate-evidence-structure-reconciliation-audit.json");
const candidateManifest=path.join(ev,"m4-19d4ax1-reconciled-governed-base-inventory-record-creation-candidate.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AX1_CREATION_CANDIDATE_RECONCILIATION",
 version:"4.0-m4.19d4ax1",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateInsertionPerformed:false,currentStateMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,syntheticCoordinatesUsed:false,
 syntheticRecordUsed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [axPath,aoBound,aq2,at,au,av3,invPath]){
 if(!fs.existsSync(p)) done("BLOCKED","M419D4AX1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const prior=JSON.parse(fs.readFileSync(axPath,"utf8"));
if(prior.state!=="M419D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_NOT_READY_RECONCILIATION_REQUIRED")
 done("BLOCKED","M419D4AX1_AX_RECONCILIATION_REQUIRED_STATE_EXPECTED",{observed:prior.state},3);

const priorFailures=prior?.validation?.failures??[];
const allowed=new Set(["SOURCE_BACKED_LATITUDE_REQUIRED","SOURCE_BACKED_LONGITUDE_REQUIRED"]);
if(priorFailures.some(x=>!allowed.has(x)))
 done("BLOCKED","M419D4AX1_AX_HAS_NON_COORDINATE_FAILURES",{priorFailures},3);

const docs=[];
for(const p of [aoBound,aoResult,aoAudit]){
 if(fs.existsSync(p)){try{docs.push({path:p,data:JSON.parse(fs.readFileSync(p,"utf8"))})}catch{}}
}
const pair=recoverCoordinatePair(...docs.map(x=>x.data));
if(!pair) done("PASSED","M419D4AX1_CERTIFIED_COORDINATE_PAIR_NOT_RECOVERED_FROM_AO_ARTIFACTS_FURTHER_FORENSICS_REQUIRED",{
 inspectedArtifacts:docs.map(x=>x.path),nextMilestone:"M4.19D4AX2_AO_COORDINATE_ARTIFACT_STRUCTURE_FORENSICS"
});

write(coordAudit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AX1_COORDINATE_EVIDENCE_STRUCTURE_RECONCILIATION_AUDIT",
 version:"4.0-m4.19d4ax1",generatedAt:new Date().toISOString(),
 inspectedArtifacts:docs.map(x=>x.path),recoveredCoordinatePair:pair,
 expectedCertifiedPair:{latitude:34.1810708,longitude:-118.4408537},
 exactExpectedPairMatch:pair.latitude===34.1810708&&pair.longitude===-118.4408537
});
if(pair.latitude!==34.1810708||pair.longitude!==-118.4408537)
 done("BLOCKED","M419D4AX1_RECOVERED_COORDINATES_CONTRADICT_AO_CERTIFICATION",{recoveredCoordinatePair:pair},3);

const parcel=JSON.parse(fs.readFileSync(aq2,"utf8"));
const avail=JSON.parse(fs.readFileSync(at,"utf8"));
const obs=JSON.parse(fs.readFileSync(au,"utf8")).appendedObservation;
const absence=JSON.parse(fs.readFileSync(av3,"utf8"));
const invText=fs.readFileSync(invPath,"utf8"), records=recordsOf(JSON.parse(invText));

const targetAddr=norm(obs.address);
const dup=records.map((r,i)=>({i,r})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.propertyId,r.id,r.address,r.streetAddress,r.fullAddress]
  .map(norm).filter(Boolean);
 return vals.includes(norm(obs.canonicalPropertyId))||vals.includes(norm(obs.sourcePropertyId))||vals.includes(targetAddr);
});
const failures=[];
if(absence.classification!=="BASE_INVENTORY_RECORD_ABSENT") failures.push("AV3_ABSENCE_CERTIFICATION_REQUIRED");
if(dup.length) failures.push("DUPLICATE_CURRENT_STATE_RECORD_DETECTED");
if(!Number.isFinite(Number(avail.availableSf))) failures.push("SOURCE_BACKED_AVAILABLE_SF_REQUIRED");
if(!avail.provider) failures.push("AVAILABILITY_PROVIDER_REQUIRED");
if(!avail.observationTimestamp) failures.push("AVAILABILITY_OBSERVATION_TIMESTAMP_REQUIRED");
if(!obs.canonicalPropertyId||!obs.sourcePropertyId||!obs.address) failures.push("CERTIFIED_IDENTITY_INCOMPLETE");

const candidate={
 canonicalPropertyId:obs.canonicalPropertyId,sourcePropertyId:obs.sourcePropertyId,address:obs.address,
 city:"Van Nuys",state:"CA",postalCode:"91401",
 latitude:pair.latitude,longitude:pair.longitude,
 availableSf:Number(avail.availableSf),availabilityStatus:avail.status,
 availabilityProvider:avail.provider,availabilitySourceType:avail.sourceType,
 availabilityObservationTimestamp:avail.observationTimestamp,availabilityEvidenceHash:avail.rawEvidenceHash,
 parcelAddress:parcel.selectedParcelAddress??null,parcelHasGeometry:parcel.selectedHasGeometry??false,
 parcelEvidenceQualified:parcel.sourceNativeParcelEvidenceQualified??false,
 provenance:{canonicalSource:"SCIIP",coordinateSource:"GOOGLE_MAPS_GEOCODING_API",
 coordinateEvidenceArtifact:docs[0]?.path??aoBound,parcelSource:"LIGHTBOX",
 availabilitySource:avail.provider,temporalObservationId:obs.observationId}
};
const candidateHash=sha(candidate);
write(candidateManifest,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AX1_RECONCILED_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CANDIDATE",
 version:"4.0-m4.19d4ax1",generatedAt:new Date().toISOString(),candidate,candidateHash,
 validationFailures:failures,executionAuthorized:false
});
if(failures.length) done("PASSED","M419D4AX1_RECONCILED_CREATION_CANDIDATE_NOT_READY",{
 validation:{ready:false,failures,candidateHash},artifacts:{coordinateReconciliationAudit:coordAudit,creationCandidate:candidateManifest},
 nextMilestone:"M4.19D4AX2_CREATION_CANDIDATE_RECONCILIATION"
});
done("PASSED","M419D4AX1_RECONCILED_GOVERNED_BASE_INVENTORY_RECORD_CREATION_READY_AY_PREAUTHORIZATION_READY",{
 validation:{ready:true,latitude:pair.latitude,longitude:pair.longitude,availableSf:candidate.availableSf,
 canonicalPropertyId:candidate.canonicalPropertyId,address:candidate.address,candidateHash},
 artifacts:{coordinateReconciliationAudit:coordAudit,creationCandidate:candidateManifest},
 nextMilestone:"M4.19D4AY_GOVERNED_BASE_INVENTORY_SINGLE_RECORD_INSERTION_PREAUTHORIZATION"
});
