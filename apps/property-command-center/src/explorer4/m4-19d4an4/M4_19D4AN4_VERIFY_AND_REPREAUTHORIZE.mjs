#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import {CONTRACT,VERSION,sha,classifyGoogle} from "./M419D4AN4Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AN4_GOOGLE_ENABLEMENT_CHECK");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const an3Path=path.join(ev,"m4-19d4an3-external-geocoder-google-enablement-decision.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4an4-google-geocoding-enablement-verification-single-read-repreauthorization.json");
const rawPath=path.join(ev,"m4-19d4an4-google-geocoding-enablement-check-raw-response.json");
const manifestPath=path.join(ev,"m4-19d4an4-single-geocode-repreauthorization-manifest.json");
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
      maximumVerificationRequests:1,
      verificationRequestsPerformed:extra?.verification?.requestsPerformed??0,
      geocodeExecutionRequestsPerformed:0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [an3Path,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN4_PREREQUISITE_MISSING",{path:p},3);
}
const an3=JSON.parse(fs.readFileSync(an3Path,"utf8"));
if(an3?.state!=="M419D4AN3_GOOGLE_GEOCODING_ENABLEMENT_SELECTED_OPERATOR_CLOUD_CONFIGURATION_REQUIRED"){
  finish("BLOCKED","M419D4AN4_AN3_GOOGLE_ENABLEMENT_DECISION_REQUIRED",{observed:an3?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const address=locator?.locator?.address;
const normalizedAddress=locator?.locator?.normalizedAddress;
const canonicalPropertyId=locator?.boundIdentity?.canonicalPropertyId;
const sourcePropertyId=locator?.boundIdentity?.sourcePropertyId;

if(!authorized){
  finish("BLOCKED","M419D4AN4_EXPLICIT_ENABLEMENT_CHECK_AUTHORIZATION_REQUIRED",{
    verification:{requestsPerformed:0},
    authorizationArgument:"AUTHORIZE_M419D4AN4_GOOGLE_ENABLEMENT_CHECK"
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
  finish("BLOCKED","M419D4AN4_GOOGLE_MAPS_CREDENTIAL_NOT_BOUND",{
    verification:{requestsPerformed:0}
  },3);
}

const requestPath=`/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`;

function requestOnce(){
  return new Promise((resolve,reject)=>{
    const req=https.request({
      hostname:"maps.googleapis.com",
      path:requestPath,
      method:"GET",
      headers:{accept:"application/json","user-agent":"SCIIP-Explorer-4.0-M4.19D4AN4"}
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
  finish("BLOCKED","M419D4AN4_GOOGLE_ENABLEMENT_CHECK_TRANSPORT_FAILED",{
    verification:{requestsPerformed:1,error}
  },3);
}

fs.writeFileSync(rawPath,response.raw);
const rawSha=sha(response.raw);
let doc=null; try{doc=JSON.parse(response.raw)}catch{}
const classification=doc?classifyGoogle(doc,response.statusCode):"GEOCODING_RESPONSE_PARSE_FAILURE";

if(classification!=="GEOCODING_ENABLED_AND_USABLE"){
  const state=classification==="GEOCODING_STILL_NOT_ENABLED"
    ?"M419D4AN4_GOOGLE_GEOCODING_STILL_NOT_ENABLED_OPERATOR_ACTION_REQUIRED"
    :"M419D4AN4_GOOGLE_GEOCODING_ENABLEMENT_CHECK_NOT_USABLE";
  finish("BLOCKED",state,{
    verification:{
      requestsPerformed:1,
      httpStatus:response.statusCode,
      providerStatus:doc?.status??null,
      providerErrorMessage:doc?.error_message??null,
      classification,
      rawResponseSha256:rawSha
    },
    artifacts:{rawResponse:rawPath},
    operatorAction: classification==="GEOCODING_STILL_NOT_ENABLED" ? {
      action:"ENABLE_GOOGLE_MAPS_GEOCODING_API_ON_EXISTING_PROJECT",
      note:"Enable the Geocoding API on the Google Cloud project tied to the existing SCIIP key, then rerun AN4."
    } : null
  },3);
}

// We intentionally do not promote this verification response into coordinate evidence.
// It is only capability verification. The next milestone gets the one governed evidence read.
const requestContract={
  provider:"GOOGLE_MAPS_GEOCODING_API",
  method:"GET",
  endpoint:"https://maps.googleapis.com/maps/api/geocode/json",
  input:{address,normalizedAddress,canonicalPropertyId,sourcePropertyId},
  evidenceRequirements:{
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    providerStatusOKRequired:true,
    latitudeRequired:true,
    longitudeRequired:true,
    formattedAddressRequired:true,
    addressMatchEvidenceRequired:true,
    nullCoordinatesMustBlock:true,
    zeroZeroMustBlock:true,
    contradictoryAddressMustBlock:true
  },
  executionPolicy:{
    maximumGeocodeRequests:1,
    automaticRetry:false,
    executionAuthorized:false,
    explicitAuthorizationRequired:true
  }
};
const requestHash=sha(JSON.stringify(requestContract));

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN4_SINGLE_GEOCODE_REPREAUTHORIZATION_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  certifiedAddress:{address,normalizedAddress},
  enablementVerification:{
    httpStatus:response.statusCode,
    providerStatus:doc.status,
    classification,
    rawResponsePath:rawPath,
    rawResponseSha256:rawSha
  },
  requestContract,
  requestHash,
  executionAuthorized:false,
  maximumGeocodeRequests:1,
  automaticRetry:false
};
write(manifestPath,manifest);

finish("PASSED","M419D4AN4_GOOGLE_GEOCODING_ENABLED_SINGLE_READ_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  verification:{
    requestsPerformed:1,
    httpStatus:response.statusCode,
    providerStatus:doc.status,
    classification,
    rawResponseSha256:rawSha
  },
  repreauthorization:{
    canonicalPropertyId,sourcePropertyId,address,normalizedAddress,
    requestHash,
    maximumGeocodeRequests:1,
    executionAuthorized:false,
    automaticRetry:false
  },
  artifacts:{
    rawResponse:rawPath,
    singleReadRepreauthorizationManifest:manifestPath
  },
  nextMilestone:"M4.19D4AO_CONTROLLED_SINGLE_GOOGLE_GEOCODE_EVIDENCE_READ_AND_COORDINATE_BINDING"
},0);
