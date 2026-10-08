#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,routeWindow,inferMethod,inferBodyContract,collectRequestedLiterals,sha
} from "./M419D4HRequestContractRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const orchPath=path.join(app,"server/lightbox/LightBoxEnrichmentOrchestrator.mjs");
const servicePath=path.join(app,"server/lightbox/LightBoxEnrichmentService.mjs");
const preauthPath=path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json");
const priorPath=path.join(ev,"m4-19d4-lightbox-single-record-source-native-available-sf-qualification.json");

const resultPath=path.join(ev,"m4-19d4h-lightbox-enrich-request-contract-certification.json");
const launcherPath=path.join(ev,"m4-19d4h-corrected-single-record-post-dry-run-launcher.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const fail=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [proxyPath,orchPath,preauthPath,priorPath]){
  if(!fs.existsSync(p)) fail("M419D4H_PREREQUISITE_MISSING",{path:p});
}

const proxy=fs.readFileSync(proxyPath,"utf8");
const orch=fs.readFileSync(orchPath,"utf8");
const service=fs.existsSync(servicePath)?fs.readFileSync(servicePath,"utf8"):"";
const block=routeWindow(proxy);
const method=inferMethod(block);
const body=inferBodyContract(block);

if(method!=="POST") fail("M419D4H_ENRICH_POST_CONTRACT_NOT_PROVEN",{method});
if(!body.subjectRequired || !body.subjectIdRequired) fail("M419D4H_SUBJECT_ID_CONTRACT_NOT_PROVEN",{body});

const pre=JSON.parse(fs.readFileSync(preauthPath,"utf8"));
const rows=pre?.rows||[];
if(rows.length!==400) fail("M419D4H_EXACT_400_PREAUTHORIZED_ROWS_REQUIRED",{observed:rows.length});

const sample=rows[0];
const requested=[...new Set([
  ...collectRequestedLiterals(orch),
  ...collectRequestedLiterals(service),
  ...collectRequestedLiterals(proxy)
])];

const availableSfCode=/\bavailableSf\b|available[_\s-]?sf|available square feet|available square footage/i.test(orch+"\n"+service+"\n"+proxy);

const preferredRequested = requested.includes("availability")
  ? ["availability"]
  : requested.includes("property")
    ? ["property"]
    : requested.includes("parcels")
      ? ["parcels"]
      : [];

const endpoint="http://127.0.0.1:8787/api/lightbox/enrich";
const bodyTemplate={
  subject:{
    id:sample.canonicalPropertyId,
    sourcePropertyId:sample.sourcePropertyId
  },
  requested:preferredRequested.length?preferredRequested:["parcels"]
};

const launcher={
  contract:"SCIIP_EXPLORER_4_M4_19D4H_CORRECTED_SINGLE_RECORD_POST_DRY_RUN_LAUNCHER",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  endpoint,
  method:"POST",
  headers:{"content-type":"application/json","accept":"application/json"},
  body:bodyTemplate,
  sourceContract:{
    route:"/api/lightbox/enrich",
    postOnly:true,
    subjectRequired:true,
    subjectIdRequired:true,
    requestedArraySupported:body.requestedArraySupported,
    defaultRequestedParcels:body.defaultRequestedParcels
  },
  requestedTypesDiscovered:requested,
  availableSfSemanticPathSeenInImplementation:availableSfCode,
  commands:{
    curl:`curl -sS -X POST "${endpoint}" -H 'content-type: application/json' -H 'accept: application/json' --data '${JSON.stringify(bodyTemplate)}'`,
    note:"This is one read-only LightBox enrichment request. It does not mutate canonical, temporal, or identity state."
  }
};
write(launcherPath,launcher);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4H_LIGHTBOX_ENRICH_POST_REQUEST_CONTRACT_CERTIFIED_SINGLE_RECORD_DRY_RUN_REPAIRED",
  certifiedAt:new Date().toISOString(),
  requestContract:{
    method,
    route:"/api/lightbox/enrich",
    bodyContract:body,
    requestedTypesDiscovered:requested,
    selectedRequested:bodyTemplate.requested,
    availableSfSemanticPathSeenInImplementation:availableSfCode,
    priorGetQueryContractRejected:true
  },
  correction:{
    priorFailureState:JSON.parse(fs.readFileSync(priorPath,"utf8"))?.state??null,
    priorRequestShape:"GET + query parameters",
    correctedRequestShape:"POST + JSON body {subject:{id,...}, requested:[...]}",
    networkRequestPerformed:false
  },
  artifacts:{correctedDryRunLauncher:launcherPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  nextMilestone:"M4.19D4I_LIGHTBOX_SINGLE_RECORD_POST_DRY_RUN_EXECUTION_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
