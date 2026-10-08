#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import {CONTRACT,VERSION,sha,validPair,normalizeAddress} from "./M419D4AORuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const preauthPath=path.join(ev,"m4-19d4an4-single-geocode-repreauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4ao-controlled-single-google-geocode-evidence-read-coordinate-binding.json");
const rawPath=path.join(ev,"m4-19d4ao-google-geocode-evidence-raw-response.json");
const boundPath=path.join(ev,"m4-19d4ao-bound-coordinate-evidence.json");
const auditPath=path.join(ev,"m4-19d4ao-coordinate-binding-audit.json");
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
      maximumGeocodeRequests:1,
      geocodeRequestsPerformed:extra?.execution?.geocodeRequestsPerformed??0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      syntheticCoordinatesUsed:false,secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

if(!fs.existsSync(preauthPath)) finish("BLOCKED","M419D4AO_PREAUTHORIZATION_MANIFEST_MISSING",{path:preauthPath},3);
const pre=JSON.parse(fs.readFileSync(preauthPath,"utf8"));
if(pre?.contract!=="SCIIP_EXPLORER_4_M4_19D4AN4_SINGLE_GEOCODE_REPREAUTHORIZATION_MANIFEST"){
  finish("BLOCKED","M419D4AO_INVALID_REPREAUTHORIZATION_MANIFEST",{},3);
}
if(!authorized){
  finish("BLOCKED","M419D4AO_EXPLICIT_SINGLE_EVIDENCE_READ_AUTHORIZATION_REQUIRED",{
    execution:{geocodeRequestsPerformed:0},
    authorizationArgument:"AUTHORIZE_M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ"
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
const key=env.GOOGLE_MAPS_API_KEY||env.VITE_GOOGLE_MAPS_API_KEY||null;
if(!key){
  finish("BLOCKED","M419D4AO_GOOGLE_MAPS_CREDENTIAL_NOT_BOUND",{execution:{geocodeRequestsPerformed:0}},3);
}

const address=pre?.certifiedAddress?.address;
const normalizedAddress=pre?.certifiedAddress?.normalizedAddress;
const canonicalPropertyId=pre?.boundIdentity?.canonicalPropertyId;
const sourcePropertyId=pre?.boundIdentity?.sourcePropertyId;
if(!address||!canonicalPropertyId||!sourcePropertyId){
  finish("BLOCKED","M419D4AO_PREAUTHORIZED_BINDING_INCOMPLETE",{execution:{geocodeRequestsPerformed:0}},3);
}

const requestPath=`/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`;

function requestOnce(){
  return new Promise((resolve,reject)=>{
    const req=https.request({
      hostname:"maps.googleapis.com",
      path:requestPath,
      method:"GET",
      headers:{accept:"application/json","user-agent":"SCIIP-Explorer-4.0-M4.19D4AO"}
    },res=>{
      let raw="";
      res.on("data",c=>raw+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,raw}));
    });
    req.on("error",reject);
    req.end();
  });
}

let response,error=null;
try{response=await requestOnce()}catch(e){error=String(e?.message||e)}
if(error){
  finish("BLOCKED","M419D4AO_GEOCODE_TRANSPORT_FAILED",{
    execution:{geocodeRequestsPerformed:1,error}
  },3);
}

fs.writeFileSync(rawPath,response.raw);
const rawSha=sha(response.raw);
let doc=null; try{doc=JSON.parse(response.raw)}catch{}
if(!doc){
  finish("BLOCKED","M419D4AO_GEOCODE_RESPONSE_PARSE_FAILED",{
    execution:{geocodeRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha},
    artifacts:{rawResponse:rawPath}
  },3);
}

if(response.statusCode<200||response.statusCode>=300||doc.status!=="OK"||!Array.isArray(doc.results)||doc.results.length===0){
  finish("BLOCKED","M419D4AO_GEOCODE_RESPONSE_NOT_QUALIFIED",{
    execution:{
      geocodeRequestsPerformed:1,httpStatus:response.statusCode,
      providerStatus:doc.status??null,providerErrorMessage:doc.error_message??null,
      rawResponseSha256:rawSha
    },
    artifacts:{rawResponse:rawPath},
    nextMilestone:"M4.19D4AP_GOOGLE_GEOCODE_EVIDENCE_RESPONSE_FORENSICS"
  },3);
}

const first=doc.results[0];
const lat=first?.geometry?.location?.lat;
const lng=first?.geometry?.location?.lng;
if(!validPair(lat,lng)){
  finish("BLOCKED","M419D4AO_GEOCODE_COORDINATES_INVALID_OR_PLACEHOLDER",{
    execution:{geocodeRequestsPerformed:1,httpStatus:response.statusCode,providerStatus:doc.status,rawResponseSha256:rawSha},
    artifacts:{rawResponse:rawPath}
  },3);
}

const formatted=first?.formatted_address??"";
const inputNorm=normalizeAddress(address);
const formattedNorm=normalizeAddress(formatted);
const inputNums=inputNorm.match(/\d+/g)||[];
const fmtNums=formattedNorm.match(/\d+/g)||[];
const numOverlap=inputNums.some(n=>fmtNums.includes(n));
const addressMatchEvidence=numOverlap || formattedNorm.includes(inputNorm) || inputNorm.includes(formattedNorm);

if(!addressMatchEvidence){
  finish("BLOCKED","M419D4AO_GEOCODE_ADDRESS_MATCH_NOT_PROVEN",{
    execution:{geocodeRequestsPerformed:1,httpStatus:response.statusCode,providerStatus:doc.status,rawResponseSha256:rawSha},
    qualification:{formattedAddress:formatted,addressMatchEvidence:false},
    artifacts:{rawResponse:rawPath}
  },3);
}

const observedAt=new Date().toISOString();
const bound={
  contract:"SCIIP_EXPLORER_4_M4_19D4AO_BOUND_COORDINATE_EVIDENCE",
  version:VERSION,
  generatedAt:observedAt,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  certifiedAddress:{input:address,normalizedAddress,formattedProviderAddress:formatted},
  coordinateObservation:{
    latitude:Number(lat),
    longitude:Number(lng),
    provider:"GOOGLE_MAPS_GEOCODING_API",
    observationTimestamp:observedAt,
    placeId:first?.place_id??null,
    locationType:first?.geometry?.location_type??null,
    partialMatch:first?.partial_match??false,
    addressMatchEvidence:true,
    rawResponsePath:rawPath,
    rawResponseSha256:rawSha
  },
  sourceBacked:true,
  synthetic:false,
  executionBinding:{
    repreauthorizationManifestPath:preauthPath,
    requestHash:pre?.requestHash??null
  }
};
write(boundPath,bound);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AO_COORDINATE_BINDING_AUDIT",
  version:VERSION,
  generatedAt:observedAt,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  provider:"GOOGLE_MAPS_GEOCODING_API",
  httpStatus:response.statusCode,
  providerStatus:doc.status,
  formattedAddress:formatted,
  latitude:Number(lat),
  longitude:Number(lng),
  addressMatchEvidence:true,
  rawResponseSha256:rawSha,
  automaticRetry:false,
  geocodeRequestsPerformed:1
};
write(auditPath,audit);

finish("PASSED","M419D4AO_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_EXECUTED_COORDINATE_EVIDENCE_BOUND",{
  execution:{
    geocodeRequestsPerformed:1,
    httpStatus:response.statusCode,
    providerStatus:doc.status,
    provider:"GOOGLE_MAPS_GEOCODING_API",
    rawResponseSha256:rawSha,
    automaticRetry:false
  },
  qualification:{
    canonicalPropertyId,sourcePropertyId,address,formattedAddress:formatted,
    latitude:Number(lat),longitude:Number(lng),
    placeId:first?.place_id??null,
    locationType:first?.geometry?.location_type??null,
    partialMatch:first?.partial_match??false,
    addressMatchEvidence:true,
    sourceNativeCoordinateQualified:true,
    nullCoordinatesRejected:true,
    zeroZeroRejected:true
  },
  artifacts:{
    rawResponse:rawPath,
    boundCoordinateEvidence:boundPath,
    coordinateBindingAudit:auditPath
  },
  nextMilestone:"M4.19D4AP_LIGHTBOX_POINT_READ_PREAUTHORIZATION_USING_BOUND_GOOGLE_COORDINATES"
},0);
