#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import {CONTRACT,VERSION,sha,validPair,normalizeAddress} from "./M419D4AJRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AJ_SINGLE_GEOCODE");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const preauthPath=path.join(ev,"m4-19d4ai-certified-address-geocode-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4aj-controlled-single-geocode-execution-coordinate-evidence-binding.json");
const rawPath=path.join(ev,"m4-19d4aj-geocode-raw-response.json");
const auditPath=path.join(ev,"m4-19d4aj-coordinate-evidence-binding-audit.json");
const boundPath=path.join(ev,"m4-19d4aj-bound-coordinate-evidence.json");
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
      maximumGeocodeRequests:1,automaticRetry:false,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      syntheticCoordinatesUsed:false,secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

if(!fs.existsSync(preauthPath)) finish("BLOCKED","M419D4AJ_PREAUTHORIZATION_MANIFEST_MISSING",{path:preauthPath},3);
const pre=JSON.parse(fs.readFileSync(preauthPath,"utf8"));
if(pre?.contract!=="SCIIP_EXPLORER_4_M4_19D4AI_CERTIFIED_ADDRESS_GEOCODE_PREAUTHORIZATION_MANIFEST"){
  finish("BLOCKED","M419D4AJ_INVALID_PREAUTHORIZATION_MANIFEST",{},3);
}
if(!authorized){
  finish("BLOCKED","M419D4AJ_EXPLICIT_SINGLE_GEOCODE_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4AJ_SINGLE_GEOCODE",
    geocodeRequestsPerformed:0
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

// Prefer existing Google Maps key because the app already uses Google Maps.
// No key value is persisted or printed.
const key=env.GOOGLE_MAPS_API_KEY||env.VITE_GOOGLE_MAPS_API_KEY||null;
if(!key){
  finish("BLOCKED","M419D4AJ_GOOGLE_GEOCODE_CREDENTIAL_NOT_BOUND",{geocodeRequestsPerformed:0},3);
}

const address=pre?.certifiedLocator?.address;
const canonicalPropertyId=pre?.boundIdentity?.canonicalPropertyId;
const sourcePropertyId=pre?.boundIdentity?.sourcePropertyId;
if(!address||!canonicalPropertyId||!sourcePropertyId){
  finish("BLOCKED","M419D4AJ_PREAUTHORIZED_BINDING_INCOMPLETE",{},3);
}

const urlPath=`/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`;

function getJson(){
  return new Promise((resolve,reject)=>{
    const req=https.request({
      hostname:"maps.googleapis.com",
      path:urlPath,
      method:"GET",
      headers:{accept:"application/json","user-agent":"SCIIP-Explorer-4.0-M4.19D4AJ"}
    },res=>{
      let raw="";res.on("data",c=>raw+=c);res.on("end",()=>resolve({statusCode:res.statusCode,raw,headers:res.headers}));
    });
    req.on("error",reject);
    req.end();
  });
}

let response,error=null;
try{response=await getJson()}catch(e){error=String(e?.message||e)}
if(error){
  finish("BLOCKED","M419D4AJ_GEOCODE_TRANSPORT_FAILED",{geocodeRequestsPerformed:1,error},3);
}

fs.writeFileSync(rawPath,response.raw);
const rawSha=sha(response.raw);
let doc=null;
try{doc=JSON.parse(response.raw)}catch{}
if(!doc){
  finish("BLOCKED","M419D4AJ_GEOCODE_RESPONSE_PARSE_FAILED",{
    geocodeRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha,
    artifacts:{rawResponse:rawPath}
  },3);
}

if(response.statusCode<200||response.statusCode>=300||doc.status!=="OK"||!Array.isArray(doc.results)||doc.results.length===0){
  finish("BLOCKED","M419D4AJ_GEOCODE_RESPONSE_NOT_QUALIFIED",{
    geocodeRequestsPerformed:1,httpStatus:response.statusCode,providerStatus:doc.status??null,
    providerErrorMessage:doc.error_message??null,rawResponseSha256:rawSha,
    artifacts:{rawResponse:rawPath},
    nextMilestone:"M4.19D4AK_GEOCODE_RESPONSE_FORENSICS"
  },3);
}

const first=doc.results[0];
const lat=first?.geometry?.location?.lat;
const lng=first?.geometry?.location?.lng;
if(!validPair(lat,lng)){
  finish("BLOCKED","M419D4AJ_GEOCODE_COORDINATES_INVALID_OR_PLACEHOLDER",{
    geocodeRequestsPerformed:1,httpStatus:response.statusCode,providerStatus:doc.status,
    rawResponseSha256:rawSha,artifacts:{rawResponse:rawPath}
  },3);
}

const formatted=first?.formatted_address??"";
const inputNorm=normalizeAddress(address);
const formattedNorm=normalizeAddress(formatted);
// Require at least street-number overlap or normalized string containment.
const inputNums=(inputNorm.match(/\d+/g)||[]);
const fmtNums=(formattedNorm.match(/\d+/g)||[]);
const numOverlap=inputNums.some(n=>fmtNums.includes(n));
const addressMatchEvidence=numOverlap || formattedNorm.includes(inputNorm) || inputNorm.includes(formattedNorm);
if(!addressMatchEvidence){
  finish("BLOCKED","M419D4AJ_GEOCODE_ADDRESS_MATCH_NOT_PROVEN",{
    geocodeRequestsPerformed:1,httpStatus:response.statusCode,providerStatus:doc.status,
    formattedAddress:formatted,rawResponseSha256:rawSha,artifacts:{rawResponse:rawPath}
  },3);
}

const observedAt=new Date().toISOString();
const bound={
  contract:"SCIIP_EXPLORER_4_M4_19D4AJ_BOUND_COORDINATE_EVIDENCE",
  version:VERSION,
  generatedAt:observedAt,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  certifiedAddress:{input:address,formattedProviderAddress:formatted},
  coordinateObservation:{
    latitude:Number(lat),
    longitude:Number(lng),
    provider:"GOOGLE_MAPS_GEOCODING_API",
    observationTimestamp:observedAt,
    placeId:first?.place_id??null,
    locationType:first?.geometry?.location_type??null,
    addressMatchEvidence:true,
    rawResponsePath:rawPath,
    rawResponseSha256:rawSha
  },
  preauthorization:{
    manifestPath:preauthPath,
    requestHash:pre?.requestHash??null
  },
  sourceBacked:true,
  synthetic:false
};
write(boundPath,bound);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AJ_COORDINATE_EVIDENCE_BINDING_AUDIT",
  version:VERSION,
  generatedAt:observedAt,
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  geocodeRequestsPerformed:1,
  provider:"GOOGLE_MAPS_GEOCODING_API",
  httpStatus:response.statusCode,
  providerStatus:doc.status,
  formattedAddress:formatted,
  latitude:Number(lat),
  longitude:Number(lng),
  addressMatchEvidence:true,
  rawResponseSha256:rawSha,
  automaticRetry:false
};
write(auditPath,audit);

finish("PASSED","M419D4AJ_SINGLE_GEOCODE_EXECUTED_COORDINATE_EVIDENCE_BOUND",{
  execution:{
    geocodeRequestsPerformed:1,
    httpStatus:response.statusCode,
    providerStatus:doc.status,
    provider:"GOOGLE_MAPS_GEOCODING_API",
    rawResponseSha256:rawSha,
    automaticRetry:false
  },
  qualification:{
    canonicalPropertyId,sourcePropertyId,
    address,
    formattedAddress:formatted,
    latitude:Number(lat),
    longitude:Number(lng),
    addressMatchEvidence:true,
    zeroZeroRejected:true,
    nullCoordinatesRejected:true,
    sourceNativeCoordinateQualified:true
  },
  artifacts:{rawResponse:rawPath,coordinateBindingAudit:auditPath,boundCoordinateEvidence:boundPath},
  nextMilestone:"M4.19D4AK_CORRECTED_LIGHTBOX_POINT_READ_PREAUTHORIZATION"
},0);
