#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,hashRecord,validateSample} from "./M419D4ADReadPreauthRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ac-isolated-proxy-environment-binding-self-test.json");
const resultPath=path.join(ev,"m4-19d4ad-controlled-single-record-enrich-read-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");

const candidateFiles=[
  path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json"),
  path.join(ev,"m4-06a-provenance-aware-reentry-candidate-manifest.json"),
  path.join(ev,"m4-19-refresh-observation-evidence-binding-manifest.json")
];

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4AD_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AC_ISOLATED_REPAIRED_PROXY_ENVIRONMENT_BOUND_SELF_TEST_READY")
  block("M419D4AD_D4AC_READY_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.selfTest?.status!=="READY" || pdoc?.selfTest?.configured!==true)
  block("M419D4AD_PROXY_READY_CONFIGURED_REQUIRED");

function collectObjects(x,out=[]){
  if(Array.isArray(x)){ for(const v of x) collectObjects(v,out); return out; }
  if(x&&typeof x==="object"){
    out.push(x);
    for(const v of Object.values(x)) collectObjects(v,out);
  }
  return out;
}

let sample=null, sampleSource=null;
for(const p of candidateFiles){
  if(!fs.existsSync(p)) continue;
  let doc; try{doc=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
  for(const o of collectObjects(doc)){
    const canonicalPropertyId=o.canonicalPropertyId||o.canonicalId||o.targetCanonicalPropertyId||null;
    const sourcePropertyId=o.sourcePropertyId||o.sourceId||o.sourceProperty?.id||null;
    const subjectId=o.subject?.id||sourcePropertyId||canonicalPropertyId;
    if(canonicalPropertyId && sourcePropertyId && subjectId){
      sample={
        canonicalPropertyId,
        sourcePropertyId,
        subject:{
          id:subjectId,
          ...(Number.isFinite(Number(o.lat||o.latitude))?{lat:Number(o.lat||o.latitude)}:{}),
          ...(Number.isFinite(Number(o.lng||o.longitude))?{lng:Number(o.lng||o.longitude)}:{})
        }
      };
      sampleSource=p;
      break;
    }
  }
  if(sample) break;
}

// Use the prior known single-record dry-run sample only if no newer candidate artifact
// exposes a complete canonical/source identity pair. This preserves continuity without
// fabricating identity.
if(!sample){
  sample={
    canonicalPropertyId:"CPROP-0021AC235DED809E1821",
    sourcePropertyId:"PROPERTY-0021AC235DED809E1821",
    subject:{id:"PROPERTY-0021AC235DED809E1821"}
  };
  sampleSource="M4.19D4 historical certified dry-run sample identity";
}

const errors=validateSample(sample);
if(errors.length) block("M419D4AD_SINGLE_RECORD_SAMPLE_BINDING_FAILED",{errors});

const request={
  method:"POST",
  route:"/api/lightbox/enrich",
  body:{
    subject:sample.subject,
    requested:["parcels"]
  }
};

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AD_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  sample,
  sampleSource,
  sampleHash:hashRecord(sample),
  request,
  requestHash:hashRecord(request),
  endpoint:{
    host:"127.0.0.1",
    isolatedPort:8788,
    route:"/api/lightbox/enrich",
    method:"POST"
  },
  controls:{
    maximumEnrichmentRequests:1,
    automaticRetry:false,
    blindRetry:false,
    selfTestMustPassImmediatelyBeforeRead:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    responseHttpStatusRequired:true,
    responseJsonParseRequired:true,
    sourceNativeSemanticQualificationRequired:true,
    availableSfQualificationRequired:true,
    canonicalMutationProhibited:true,
    temporalMutationProhibited:true,
    identityMutationProhibited:true,
    operationalIngestionProhibited:true
  },
  executionAuthorized:false,
  explicitExecutionAuthorizationRequired:true
};
write(manifestPath,manifest);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AD_CONTROLLED_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",
  certifiedAt:new Date().toISOString(),
  proxyReadiness:{
    prerequisiteState:pdoc.state,
    httpStatus:pdoc?.selfTest?.httpStatus??null,
    status:pdoc?.selfTest?.status??null,
    configured:pdoc?.selfTest?.configured??null,
    canonicalAuthority:pdoc?.selfTest?.canonicalAuthority??null,
    parcelContract:pdoc?.selfTest?.parcelContract??null
  },
  sampleBinding:{
    canonicalPropertyId:sample.canonicalPropertyId,
    sourcePropertyId:sample.sourcePropertyId,
    subjectId:sample.subject.id,
    sampleSource,
    sampleHash:manifest.sampleHash
  },
  requestContract:{
    method:"POST",
    route:"/api/lightbox/enrich",
    requested:["parcels"],
    maximumEnrichmentRequests:1,
    requestHash:manifest.requestHash
  },
  executionPolicy:{
    selfTestRequiredImmediatelyBeforeExecution:true,
    oneRequestMaximum:true,
    automaticRetry:false,
    blindRetry:false,
    rawResponsePersistenceRequired:true,
    rawResponseHashRequired:true,
    sourceNativeAvailableSfQualificationRequired:true,
    contradictoryOrMissingSemanticEvidenceMustBlock:true,
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
  artifacts:{preauthorizationManifest:manifestPath},
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
  nextMilestone:"M4.19D4AE_CONTROLLED_SINGLE_RECORD_ENRICH_READ_EXECUTION_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
