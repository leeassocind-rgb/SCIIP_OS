#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import {CONTRACT,VERSION,sha,normalizeAddress,collectObjects,candidateAddress} from "./M419D4AQ2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AQ2_SINGLE_LIGHTBOX_POINT_READ_RETRY");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const aq1Path=path.join(ev,"m4-19d4aq1-lightbox-proxy-runtime-bootstrap-readiness-recovery.json");
const retryPath=path.join(ev,"m4-19d4aq1-controlled-point-read-retry-preauthorization.json");
const apPath=path.join(ev,"m4-19d4ap-lightbox-point-read-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4aq2-controlled-single-lightbox-point-read-retry-parcel-evidence-qualification.json");
const rawPath=path.join(ev,"m4-19d4aq2-lightbox-point-read-retry-raw-response.json");
const auditPath=path.join(ev,"m4-19d4aq2-lightbox-parcel-evidence-qualification-audit.json");
const qualifiedPath=path.join(ev,"m4-19d4aq2-qualified-lightbox-parcel-evidence.json");
const envPath=path.join(app,".env.local");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      maximumControlledRetries:1,
      lightBoxPointRetryRequestsPerformed:extra?.execution?.lightBoxPointRetryRequestsPerformed??0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      syntheticEvidenceUsed:false,secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

for(const p of [aq1Path,retryPath,apPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AQ2_PREREQUISITE_MISSING",{path:p},3);
}
const aq1=JSON.parse(fs.readFileSync(aq1Path,"utf8"));
const retry=JSON.parse(fs.readFileSync(retryPath,"utf8"));
const pre=JSON.parse(fs.readFileSync(apPath,"utf8"));

if(aq1?.state!=="M419D4AQ1_LIGHTBOX_PROXY_RUNTIME_READY_SINGLE_POINT_READ_RETRY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"){
  finish("BLOCKED","M419D4AQ2_AQ1_READY_RETRY_PREAUTH_STATE_REQUIRED",{observed:aq1?.state??null},3);
}
if(retry?.contract!=="SCIIP_EXPLORER_4_M4_19D4AQ1_CONTROLLED_POINT_READ_RETRY_PREAUTHORIZATION"){
  finish("BLOCKED","M419D4AQ2_INVALID_RETRY_PREAUTHORIZATION",{},3);
}
if(!authorized){
  finish("BLOCKED","M419D4AQ2_EXPLICIT_CONTROLLED_RETRY_AUTHORIZATION_REQUIRED",{
    execution:{lightBoxPointRetryRequestsPerformed:0},
    authorizationArgument:"AUTHORIZE_M419D4AQ2_SINGLE_LIGHTBOX_POINT_READ_RETRY"
  },3);
}

function parseEnv(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const m=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!m)continue;
    let v=m[2].trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}
const fileEnv=fs.existsSync(envPath)?parseEnv(fs.readFileSync(envPath,"utf8")):{};
const env={...fileEnv,...process.env};

const base=(env.LIGHTBOX_PROXY_URL||env.VITE_LIGHTBOX_PROXY_URL||"http://127.0.0.1:8787").replace(/\/+$/,"");
const url=new URL(base+pre.requestContract.route);
for(const [k,v] of Object.entries(pre.requestContract.query||{})) url.searchParams.set(k,String(v));

function requestOnce(u){
  const lib=u.protocol==="https:"?https:http;
  return new Promise((resolve,reject)=>{
    const req=lib.request(u,{method:"GET",headers:{accept:"application/json","user-agent":"SCIIP-Explorer-4.0-M4.19D4AQ2"}},res=>{
      let raw="";
      res.on("data",c=>raw+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,raw}));
    });
    req.on("error",reject);
    req.end();
  });
}

// Immediate readiness check before the single controlled retry.
function selfTest(){
  return new Promise(resolve=>{
    const req=http.get("http://127.0.0.1:8787/api/lightbox/self-test",res=>{
      let raw="";res.on("data",c=>raw+=c);res.on("end",()=>{
        let doc=null;try{doc=JSON.parse(raw)}catch{}
        resolve({httpStatus:res.statusCode,doc});
      });
    });
    req.on("error",()=>resolve({httpStatus:null,doc:null}));
  });
}
const self=await selfTest();
if(!(self.httpStatus===200&&self.doc?.status==="READY"&&self.doc?.configured===true)){
  finish("BLOCKED","M419D4AQ2_PRE_RETRY_SELF_TEST_NOT_READY",{
    execution:{lightBoxPointRetryRequestsPerformed:0},
    selfTest:{httpStatus:self.httpStatus,status:self.doc?.status??null,configured:self.doc?.configured??null}
  },3);
}

let response,error=null;
try{response=await requestOnce(url)}catch(e){error=String(e?.message||e)}
if(error){
  finish("BLOCKED","M419D4AQ2_CONTROLLED_LIGHTBOX_POINT_RETRY_TRANSPORT_FAILED",{
    execution:{lightBoxPointRetryRequestsPerformed:1,error}
  },3);
}

fs.writeFileSync(rawPath,response.raw);
const rawSha=sha(response.raw);
let doc=null;try{doc=JSON.parse(response.raw)}catch{}
if(!doc){
  finish("BLOCKED","M419D4AQ2_LIGHTBOX_POINT_RETRY_RESPONSE_PARSE_FAILED",{
    execution:{lightBoxPointRetryRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha},
    artifacts:{rawResponse:rawPath}
  },3);
}

if(response.statusCode<200||response.statusCode>=300){
  finish("BLOCKED","M419D4AQ2_LIGHTBOX_POINT_RETRY_HTTP_NOT_SUCCESSFUL",{
    execution:{
      lightBoxPointRetryRequestsPerformed:1,httpStatus:response.statusCode,
      errorCode:doc?.error?.code??null,errorMessage:doc?.error?.message??null,
      rawResponseSha256:rawSha
    },
    artifacts:{rawResponse:rawPath},
    nextMilestone:"M4.19D4AR_LIGHTBOX_POINT_RETRY_RESPONSE_FORENSICS"
  },3);
}

const objects=collectObjects(doc,[]);
const parcelish=objects.filter(o=>{
  if(!o||Array.isArray(o))return false;
  const keys=Object.keys(o).map(x=>x.toLowerCase());
  return keys.some(k=>["apn","parcelid","parcel_id","propertyid","property_id","geometry","address","formattedaddress","formatted_address"].includes(k));
});
if(parcelish.length===0){
  finish("BLOCKED","M419D4AQ2_NO_SOURCE_NATIVE_PARCEL_CANDIDATES_FOUND",{
    execution:{lightBoxPointRetryRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha},
    qualification:{parcelCandidateCount:0},
    artifacts:{rawResponse:rawPath}
  },3);
}

const inputAddr=pre?.boundAddress?.input??"";
const inputNorm=normalizeAddress(inputAddr);
const inputNums=inputNorm.match(/\d+/g)||[];

const enriched=parcelish.map((o,i)=>{
  const addr=candidateAddress(o);
  const norm=normalizeAddress(addr);
  const nums=norm.match(/\d+/g)||[];
  const numericOverlap=inputNums.some(n=>nums.includes(n));
  const addressMatch=!!addr&&(numericOverlap||norm.includes(inputNorm)||inputNorm.includes(norm));
  const apn=o.apn??o.APN??o.parcelId??o.parcel_id??null;
  const propertyId=o.propertyId??o.property_id??o.id??null;
  const hasGeometry=!!(o.geometry||o.coordinates||o.centroid||o.location);
  return {index:i,address:addr,apn,propertyId,hasGeometry,addressMatch,raw:o};
});
const matches=enriched.filter(x=>x.addressMatch);
const selected=matches[0]??enriched[0];
const contradictory=matches.length===0&&enriched.some(x=>x.address);

if(contradictory){
  write(auditPath,{
    contract:"SCIIP_EXPLORER_4_M4_19D4AQ2_LIGHTBOX_PARCEL_EVIDENCE_QUALIFICATION_AUDIT",
    version:VERSION,generatedAt:new Date().toISOString(),
    inputAddress:inputAddr,parcelCandidateCount:enriched.length,addressMatchedCandidateCount:0,
    candidates:enriched.map(({raw,...x})=>x),rawResponseSha256:rawSha
  });
  finish("BLOCKED","M419D4AQ2_LIGHTBOX_PARCEL_ADDRESS_CONTRADICTION_BLOCKED",{
    execution:{lightBoxPointRetryRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha},
    qualification:{parcelCandidateCount:enriched.length,addressMatchedCandidateCount:0},
    artifacts:{rawResponse:rawPath,qualificationAudit:auditPath}
  },3);
}

const observedAt=new Date().toISOString();
const qualified={
  contract:"SCIIP_EXPLORER_4_M4_19D4AQ2_QUALIFIED_LIGHTBOX_PARCEL_EVIDENCE",
  version:VERSION,generatedAt:observedAt,
  boundIdentity:pre.boundIdentity,boundAddress:pre.boundAddress,boundCoordinates:pre.boundCoordinates,
  provider:"LIGHTBOX",observationTimestamp:observedAt,sourceNative:true,
  rawResponsePath:rawPath,rawResponseSha256:rawSha,
  candidateCount:enriched.length,addressMatchedCandidateCount:matches.length,
  selectedCandidate:{
    index:selected.index,address:selected.address,apn:selected.apn,
    propertyId:selected.propertyId,hasGeometry:selected.hasGeometry,addressMatch:selected.addressMatch,raw:selected.raw
  },
  requestHash:pre.requestHash,synthetic:false
};
write(qualifiedPath,qualified);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AQ2_LIGHTBOX_PARCEL_EVIDENCE_QUALIFICATION_AUDIT",
  version:VERSION,generatedAt:observedAt,
  inputAddress:inputAddr,boundCoordinates:pre.boundCoordinates,
  parcelCandidateCount:enriched.length,addressMatchedCandidateCount:matches.length,
  selectedCandidate:{
    index:selected.index,address:selected.address,apn:selected.apn,
    propertyId:selected.propertyId,hasGeometry:selected.hasGeometry,addressMatch:selected.addressMatch
  },
  candidates:enriched.map(({raw,...x})=>x),
  rawResponseSha256:rawSha,automaticRetry:false,lightBoxPointRetryRequestsPerformed:1
};
write(auditPath,audit);

finish("PASSED","M419D4AQ2_CONTROLLED_LIGHTBOX_POINT_READ_RETRY_EXECUTED_PARCEL_EVIDENCE_QUALIFIED",{
  execution:{
    lightBoxPointRetryRequestsPerformed:1,httpStatus:response.statusCode,
    rawResponseSha256:rawSha,automaticRetry:false
  },
  qualification:{
    canonicalPropertyId:pre?.boundIdentity?.canonicalPropertyId??null,
    sourcePropertyId:pre?.boundIdentity?.sourcePropertyId??null,
    inputAddress:inputAddr,
    latitude:pre?.boundCoordinates?.latitude??null,
    longitude:pre?.boundCoordinates?.longitude??null,
    parcelCandidateCount:enriched.length,
    addressMatchedCandidateCount:matches.length,
    selectedParcelAddress:selected.address,
    selectedApn:selected.apn,
    selectedProviderPropertyId:selected.propertyId,
    selectedHasGeometry:selected.hasGeometry,
    sourceNativeParcelEvidenceQualified:true
  },
  artifacts:{
    rawResponse:rawPath,
    qualifiedParcelEvidence:qualifiedPath,
    qualificationAudit:auditPath
  },
  nextMilestone:"M4.19D4AR_SOURCE_NATIVE_AVAILABLE_SF_PATH_QUALIFICATION_USING_QUALIFIED_LIGHTBOX_PARCEL"
},0);
