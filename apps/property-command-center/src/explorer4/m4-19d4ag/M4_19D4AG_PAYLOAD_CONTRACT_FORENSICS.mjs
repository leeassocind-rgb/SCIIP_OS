#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,imports,urlAndBodyEvidence,linesWith} from "./M419D4AGPayloadRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4af-lightbox-enrich-http-response-forensics.json");
const preauth=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const raw=path.join(ev,"m4-19d4ae-single-record-enrich-raw-response.json");
const resultPath=path.join(ev,"m4-19d4ag-lightbox-upstream-request-payload-contract-forensics.json");
const auditPath=path.join(ev,"m4-19d4ag-lightbox-upstream-request-payload-contract-audit.json");

const candidateFiles=[
  path.join(app,"server/lightbox/proxy-server.mjs"),
  path.join(app,"server/lightbox/config.mjs"),
  path.join(app,"server/lightbox/service.mjs"),
  path.join(app,"server/lightbox/LightBoxService.mjs"),
  path.join(app,"server/lightbox/orchestrator.mjs")
];

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,preauth,raw]) if(!fs.existsSync(p)) block("M419D4AG_PREREQUISITE_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AF_LIGHTBOX_ENRICH_HTTP_502_CAUSAL_FORENSICS_CERTIFIED")
  block("M419D4AG_D4AF_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.primaryClassification!=="REQUEST_PAYLOAD_CONTRACT_FAILURE")
  block("M419D4AG_REQUEST_PAYLOAD_FAILURE_BRANCH_REQUIRED",{observed:pdoc?.forensics?.primaryClassification??null});

const manifest=JSON.parse(fs.readFileSync(preauth,"utf8"));
const rawText=fs.readFileSync(raw,"utf8");

const discovered=[];
for(const p of candidateFiles){
  if(!fs.existsSync(p)) continue;
  const text=fs.readFileSync(p,"utf8");
  discovered.push({
    file:path.relative(repo,p),
    sha256:sha(text),
    imports:imports(text),
    ...urlAndBodyEvidence(text),
    errorBoundaryLines:linesWith(text,/(LIGHTBOX_ENRICH_UPSTREAM_FAILURE|LIGHTBOX_ENRICH_FAILED|catch\s*\(|throw\s+new|status\s*:\s*502)/i)
  });
}

// Broader scan limited to LightBox server/integration files.
const roots=[path.join(app,"server/lightbox"),path.join(app,"src")].filter(fs.existsSync);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules","dist","build","coverage",".git"].includes(ent.name)) continue;
      walk(p);
    }else if([".js",".mjs",".cjs",".ts",".tsx",".jsx"].includes(path.extname(p))) files.push(p);
  }
}
for(const r of roots) walk(r);

const relevant=[];
for(const p of files){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(!/lightbox|parcel|enrich|availableSf|geometry|by-point|resolve/i.test(text)) continue;
  const evidence=urlAndBodyEvidence(text);
  if(evidence.urlLines.length || evidence.bodyLines.length){
    relevant.push({
      file:path.relative(repo,p),
      ...evidence,
      sha256:sha(text)
    });
  }
}

const requestBody=manifest?.request?.body||{};
const subject=requestBody?.subject||{};
const requested=requestBody?.requested||[];

const hasSubjectId=!!subject.id;
const hasLat=Number.isFinite(Number(subject.lat));
const hasLng=Number.isFinite(Number(subject.lng));
const hasCoordinates=hasLat&&hasLng;
const hasAddress=typeof subject.address==="string"&&subject.address.trim().length>0;

const sourceEvidence={
  preauthorizedBodyShape:{
    subjectId:hasSubjectId,
    coordinates:hasCoordinates,
    address:hasAddress,
    requested
  },
  rawFailureSha256:sha(rawText)
};

// Identify whether upstream code appears to require coordinates for parcel resolution.
let coordinateRequirementEvidence=[];
let identifierOnlySupportEvidence=[];
let addressSupportEvidence=[];
for(const r of relevant){
  for(const l of [...r.urlLines,...r.bodyLines]){
    if(/lat|lng|latitude|longitude|by-point|geometry/i.test(l.text)) coordinateRequirementEvidence.push({file:r.file,...l});
    if(/subject\.id|propertyId|sourcePropertyId|recordId/i.test(l.text)) identifierOnlySupportEvidence.push({file:r.file,...l});
    if(/address|street|city|state|zip/i.test(l.text)) addressSupportEvidence.push({file:r.file,...l});
  }
}

coordinateRequirementEvidence=coordinateRequirementEvidence.slice(0,80);
identifierOnlySupportEvidence=identifierOnlySupportEvidence.slice(0,80);
addressSupportEvidence=addressSupportEvidence.slice(0,80);

let classification,next;
if(!hasCoordinates && coordinateRequirementEvidence.length>0){
  classification="PREAUTHORIZED_ENRICH_SUBJECT_LACKS_COORDINATES_WHILE_UPSTREAM_PARCEL_RESOLUTION_REQUIRES_POINT_INPUT";
  next="M4.19D4AH_SINGLE_RECORD_COORDINATE_BINDING_AND_CORRECTED_ENRICH_REQUEST_PREAUTHORIZATION";
}else if(!hasAddress && addressSupportEvidence.length>0 && identifierOnlySupportEvidence.length===0){
  classification="PREAUTHORIZED_ENRICH_SUBJECT_LACKS_ADDRESS_WHILE_UPSTREAM_LOOKUP_REQUIRES_ADDRESS_OR_POINT";
  next="M4.19D4AH_SINGLE_RECORD_ADDRESS_OR_COORDINATE_BINDING_PREAUTHORIZATION";
}else if(identifierOnlySupportEvidence.length>0){
  classification="IDENTIFIER_ONLY_UPSTREAM_PATH_EXISTS_PAYLOAD_MAPPING_DEFECT_REQUIRES_EXACT_BINDING";
  next="M4.19D4AH_IDENTIFIER_TO_UPSTREAM_PAYLOAD_MAPPING_FORENSICS";
}else{
  classification="UPSTREAM_PAYLOAD_REQUIREMENT_NOT_YET_PROVEN_FROM_SOURCE";
  next="M4.19D4AH_LIGHTBOX_UPSTREAM_REQUEST_CONSTRUCTION_DEEP_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  priorClassification:pdoc.forensics.primaryClassification,
  preauthorizedRequest:{
    method:manifest?.request?.method??null,
    route:manifest?.request?.route??null,
    body:requestBody
  },
  sourceEvidence,
  candidateFilesInspected:discovered,
  relevantFilesScanned:relevant.length,
  coordinateRequirementEvidence,
  identifierOnlySupportEvidence,
  addressSupportEvidence,
  classification,
  newNetworkRequestsPerformed:0,
  newEnrichmentRequestsPerformed:0,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    preauthorizedSubjectHasId:hasSubjectId,
    preauthorizedSubjectHasCoordinates:hasCoordinates,
    preauthorizedSubjectHasAddress:hasAddress,
    requested,
    coordinateRequirementEvidenceCount:coordinateRequirementEvidence.length,
    identifierOnlySupportEvidenceCount:identifierOnlySupportEvidence.length,
    addressSupportEvidenceCount:addressSupportEvidence.length,
    newNetworkRequestsPerformed:0,
    newEnrichmentRequestsPerformed:0
  },
  policy:{
    noBlindRetry:true,
    correctedPayloadMustBeSourceSupported:true,
    noSyntheticCoordinates:true,
    noCanonicalOrTemporalSubstitutionAsFreshExternalEvidence:true,
    oneControlledRetryMaximumOnlyAfterCorrectedRequestPreauthorization:true
  },
  safety:{
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{payloadContractAudit:auditPath},
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
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
