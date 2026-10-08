#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,collectObjects,finiteCoord,identityMatches} from "./M419D4AHCoordinateRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ag-lightbox-upstream-request-payload-contract-forensics.json");
const oldManifestPath=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4ah-single-record-coordinate-binding-corrected-enrich-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4ah-corrected-single-record-enrich-read-preauthorization-manifest.json");
const auditPath=path.join(ev,"m4-19d4ah-coordinate-source-binding-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,oldManifestPath]) if(!fs.existsSync(p))
  block("M419D4AH_PREREQUISITE_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_FORENSICS_CERTIFIED")
  block("M419D4AH_D4AG_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="PREAUTHORIZED_ENRICH_SUBJECT_LACKS_COORDINATES_WHILE_UPSTREAM_PARCEL_RESOLUTION_REQUIRES_POINT_INPUT")
  block("M419D4AH_COORDINATE_BINDING_BRANCH_REQUIRED",{observed:pdoc?.forensics?.classification??null});

const oldManifest=JSON.parse(fs.readFileSync(oldManifestPath,"utf8"));
const canonicalId=oldManifest?.sample?.canonicalPropertyId;
const sourceId=oldManifest?.sample?.sourcePropertyId;
if(!canonicalId||!sourceId) block("M419D4AH_BOUND_SAMPLE_IDENTITY_REQUIRED");

const searchRoots=[
  path.join(app,"evidence"),
  path.join(app,"src/production-validation"),
  path.join(app,"public/production-validation-data")
].filter(fs.existsSync);

const jsonFiles=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules","dist","build","coverage",".git"].includes(ent.name)) continue;
      walk(p);
    }else if(ent.name.endsWith(".json")) jsonFiles.push(p);
  }
}
for(const r of searchRoots) walk(r);

const hits=[];
for(const p of jsonFiles){
  // Avoid self-referential/generated corrected manifest paths if rerun.
  if([manifestPath,auditPath,resultPath].includes(p)) continue;
  let doc; try{doc=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
  for(const o of collectObjects(doc)){
    if(!identityMatches(o,canonicalId,sourceId)) continue;
    const lat=finiteCoord(o?.lat??o?.latitude??o?.subject?.lat??o?.coordinates?.lat??o?.location?.lat,-90,90);
    const lng=finiteCoord(o?.lng??o?.longitude??o?.subject?.lng??o?.coordinates?.lng??o?.location?.lng,-180,180);
    if(lat===null||lng===null) continue;
    hits.push({
      file:p,
      lat,lng,
      evidenceKeys:Object.keys(o).slice(0,40),
      canonicalPropertyId:o?.canonicalPropertyId??o?.canonicalId??o?.targetCanonicalPropertyId??null,
      sourcePropertyId:o?.sourcePropertyId??o?.sourceId??o?.propertyId??o?.id??null
    });
  }
}

const unique=new Map();
for(const h of hits){
  const k=`${h.lat.toFixed(7)},${h.lng.toFixed(7)}`;
  if(!unique.has(k)) unique.set(k,h);
}
const uniqueHits=[...unique.values()];

if(uniqueHits.length===0){
  block("M419D4AH_SOURCE_BACKED_COORDINATES_NOT_FOUND",{
    binding:{
      canonicalPropertyId:canonicalId,
      sourcePropertyId:sourceId,
      jsonFilesScanned:jsonFiles.length,
      coordinateCandidates:0,
      syntheticCoordinatesUsed:false
    },
    nextMilestone:"M4.19D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_FORENSICS"
  });
}

if(uniqueHits.length>1){
  block("M419D4AH_MULTIPLE_SOURCE_BACKED_COORDINATE_CANDIDATES_REQUIRE_RECONCILIATION",{
    binding:{
      canonicalPropertyId:canonicalId,
      sourcePropertyId:sourceId,
      coordinateCandidates:uniqueHits.map(h=>({
        file:h.file,lat:h.lat,lng:h.lng
      })),
      syntheticCoordinatesUsed:false
    },
    nextMilestone:"M4.19D4AH1_COORDINATE_CANDIDATE_RECONCILIATION"
  });
}

const chosen=uniqueHits[0];
const correctedRequest={
  method:"POST",
  route:"/api/lightbox/enrich",
  body:{
    subject:{
      id:sourceId,
      lat:chosen.lat,
      lng:chosen.lng
    },
    requested:["parcels"]
  }
};

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH_CORRECTED_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  sample:{
    canonicalPropertyId:canonicalId,
    sourcePropertyId:sourceId,
    subject:correctedRequest.body.subject
  },
  coordinateBinding:{
    sourceFile:chosen.file,
    latitude:chosen.lat,
    longitude:chosen.lng,
    sourceBacked:true,
    synthetic:false
  },
  priorRequestHash:oldManifest.requestHash,
  correctedRequest,
  correctedRequestHash:sha(JSON.stringify(correctedRequest)),
  controls:{
    maximumControlledRetryRequests:1,
    automaticRetry:false,
    blindRetry:false,
    preExecutionSelfTestRequired:true,
    exactCoordinateBindingRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    sourceNativeAvailableSfQualificationRequired:true,
    canonicalMutationProhibited:true,
    temporalMutationProhibited:true,
    identityMutationProhibited:true,
    operationalIngestionProhibited:true
  },
  executionAuthorized:false,
  explicitExecutionAuthorizationRequired:true
};
write(manifestPath,manifest);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH_COORDINATE_SOURCE_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  canonicalPropertyId:canonicalId,
  sourcePropertyId:sourceId,
  jsonFilesScanned:jsonFiles.length,
  coordinateCandidatesRecovered:hits.length,
  uniqueCoordinateCandidates:uniqueHits.length,
  selectedSourceFile:chosen.file,
  selectedCoordinates:{lat:chosen.lat,lng:chosen.lng},
  sourceBacked:true,
  syntheticCoordinatesUsed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AH_SOURCE_BACKED_COORDINATES_BOUND_CORRECTED_ENRICH_REQUEST_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
  certifiedAt:new Date().toISOString(),
  binding:{
    canonicalPropertyId:canonicalId,
    sourcePropertyId:sourceId,
    latitude:chosen.lat,
    longitude:chosen.lng,
    sourceFile:chosen.file,
    sourceBacked:true,
    syntheticCoordinatesUsed:false
  },
  requestCorrection:{
    priorRequestHash:oldManifest.requestHash,
    correctedRequestHash:manifest.correctedRequestHash,
    priorSubjectHadCoordinates:false,
    correctedSubjectHasCoordinates:true,
    method:"POST",
    route:"/api/lightbox/enrich",
    requested:["parcels"]
  },
  executionPolicy:{
    maximumControlledRetryRequests:1,
    automaticRetry:false,
    blindRetry:false,
    preExecutionSelfTestRequired:true,
    executionAuthorized:false,
    explicitAuthorizationRequired:true
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{
    correctedPreauthorizationManifest:manifestPath,
    coordinateBindingAudit:auditPath
  },
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
  nextMilestone:"M4.19D4AI_CONTROLLED_CORRECTED_SINGLE_RECORD_ENRICH_READ_RETRY_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
