#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {
  CONTRACT,VERSION,sha,findAvailableSf,firstEvidence
} from "./M419D4ILiveRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4I_SINGLE_LIGHTBOX_POST_READ");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const h=path.join(ev,"m4-19d4h-lightbox-enrich-request-contract-certification.json");
const launcher=path.join(ev,"m4-19d4h-corrected-single-record-post-dry-run-launcher.json");
const resultPath=path.join(ev,"m4-19d4i-lightbox-single-record-post-dry-run-qualification.json");
const rawPath=path.join(ev,"m4-19d4i-lightbox-single-record-post-raw-response.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");

const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),
    ...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
    },
    safety:{
      singleReadOnlyExternalRequestMaximum:1,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      evidenceFabricated:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [h,launcher]) if(!fs.existsSync(p)) finish("BLOCKED","M419D4I_PREREQUISITE_MISSING",{path:p},3);

const hdoc=JSON.parse(fs.readFileSync(h,"utf8"));
if(hdoc?.state!=="M419D4H_LIGHTBOX_ENRICH_POST_REQUEST_CONTRACT_CERTIFIED_SINGLE_RECORD_DRY_RUN_REPAIRED")
  finish("BLOCKED","M419D4I_M419D4H_REPAIRED_STATE_REQUIRED",{observed:hdoc?.state??null},3);

const ldoc=JSON.parse(fs.readFileSync(launcher,"utf8"));
if(ldoc?.method!=="POST") finish("BLOCKED","M419D4I_POST_METHOD_REQUIRED",{observed:ldoc?.method??null},3);
if(!authorized) finish("BLOCKED","M419D4I_EXPLICIT_SINGLE_POST_READ_AUTHORIZATION_REQUIRED",{
  authorizationArgument:"AUTHORIZE_M419D4I_SINGLE_LIGHTBOX_POST_READ",
  networkRequestPerformed:false
},3);

const endpoint=ldoc.endpoint;
const body=JSON.stringify(ldoc.body);

function doPost(url){
  return new Promise((resolve,reject)=>{
    const u=new URL(url);
    if(u.protocol!=="http:" || !["127.0.0.1","localhost"].includes(u.hostname))
      return reject(new Error("ONLY_LOCAL_LIGHTBOX_PROXY_ALLOWED"));
    const req=http.request(u,{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "accept":"application/json",
        "content-length":Buffer.byteLength(body)
      }
    },res=>{
      let data="";
      res.on("data",c=>data+=c);
      res.on("end",()=>{
        let doc=null;
        try{doc=JSON.parse(data)}catch{}
        resolve({statusCode:res.statusCode,headers:res.headers,raw:data,doc});
      });
    });
    req.on("error",reject);
    req.write(body);
    req.end();
  });
}

let resp;
try{resp=await doPost(endpoint);}
catch(e){
  finish("BLOCKED","M419D4I_SINGLE_LIGHTBOX_POST_READ_FAILED",{
    networkRequestPerformed:true,error:String(e.message)
  },3);
}

const rawArtifact={
  contract:"SCIIP_EXPLORER_4_M4_19D4I_LIGHTBOX_SINGLE_RECORD_POST_RAW_RESPONSE",
  version:VERSION,
  acquiredAt:new Date().toISOString(),
  request:{
    endpoint,
    method:"POST",
    bodySha:sha(ldoc.body),
    subject:ldoc.body?.subject??null,
    requested:ldoc.body?.requested??null
  },
  response:{
    statusCode:resp.statusCode,
    bodySha:sha(resp.raw),
    jsonParsed:!!resp.doc,
    body:resp.doc??resp.raw
  }
};
write(rawPath,rawArtifact);

if(resp.statusCode<200||resp.statusCode>=300){
  finish("BLOCKED","M419D4I_LIGHTBOX_POST_RETURNED_NON_SUCCESS",{
    networkRequestPerformed:true,httpStatus:resp.statusCode,
    rawResponsePath:rawPath
  },3);
}
if(!resp.doc){
  finish("BLOCKED","M419D4I_LIGHTBOX_POST_RESPONSE_NOT_JSON",{
    networkRequestPerformed:true,httpStatus:resp.statusCode,
    rawResponsePath:rawPath
  },3);
}

const hits=findAvailableSf(resp.doc);
const values=[...new Set(hits.map(h=>h.value))];

const timestamp=firstEvidence(resp.doc,[
  "observationTimestamp","observedAt","updatedAt","reportDate","asOf","timestamp","date"
]);
const provenance=firstEvidence(resp.doc,[
  "sourceProvenance","provider","source","dataset","product","endpoint"
]);
const sourceIdentity=firstEvidence(resp.doc,[
  "sourcePropertyId","propertyId","parcelId","lightboxId","id"
]);

const sourceNativeAvailableSfProven=hits.length>0&&values.length===1;
const completeObservationEvidence=sourceNativeAvailableSfProven&&!!timestamp&&!!provenance;

let state,next;
if(!sourceNativeAvailableSfProven){
  state="M419D4I_LIGHTBOX_LIVE_POST_SUCCEEDED_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT";
  next="M4.19D5_LIGHTBOX_FIELD_SEMANTICS_GAP_DECISION_AND_ALTERNATE_SOURCE_POLICY";
}else if(!completeObservationEvidence){
  state="M419D4I_LIGHTBOX_LIVE_POST_AVAILABLE_SF_PRESENT_OBSERVATION_EVIDENCE_INCOMPLETE";
  next="M4.19D5_LIGHTBOX_PROVENANCE_TIMESTAMP_BINDING_COMPLETION_POLICY";
}else{
  state="M419D4I_LIGHTBOX_LIVE_POST_SOURCE_NATIVE_AVAILABLE_SF_QUALIFIED";
  next="M4.19D4J_LIGHTBOX_BOUNDED_MULTI_RECORD_DRY_RUN_QUALIFICATION";
}

finish("PASSED",state,{
  networkRequestPerformed:true,
  httpStatus:resp.statusCode,
  qualification:{
    sourceNativeAvailableSfProven,
    availableSfCandidateCount:hits.length,
    uniqueAvailableSfValues:values,
    availableSfCandidates:hits,
    observationTimestampEvidence:timestamp,
    provenanceEvidence:provenance,
    sourceIdentityEvidence:sourceIdentity,
    completeObservationEvidence
  },
  artifacts:{rawResponse:rawPath},
  nextMilestone:next
},0);
