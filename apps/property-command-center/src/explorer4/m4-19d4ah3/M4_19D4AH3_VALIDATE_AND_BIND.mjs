#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,validLat,validLng,validTimestamp,nonEmpty} from "./M419D4AH3ValidationRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ah2-operator-external-source-coordinate-evidence-policy.json");
const policyPath=path.join(ev,"m4-19d4ah2-coordinate-evidence-policy-manifest.json");
const evidencePath=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");

const resultPath=path.join(ev,"m4-19d4ah3-operator-external-coordinate-evidence-validation-binding.json");
const auditPath=path.join(ev,"m4-19d4ah3-coordinate-evidence-validation-audit.json");
const correctedManifestPath=path.join(ev,"m4-19d4ah3-corrected-single-record-enrich-preauthorization-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,
      canonicalWriteAuthority:false,
      identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,
      refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,
      syncAuthority:false,
      propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      networkRequestsPerformed:0,
      enrichmentRequestsPerformed:0,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      syntheticCoordinatesUsed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [prior,policyPath,evidencePath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AH3_PREREQUISITE_MISSING",{path:p},3);
}

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
const policy=JSON.parse(fs.readFileSync(policyPath,"utf8"));
let evidence;
try{ evidence=JSON.parse(fs.readFileSync(evidencePath,"utf8")); }
catch(e){ finish("BLOCKED","M419D4AH3_EVIDENCE_JSON_INVALID",{error:String(e?.message||e)},3); }

if(pdoc?.state!=="M419D4AH2_OPERATOR_EXTERNAL_SOURCE_COORDINATE_EVIDENCE_POLICY_CERTIFIED")
  finish("BLOCKED","M419D4AH3_D4AH2_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null},3);

const bound=policy?.boundIdentity||pdoc?.boundIdentity||{};
const failures=[];

if(evidence?.canonicalPropertyId!==bound.canonicalPropertyId) failures.push("CANONICAL_PROPERTY_ID_MISMATCH");
if(evidence?.sourcePropertyId!==bound.sourcePropertyId) failures.push("SOURCE_PROPERTY_ID_MISMATCH");
if(!validLat(evidence?.latitude)) failures.push("VALID_LATITUDE_REQUIRED");
if(!validLng(evidence?.longitude)) failures.push("VALID_LONGITUDE_REQUIRED");
if(!validTimestamp(evidence?.observationTimestamp)) failures.push("VALID_OBSERVATION_TIMESTAMP_REQUIRED");
if(!nonEmpty(evidence?.sourceProvenance)) failures.push("SOURCE_PROVENANCE_REQUIRED");
if(!nonEmpty(evidence?.sourceReference)) failures.push("SOURCE_REFERENCE_REQUIRED");

const snapshot=evidence?.sourceSnapshotEvidence;
const snapshotPresent=
  (typeof snapshot==="string"&&snapshot.trim().length>0) ||
  (snapshot&&typeof snapshot==="object"&&Object.keys(snapshot).length>0);
if(!snapshotPresent) failures.push("SOURCE_SNAPSHOT_EVIDENCE_REQUIRED");

const now=Date.now();
const obs=Date.parse(evidence?.observationTimestamp||"");
if(Number.isFinite(obs) && obs>now+5*60*1000) failures.push("FUTURE_DATED_OBSERVATION_PROHIBITED");

const evidenceHash=sha(JSON.stringify(evidence));
const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH3_COORDINATE_EVIDENCE_VALIDATION_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:bound,
  evidenceHash,
  validationFailures:failures,
  valid:failures.length===0,
  syntheticCoordinatesUsed:false,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

if(failures.length){
  finish("BLOCKED","M419D4AH3_COORDINATE_EVIDENCE_INCOMPLETE_OR_INVALID",{
    validation:{
      valid:false,
      failures,
      evidenceHash,
      boundIdentity:bound
    },
    operatorAction:{
      evidenceFile:evidencePath,
      instruction:"Populate every required field with real source-backed evidence, then rerun M4.19D4AH3."
    },
    artifacts:{validationAudit:auditPath},
    nextMilestone:"M4.19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING"
  },3);
}

const lat=Number(evidence.latitude), lng=Number(evidence.longitude);
const correctedRequest={
  method:"POST",
  route:"/api/lightbox/enrich",
  body:{
    subject:{
      id:bound.sourcePropertyId,
      lat,lng
    },
    requested:["parcels"]
  }
};
const correctedRequestHash=sha(JSON.stringify(correctedRequest));

const correctedManifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH3_CORRECTED_SINGLE_RECORD_ENRICH_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:bound,
  coordinateEvidence:{
    latitude:lat,
    longitude:lng,
    observationTimestamp:evidence.observationTimestamp,
    sourceProvenance:evidence.sourceProvenance,
    sourceReference:evidence.sourceReference,
    sourceSnapshotEvidenceHash:sha(JSON.stringify(evidence.sourceSnapshotEvidence)),
    evidenceRecordHash:evidenceHash,
    sourceBacked:true,
    synthetic:false
  },
  correctedRequest,
  correctedRequestHash,
  controls:{
    maximumControlledRetryRequests:1,
    automaticRetry:false,
    blindRetry:false,
    preExecutionSelfTestRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    sourceNativeAvailableSfQualificationRequired:true
  },
  executionAuthorized:false,
  explicitExecutionAuthorizationRequired:true
};
write(correctedManifestPath,correctedManifest);

finish("PASSED","M419D4AH3_COORDINATE_EVIDENCE_VALIDATED_BOUND_CORRECTED_ENRICH_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  validation:{
    valid:true,
    evidenceHash,
    boundIdentity:bound,
    latitude:lat,
    longitude:lng,
    sourceBacked:true
  },
  requestBinding:{
    correctedRequestHash,
    method:"POST",
    route:"/api/lightbox/enrich",
    requested:["parcels"],
    maximumControlledRetryRequests:1,
    executionAuthorized:false
  },
  artifacts:{
    validationAudit:auditPath,
    correctedPreauthorizationManifest:correctedManifestPath
  },
  nextMilestone:"M4.19D4AI_CONTROLLED_CORRECTED_SINGLE_RECORD_ENRICH_READ_RETRY_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
},0);
