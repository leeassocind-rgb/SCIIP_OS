#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import {
  CONTRACT,VERSION,APPROVED_FIELD,sha,redact,collectObjects,findAvailableSfCandidates
} from "./M419D4LightBoxDryRunRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const d3=path.join(ev,"m4-19d3-external-source-configuration-plan-binding-scaffold.json");
const preauth=path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json");
const rawPath=path.join(ev,"m4-19d4-lightbox-single-record-raw-response.json");
const auditPath=path.join(ev,"m4-19d4-lightbox-single-record-dry-run-audit.json");
const resultPath=path.join(ev,"m4-19d4-lightbox-single-record-source-native-available-sf-qualification.json");

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");

const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
    },
    safety:{
      readOnlySingleRecordQualification:true,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,
      operationalIngestionPerformed:false,evidenceFabricated:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [d3,preauth]) if(!fs.existsSync(p)) finish("BLOCKED","M419D4_PREREQUISITE_MISSING",{path:p},3);

const d3doc=read(d3);
if(d3doc?.state!=="M419D3_EXTERNAL_SOURCE_CONFIGURATION_PLAN_BINDING_SCAFFOLD_CERTIFIED_DRY_RUN_REQUIRED")
  finish("BLOCKED","M419D4_M419D3_DRY_RUN_REQUIRED_STATE_EXPECTED",{observed:d3doc?.state??null},3);

const rows=read(preauth)?.rows||[];
if(rows.length!==400) finish("BLOCKED","M419D4_EXACT_400_PREAUTHORIZED_ROWS_REQUIRED",{observed:rows.length},3);
const sample=rows[0];

/*
Resolve a LightBox read endpoint without exposing secrets.
Priority:
1 SCIIP_LIGHTBOX_DRY_RUN_URL explicit
2 LIGHTBOX_PROXY_URL
3 NEXT_PUBLIC_LIGHTBOX_PROXY_URL
4 localhost proxy convention
*/
const configuredUrl=
  process.env.SCIIP_LIGHTBOX_DRY_RUN_URL ||
  process.env.LIGHTBOX_PROXY_URL ||
  process.env.NEXT_PUBLIC_LIGHTBOX_PROXY_URL ||
  null;

const envAudit={
  SCIIP_LIGHTBOX_DRY_RUN_URL:redact(process.env.SCIIP_LIGHTBOX_DRY_RUN_URL),
  LIGHTBOX_PROXY_URL:redact(process.env.LIGHTBOX_PROXY_URL),
  NEXT_PUBLIC_LIGHTBOX_PROXY_URL:redact(process.env.NEXT_PUBLIC_LIGHTBOX_PROXY_URL),
  LIGHTBOX_API_KEY:redact(process.env.LIGHTBOX_API_KEY),
  LIGHTBOX_CLIENT_ID:redact(process.env.LIGHTBOX_CLIENT_ID),
  LIGHTBOX_CLIENT_SECRET:redact(process.env.LIGHTBOX_CLIENT_SECRET)
};

if(!configuredUrl){
  finish("BLOCKED","M419D4_LIGHTBOX_READ_ENDPOINT_CONFIGURATION_REQUIRED",{
    sample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
    configuration:{configuredReadEndpoint:false,environmentAudit:envAudit},
    networkRequestPerformed:false,
    nextMilestone:"M4.19D4A_LIGHTBOX_EXISTING_PROXY_ROUTE_AND_ENV_CONFIGURATION_BINDING"
  },3);
}

if(!authorized){
  finish("BLOCKED","M419D4_LIGHTBOX_READ_CONFIGURED_EXPLICIT_AUTHORIZATION_REQUIRED",{
    sample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
    configuration:{configuredReadEndpoint:true,endpoint:redact(configuredUrl),environmentAudit:envAudit},
    authorizationArgument:"AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ",
    networkRequestPerformed:false,
    nextMilestone:"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
  },3);
}

function doRequest(url){
  return new Promise((resolve,reject)=>{
    let u;
    try{u=new URL(url)}catch{return reject(new Error("INVALID_LIGHTBOX_URL"))}
    u.searchParams.set("canonicalPropertyId",sample.canonicalPropertyId);
    u.searchParams.set("sourcePropertyId",sample.sourcePropertyId);
    const lib=u.protocol==="https:"?https:http;
    const headers={"accept":"application/json"};
    if(process.env.LIGHTBOX_API_KEY) headers["authorization"]=`Bearer ${process.env.LIGHTBOX_API_KEY}`;
    const req=lib.request(u,{method:"GET",headers},res=>{
      let data="";
      res.on("data",c=>data+=c);
      res.on("end",()=>{
        if(res.statusCode<200||res.statusCode>=300) return reject(new Error(`HTTP_${res.statusCode}`));
        let doc; try{doc=JSON.parse(data)}catch{return reject(new Error("INVALID_JSON_RESPONSE"))}
        resolve({statusCode:res.statusCode,doc});
      });
    });
    req.on("error",reject); req.end();
  });
}

let response;
try{response=await doRequest(configuredUrl)}
catch(e){
  finish("BLOCKED","M419D4_SINGLE_LIGHTBOX_READ_FAILED",{
    sample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
    configuration:{endpoint:redact(configuredUrl),environmentAudit:envAudit},
    networkRequestPerformed:true,error:String(e.message),
    nextMilestone:"M4.19D4A_LIGHTBOX_EXISTING_PROXY_ROUTE_AND_ENV_CONFIGURATION_BINDING"
  },3);
}

const raw={
  contract:"SCIIP_EXPLORER_4_M4_19D4_LIGHTBOX_SINGLE_RECORD_RAW_RESPONSE",
  version:VERSION,acquiredAt:new Date().toISOString(),
  sample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
  httpStatus:response.statusCode,
  responseSha:sha(response.doc),
  response:response.doc
};
write(rawPath,raw);

const hits=findAvailableSfCandidates(response.doc);
const objs=collectObjects(response.doc,[]);
const timestampKeys=["observationTimestamp","observedAt","reportDate","updatedAt","asOf","date","timestamp"];
const provenanceKeys=["sourceProvenance","provider","source","product","dataset","endpoint"];
const snapshotKeys=["sourceSnapshotEvidence","snapshotRef","evidenceRef","sourceUrl","url"];

function firstField(keys){
  for(const o of objs) for(const k of keys)
    if(o?.[k]!==undefined&&o?.[k]!==null&&o?.[k]!=="") return {key:k,value:o[k]};
  return null;
}
const ts=firstField(timestampKeys);
const prov=firstField(provenanceKeys);
const snap=firstField(snapshotKeys);

const uniqueValues=[...new Set(hits.map(h=>h.value))];
const exactSemanticProof=hits.length>0 && uniqueValues.length===1;
const completeEvidenceProof=exactSemanticProof && !!ts && !!prov;

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4_LIGHTBOX_SINGLE_RECORD_DRY_RUN_AUDIT",
  version:VERSION,generatedAt:new Date().toISOString(),
  sample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
  responseSha:raw.responseSha,
  availableSfCandidateCount:hits.length,
  uniqueAvailableSfValues:uniqueValues,
  candidateFields:hits.map(h=>({field:h.pathKey,value:h.value,confidence:h.confidence})),
  timestampEvidence:ts,
  provenanceEvidence:prov,
  snapshotReferenceEvidence:snap,
  sourceNativeAvailableSfProven:exactSemanticProof,
  completeRefreshEvidenceContractProven:completeEvidenceProof
};
write(auditPath,audit);

if(!exactSemanticProof){
  finish("PASSED","M419D4_LIGHTBOX_SINGLE_RECORD_DRY_RUN_COMPLETED_AVAILABLE_SF_NOT_PROVEN",{
    qualification:audit,
    networkRequestPerformed:true,
    rawResponsePersisted:true,
    rawResponsePath:rawPath,
    nextMilestone:"M4.19D5_LIGHTBOX_FIELD_SEMANTICS_GAP_DECISION_AND_ALTERNATE_SOURCE_POLICY"
  },0);
}

if(!completeEvidenceProof){
  finish("PASSED","M419D4_LIGHTBOX_SOURCE_NATIVE_AVAILABLE_SF_PROVEN_REFRESH_EVIDENCE_CONTRACT_INCOMPLETE",{
    qualification:audit,
    networkRequestPerformed:true,
    rawResponsePersisted:true,
    rawResponsePath:rawPath,
    nextMilestone:"M4.19D5_LIGHTBOX_PROVENANCE_TIMESTAMP_BINDING_COMPLETION_POLICY"
  },0);
}

finish("PASSED","M419D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFIED",{
  qualification:audit,
  networkRequestPerformed:true,
  rawResponsePersisted:true,
  rawResponsePath:rawPath,
  nextMilestone:"M4.19D5_LIGHTBOX_BOUNDED_MULTI_RECORD_DRY_RUN_QUALIFICATION"
},0);
