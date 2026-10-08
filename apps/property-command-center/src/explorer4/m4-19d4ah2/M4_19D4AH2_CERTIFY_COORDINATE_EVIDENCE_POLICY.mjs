#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha} from "./M419D4AH2PolicyRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ah1-source-backed-coordinate-recovery-forensics.json");
const oldManifest=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4ah2-operator-external-source-coordinate-evidence-policy.json");
const policyPath=path.join(ev,"m4-19d4ah2-coordinate-evidence-policy-manifest.json");
const templatePath=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,oldManifest]){
  if(!fs.existsSync(p)) block("M419D4AH2_PREREQUISITE_MISSING",{path:p});
}
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_FORENSICS_CERTIFIED")
  block("M419D4AH2_D4AH1_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="NO_SOURCE_BACKED_COORDINATES_RECOVERED_FROM_REPOSITORY_TEXT")
  block("M419D4AH2_EXTERNAL_COORDINATE_EVIDENCE_BRANCH_REQUIRED",{observed:pdoc?.forensics?.classification??null});

const manifest=JSON.parse(fs.readFileSync(oldManifest,"utf8"));
const canonicalPropertyId=manifest?.sample?.canonicalPropertyId;
const sourcePropertyId=manifest?.sample?.sourcePropertyId;
if(!canonicalPropertyId||!sourcePropertyId)
  block("M419D4AH2_BOUND_PROPERTY_IDENTITY_REQUIRED");

const template={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH2_OPERATOR_COORDINATE_EVIDENCE_TEMPLATE",
  version:VERSION,
  canonicalPropertyId,
  sourcePropertyId,
  latitude:null,
  longitude:null,
  observationTimestamp:null,
  sourceProvenance:null,
  sourceReference:null,
  sourceSnapshotEvidence:null,
  operatorAttestation:null,
  notes:null
};
write(templatePath,template);

const policy={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH2_COORDINATE_EVIDENCE_POLICY_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  acceptedEvidenceModes:[
    "OPERATOR_SUPPLIED_SOURCE_BACKED_COORDINATE_EVIDENCE",
    "EXTERNAL_CONNECTOR_SOURCE_NATIVE_COORDINATE_EVIDENCE"
  ],
  requiredFields:[
    "canonicalPropertyId",
    "sourcePropertyId",
    "latitude",
    "longitude",
    "observationTimestamp",
    "sourceProvenance",
    "sourceReference",
    "sourceSnapshotEvidence"
  ],
  qualification:{
    exactCanonicalIdentityMatchRequired:true,
    exactSourceIdentityMatchRequired:true,
    latitudeRange:"-90..90",
    longitudeRange:"-180..180",
    sourceBackedEvidenceRequired:true,
    observationTimestampRequired:true,
    sourceReferenceRequired:true,
    sourceSnapshotOrEquivalentEvidenceRequired:true,
    sourceHashBindingRequired:true,
    contradictoryCoordinateEvidenceMustBlock:true,
    syntheticCoordinatesProhibited:true,
    guessedCoordinatesProhibited:true,
    geocodedCoordinatesWithoutSourceEvidenceProhibited:true,
    canonicalOrTemporalValueRelabelingProhibited:true
  },
  correctedRequestPolicy:{
    method:"POST",
    route:"/api/lightbox/enrich",
    requested:["parcels"],
    exactCoordinatesRequired:true,
    newRequestHashRequired:true,
    maximumControlledRetryRequests:1,
    executionAuthorized:false,
    automaticRetry:false
  },
  writeAuthority:{
    canonical:false,temporal:false,identity:false,operationalIngestion:false,
    sync:false,propagation:false
  }
};
write(policyPath,policy);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AH2_OPERATOR_EXTERNAL_SOURCE_COORDINATE_EVIDENCE_POLICY_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  evidencePolicy:{
    repositoryRecoveryExhausted:true,
    repositoryFilesPreviouslyScanned:pdoc?.forensics?.filesScanned??null,
    repositoryCoordinateCandidates:0,
    acceptedEvidenceModes:policy.acceptedEvidenceModes,
    requiredFields:policy.requiredFields,
    syntheticCoordinatesProhibited:true,
    guessedCoordinatesProhibited:true,
    coordinateExecutionAuthorized:false
  },
  operatorWorkflow:{
    evidenceTemplate:templatePath,
    instruction:"Populate the template with real source-backed coordinates and supporting source evidence. Do not invent or infer coordinates.",
    nextValidationMilestone:"M4.19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING"
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
  artifacts:{
    coordinateEvidencePolicy:policyPath,
    coordinateEvidenceTemplate:templatePath
  },
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
    automaticRetry:false
  },
  nextMilestone:"M4.19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
