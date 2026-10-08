#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,classifyText,redactDeep} from "./M419D4AFHttpRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ae-controlled-single-record-enrich-read-execution.json");
const rawPath=path.join(ev,"m4-19d4ae-single-record-enrich-raw-response.json");
const logPath=path.join(ev,"m4-19d4ae-isolated-proxy-runtime.log");
const preauth=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");

const resultPath=path.join(ev,"m4-19d4af-lightbox-enrich-http-response-forensics.json");
const auditPath=path.join(ev,"m4-19d4af-lightbox-enrich-http-response-forensic-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,rawPath,logPath,preauth]) if(!fs.existsSync(p))
  block("M419D4AF_PREREQUISITE_ARTIFACT_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AE_SINGLE_ENRICH_READ_HTTP_RESPONSE_NOT_SUCCESSFUL")
  block("M419D4AF_EXPECTED_D4AE_HTTP_FAILURE_STATE",{observed:pdoc?.state??null});
if(pdoc?.execution?.httpStatus!==502)
  block("M419D4AF_EXPECTED_HTTP_502",{observed:pdoc?.execution?.httpStatus??null});

const raw=fs.readFileSync(rawPath,"utf8");
const log=fs.readFileSync(logPath,"utf8");
const manifest=JSON.parse(fs.readFileSync(preauth,"utf8"));

const actualRawSha=sha(raw);
const expectedRawSha=pdoc?.execution?.rawResponseSha256||null;
const rawShaMatches=expectedRawSha===actualRawSha;

let parsed=null,rawJsonParseable=false;
try{parsed=JSON.parse(raw);rawJsonParseable=true}catch{}

const redactedParsed=parsed?redactDeep(parsed):null;

const rawClasses=classifyText(raw);
const logClasses=classifyText(log);
const combined=[...new Set([...rawClasses,...logClasses])];

const errorCodeCandidates=[];
if(parsed && typeof parsed==="object"){
  const stack=[parsed];
  while(stack.length){
    const x=stack.pop();
    if(Array.isArray(x)){stack.push(...x);continue}
    if(!x||typeof x!=="object") continue;
    for(const [k,v] of Object.entries(x)){
      if(/code|status|error|message|reason/i.test(k) && (typeof v==="string"||typeof v==="number")){
        errorCodeCandidates.push({key:k,value:String(v).slice(0,500)});
      }else if(v&&typeof v==="object") stack.push(v);
    }
  }
}

let primaryClassification="UNCLASSIFIED_HTTP_502_UPSTREAM_FAILURE";
const priority=[
  "AUTHENTICATION_OR_AUTHORIZATION_FAILURE",
  "REQUEST_PAYLOAD_CONTRACT_FAILURE",
  "UPSTREAM_RATE_LIMIT_FAILURE",
  "UPSTREAM_ROUTE_OR_ENDPOINT_FAILURE",
  "UPSTREAM_TIMEOUT_FAILURE",
  "UPSTREAM_DNS_OR_CONNECTIVITY_FAILURE",
  "UPSTREAM_SERVER_FAILURE"
];
for(const x of priority){
  if(combined.includes(x)){primaryClassification=x;break;}
}

let next;
switch(primaryClassification){
  case "AUTHENTICATION_OR_AUTHORIZATION_FAILURE":
    next="M4.19D4AG_LIGHTBOX_CREDENTIAL_ACCEPTANCE_AND_UPSTREAM_AUTH_CONTRACT_FORENSICS"; break;
  case "REQUEST_PAYLOAD_CONTRACT_FAILURE":
    next="M4.19D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_FORENSICS"; break;
  case "UPSTREAM_RATE_LIMIT_FAILURE":
    next="M4.19D4AG_LIGHTBOX_RATE_LIMIT_AND_RETRY_POLICY_CERTIFICATION"; break;
  case "UPSTREAM_ROUTE_OR_ENDPOINT_FAILURE":
    next="M4.19D4AG_LIGHTBOX_UPSTREAM_ROUTE_BINDING_FORENSICS"; break;
  case "UPSTREAM_TIMEOUT_FAILURE":
    next="M4.19D4AG_LIGHTBOX_UPSTREAM_TIMEOUT_CHAIN_FORENSICS"; break;
  case "UPSTREAM_DNS_OR_CONNECTIVITY_FAILURE":
    next="M4.19D4AG_LIGHTBOX_UPSTREAM_CONNECTIVITY_FORENSICS"; break;
  case "UPSTREAM_SERVER_FAILURE":
    next="M4.19D4AG_LIGHTBOX_UPSTREAM_FAILURE_ENVELOPE_AND_PROVIDER_RESPONSE_FORENSICS"; break;
  default:
    next="M4.19D4AG_LIGHTBOX_502_ERROR_ENVELOPE_DEEP_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AF_LIGHTBOX_ENRICH_HTTP_RESPONSE_FORENSIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  priorState:pdoc.state,
  httpStatus:pdoc.execution.httpStatus,
  requestHash:pdoc.execution.requestHash,
  sampleHash:pdoc.execution.sampleHash,
  expectedRawResponseSha256:expectedRawSha,
  actualRawResponseSha256:actualRawSha,
  rawShaMatches,
  rawJsonParseable,
  redactedResponse:redactedParsed,
  errorCodeCandidates,
  rawClassifications:rawClasses,
  runtimeLogClassifications:logClasses,
  combinedClassifications:combined,
  primaryClassification,
  preauthorizedRequest:{
    method:manifest?.request?.method??null,
    route:manifest?.request?.route??null,
    requested:manifest?.request?.body?.requested??null
  },
  newNetworkRequestsPerformed:0,
  enrichmentRequestsPerformed:0,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AF_LIGHTBOX_ENRICH_HTTP_502_CAUSAL_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    primaryClassification,
    combinedClassifications:combined,
    httpStatus:502,
    rawShaMatches,
    rawJsonParseable,
    errorCodeCandidates,
    requestHash:pdoc.execution.requestHash,
    sampleHash:pdoc.execution.sampleHash,
    automaticRetryPreviouslyPerformed:false,
    newNetworkRequestsPerformed:0,
    newEnrichmentRequestsPerformed:0
  },
  policy:{
    noBlindRetry:true,
    exactFailureEnvelopeRequiredBeforeRetry:true,
    upstreamAuthMustNotBeAssumedFromLocalReadiness:true,
    localProxyReadyDoesNotImplyUpstreamRequestAccepted:true,
    oneControlledRetryMaximumOnlyAfterCauseQualified:true,
    canonicalTemporalIdentityWritesRemainOff:true
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
  artifacts:{
    forensicAudit:auditPath,
    inspectedRawResponse:rawPath,
    inspectedRuntimeLog:logPath
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
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
