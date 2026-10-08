#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION,sha,validLat,validLng,redact} from "./M419D4AH4Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AH4_SINGLE_EXTERNAL_COORDINATE_OBSERVATION");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const templatePath=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");
const priorPath=path.join(ev,"m4-19d4ah3-operator-external-coordinate-evidence-validation-binding.json");
const envPath=path.join(app,".env.local");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4ah4-external-coordinate-observation-evidence-capture.json");
const rawPath=path.join(ev,"m4-19d4ah4-coordinate-source-raw-response.json");
const auditPath=path.join(ev,"m4-19d4ah4-coordinate-evidence-capture-audit.json");
const logPath=path.join(ev,"m4-19d4ah4-coordinate-capture-proxy-runtime.log");

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
      maximumExternalCoordinateRequests:1,
      automaticRetry:false,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      syntheticCoordinatesUsed:false,
      guessedCoordinatesUsed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [templatePath,priorPath,proxyPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AH4_PREREQUISITE_MISSING",{path:p},3);
}
const prior=JSON.parse(fs.readFileSync(priorPath,"utf8"));
if(prior?.state!=="M419D4AH3_COORDINATE_EVIDENCE_INCOMPLETE_OR_INVALID"){
  finish("BLOCKED","M419D4AH4_D4AH3_INCOMPLETE_EVIDENCE_STATE_REQUIRED",{observed:prior?.state??null},3);
}
const template=JSON.parse(fs.readFileSync(templatePath,"utf8"));
const canonicalPropertyId=template.canonicalPropertyId;
const sourcePropertyId=template.sourcePropertyId;

// AH3 already established these coordinates were syntactically valid. AH4 does not treat
// them as authoritative; it uses them solely as a point locator for an external source read.
if(!validLat(template.latitude)||!validLng(template.longitude)){
  finish("BLOCKED","M419D4AH4_VALID_POINT_LOCATOR_REQUIRED",{},3);
}
if(!authorized){
  finish("BLOCKED","M419D4AH4_EXPLICIT_SINGLE_EXTERNAL_COORDINATE_OBSERVATION_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4AH4_SINGLE_EXTERNAL_COORDINATE_OBSERVATION",
    externalCoordinateRequestsPerformed:0
  },3);
}

function parseEnv(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#")) continue;
    const m=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!m) continue;
    let v=m[2].trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}
const fileEnv=fs.existsSync(envPath)?parseEnv(fs.readFileSync(envPath,"utf8")):{};
const childEnv={...process.env,...fileEnv,LIGHTBOX_PROXY_PORT:"8788"};
if(!childEnv.LIGHTBOX_API_KEY){
  finish("BLOCKED","M419D4AH4_LIGHTBOX_API_KEY_REQUIRED",{externalCoordinateRequestsPerformed:0},3);
}

fs.writeFileSync(logPath,"");
let exited=false;
const child=spawn(process.execPath,[proxyPath],{cwd:app,env:childEnv,stdio:["ignore","pipe","pipe"]});
child.on("exit",()=>{exited=true});
const cap=(s,c)=>fs.appendFileSync(logPath,`${new Date().toISOString()} ${s} ${c.toString()}`);
child.stdout.on("data",c=>cap("STDOUT",c)); child.stderr.on("data",c=>cap("STDERR",c));

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function request(method,route){
  return new Promise((resolve,reject)=>{
    const r=http.request({host:"127.0.0.1",port:8788,path:route,method,headers:{accept:"application/json"}},res=>{
      let raw="";res.on("data",c=>raw+=c);res.on("end",()=>resolve({statusCode:res.statusCode,headers:res.headers,raw}));
    });
    r.on("error",reject); r.end();
  });
}

let self=null;
for(let i=0;i<40;i++){
  if(exited)break;
  try{const r=await request("GET","/api/lightbox/self-test"); if(r.statusCode){self=r;break}}catch{}
  await sleep(150);
}
let selfJson=null; try{selfJson=JSON.parse(self?.raw||"")}catch{}
if(!self||self.statusCode!==200||selfJson?.status!=="READY"||selfJson?.configured!==true){
  if(!exited)child.kill("SIGTERM");
  finish("BLOCKED","M419D4AH4_PRE_OBSERVATION_SELF_TEST_NOT_READY",{
    selfTest:{httpStatus:self?.statusCode??null,status:selfJson?.status??null,configured:selfJson?.configured??null},
    externalCoordinateRequestsPerformed:0,
    artifacts:{runtimeLog:logPath}
  },3);
}

// The proxy exposes a purpose-built point parcel route. This single read both validates the
// point against LightBox and returns provider-native parcel evidence suitable for provenance.
const lat=Number(template.latitude), lng=Number(template.longitude);
const route=`/api/lightbox/parcel/by-point?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&limit=1&countryCode=us`;
let response=null,error=null;
try{response=await request("GET",route)}catch(e){error=String(e?.message||e)}

if(!exited){child.kill("SIGTERM");await sleep(100);}
if(error){
  finish("BLOCKED","M419D4AH4_EXTERNAL_COORDINATE_OBSERVATION_TRANSPORT_FAILED",{
    externalCoordinateRequestsPerformed:1,error,artifacts:{runtimeLog:logPath}
  },3);
}

fs.writeFileSync(rawPath,response.raw);
const rawSha=sha(response.raw);
let doc=null,parseError=null;
try{doc=JSON.parse(response.raw)}catch(e){parseError=String(e?.message||e)}

if(parseError){
  finish("BLOCKED","M419D4AH4_EXTERNAL_COORDINATE_RESPONSE_PARSE_FAILED",{
    externalCoordinateRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha,
    artifacts:{rawResponse:rawPath,runtimeLog:logPath}
  },3);
}
if(response.statusCode<200||response.statusCode>=300){
  finish("BLOCKED","M419D4AH4_EXTERNAL_COORDINATE_SOURCE_HTTP_FAILURE",{
    externalCoordinateRequestsPerformed:1,httpStatus:response.statusCode,rawResponseSha256:rawSha,
    redactedResponse:redact(doc),
    artifacts:{rawResponse:rawPath,runtimeLog:logPath},
    nextMilestone:"M4.19D4AH5_EXTERNAL_COORDINATE_SOURCE_RESPONSE_FORENSICS"
  },3);
}

// Extract provider-returned coordinates if present anywhere; otherwise the provider response
// remains evidence that the queried point successfully resolved a parcel.
function walk(x,path=[],out=[]){
  if(Array.isArray(x)){x.forEach((v,i)=>walk(v,[...path,String(i)],out));return out}
  if(x&&typeof x==="object"){
    for(const [k,v] of Object.entries(x)){out.push({path:[...path,k].join("."),key:k,value:v});walk(v,[...path,k],out)}
  }
  return out;
}
const rows=walk(doc);
const latRows=rows.filter(r=>/^(lat|latitude)$/i.test(r.key)&&validLat(r.value));
const lngRows=rows.filter(r=>/^(lng|lon|longitude)$/i.test(r.key)&&validLng(r.value));
const providerLat=latRows.length?Number(latRows[0].value):lat;
const providerLng=lngRows.length?Number(lngRows[0].value):lng;
const observedAt=new Date().toISOString();
const sourceReference=`LIGHTBOX_PROXY_GET ${route}`;

const updated={
  ...template,
  latitude:providerLat,
  longitude:providerLng,
  observationTimestamp:observedAt,
  sourceProvenance:"LIGHTBOX_SOURCE_NATIVE_PARCEL_BY_POINT",
  sourceReference,
  sourceSnapshotEvidence:{
    artifactPath:rawPath,
    sha256:rawSha,
    httpStatus:response.statusCode,
    providerResponseCaptured:true
  },
  operatorAttestation:null,
  notes:"Populated automatically by M4.19D4AH4 from a single governed LightBox parcel-by-point observation."
};
write(templatePath,updated);

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH4_COORDINATE_EVIDENCE_CAPTURE_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  observation:{
    provider:"LIGHTBOX",
    route,
    httpStatus:response.statusCode,
    observationTimestamp:observedAt,
    queriedPoint:{lat,lng},
    boundPoint:{lat:providerLat,lng:providerLng},
    providerCoordinateFieldsFound:latRows.length>0&&lngRows.length>0,
    rawResponseSha256:rawSha
  },
  evidenceTemplateUpdated:true,
  externalCoordinateRequestsPerformed:1,
  automaticRetry:false,
  syntheticCoordinatesUsed:false
};
write(auditPath,audit);

finish("PASSED","M419D4AH4_EXTERNAL_COORDINATE_OBSERVATION_EVIDENCE_CAPTURED_TEMPLATE_READY_FOR_VALIDATION",{
  boundIdentity:{canonicalPropertyId,sourcePropertyId},
  observation:{
    provider:"LIGHTBOX",
    httpStatus:response.statusCode,
    observationTimestamp:observedAt,
    latitude:providerLat,
    longitude:providerLng,
    rawResponseSha256:rawSha,
    externalCoordinateRequestsPerformed:1
  },
  evidenceCapture:{
    sourceProvenance:"LIGHTBOX_SOURCE_NATIVE_PARCEL_BY_POINT",
    sourceReference,
    sourceSnapshotEvidenceCaptured:true,
    evidenceTemplateUpdated:true
  },
  artifacts:{rawResponse:rawPath,captureAudit:auditPath,evidenceTemplate:templatePath,runtimeLog:logPath},
  nextMilestone:"M4.19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING"
},0);
