#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION,sha,semanticHits,finiteSf} from "./M419D4AERuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AE_SINGLE_ENRICH_READ");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4ad-controlled-single-record-enrich-read-preauthorization.json");
const manifestPath=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const envPath=path.join(app,".env.local");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4ae-controlled-single-record-enrich-read-execution.json");
const rawPath=path.join(ev,"m4-19d4ae-single-record-enrich-raw-response.json");
const auditPath=path.join(ev,"m4-19d4ae-source-native-available-sf-semantic-audit.json");
const logPath=path.join(ev,"m4-19d4ae-isolated-proxy-runtime.log");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
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
    safety:{
      enrichmentRequestsPerformed:extra?.execution?.enrichmentRequestsPerformed??0,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      secretValuesExposed:false,
      automaticRetry:false
    }
  };
  write(resultPath,out);
  console.log(JSON.stringify(out,null,2));
  process.exit(code);
};

for(const p of [prior,manifestPath,proxyPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AE_PREREQUISITE_MISSING",{path:p},3);
}

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));

if(pdoc?.state!=="M419D4AD_CONTROLLED_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
  finish("BLOCKED","M419D4AE_D4AD_PREAUTHORIZATION_STATE_REQUIRED",{observed:pdoc?.state??null},3);

if(manifest?.executionAuthorized!==false || manifest?.controls?.maximumEnrichmentRequests!==1)
  finish("BLOCKED","M419D4AE_PREAUTHORIZATION_MANIFEST_CONTROL_MISMATCH",{},3);

if(!authorized){
  finish("BLOCKED","M419D4AE_EXPLICIT_SINGLE_READ_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4AE_SINGLE_ENRICH_READ",
    execution:{enrichmentRequestsPerformed:0}
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
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}

const fileEnv=fs.existsSync(envPath)?parseEnv(fs.readFileSync(envPath,"utf8")):{};
const childEnv={...process.env,...fileEnv,LIGHTBOX_PROXY_PORT:"8788"};

if(!childEnv.LIGHTBOX_API_KEY){
  finish("BLOCKED","M419D4AE_LIGHTBOX_API_KEY_REQUIRED_FOR_EXECUTION",{
    execution:{enrichmentRequestsPerformed:0}
  },3);
}

fs.writeFileSync(logPath,"");
let exited=false,exitCode=null,signal=null;
const child=spawn(process.execPath,[proxyPath],{
  cwd:app,env:childEnv,stdio:["ignore","pipe","pipe"]
});
child.on("exit",(c,s)=>{exited=true;exitCode=c;signal=s;});
const cap=(stream,c)=>fs.appendFileSync(logPath,`${new Date().toISOString()} ${stream} ${c.toString()}`);
child.stdout.on("data",c=>cap("STDOUT",c));
child.stderr.on("data",c=>cap("STDERR",c));

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function req(method,route,body=null){
  return new Promise((resolve,reject)=>{
    const payload=body===null?null:JSON.stringify(body);
    const r=http.request({
      host:"127.0.0.1",port:8788,path:route,method,
      headers:{
        accept:"application/json",
        ...(payload?{"content-type":"application/json","content-length":Buffer.byteLength(payload)}:{})
      }
    },res=>{
      let raw="";
      res.on("data",c=>raw+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,headers:res.headers,raw}));
    });
    r.on("error",reject);
    if(payload) r.write(payload);
    r.end();
  });
}

let selfTest=null;
for(let i=0;i<40;i++){
  if(exited) break;
  try{
    const r=await req("GET","/api/lightbox/self-test");
    if(r.statusCode){selfTest=r;break;}
  }catch{}
  await sleep(150);
}
let selfParsed=null;
if(selfTest){try{selfParsed=JSON.parse(selfTest.raw)}catch{}}

if(!selfTest || selfTest.statusCode!==200 || selfParsed?.status!=="READY" || selfParsed?.configured!==true){
  if(!exited) child.kill("SIGTERM");
  await sleep(100);
  finish("BLOCKED","M419D4AE_PRE_EXECUTION_SELF_TEST_NOT_READY",{
    selfTest:{
      httpStatus:selfTest?.statusCode??null,
      status:selfParsed?.status??null,
      configured:selfParsed?.configured??null
    },
    execution:{enrichmentRequestsPerformed:0},
    artifacts:{runtimeLog:logPath}
  },3);
}

// One and only one enrich request.
let response=null,error=null;
try{
  response=await req(
    manifest.request.method,
    manifest.request.route,
    manifest.request.body
  );
}catch(e){
  error=String(e?.message||e);
}

if(!exited){
  child.kill("SIGTERM");
  for(let i=0;i<10&&!exited;i++) await sleep(50);
  if(!exited) child.kill("SIGKILL");
}
await sleep(100);

if(error){
  finish("BLOCKED","M419D4AE_SINGLE_ENRICH_READ_TRANSPORT_FAILED",{
    execution:{
      enrichmentRequestsPerformed:1,
      automaticRetry:false,
      error
    },
    artifacts:{runtimeLog:logPath}
  },3);
}

const raw=response.raw;
fs.writeFileSync(rawPath,raw);
const rawSha=sha(raw);

let doc=null,parseError=null;
try{doc=JSON.parse(raw)}catch(e){parseError=String(e?.message||e)}

if(parseError){
  finish("BLOCKED","M419D4AE_ENRICH_RESPONSE_JSON_PARSE_FAILED",{
    execution:{
      enrichmentRequestsPerformed:1,
      httpStatus:response.statusCode,
      rawResponseSha256:rawSha,
      automaticRetry:false
    },
    parseError,
    artifacts:{rawResponse:rawPath,runtimeLog:logPath}
  },3);
}

const hits=semanticHits(doc);
const sfHits=hits.available.map(h=>({
  path:h.path,
  rawValue:h.value,
  numericValue:finiteSf(h.value)
}));
const finiteHits=sfHits.filter(x=>x.numericValue!==null);

const provenancePresent=hits.provenance.length>0;
const timestampPresent=hits.timestamps.length>0;
const sourceNativeStructurePresent=hits.sourceNative.length>0;
const availableSfExplicitlyPresent=finiteHits.length>0;

// Qualification is intentionally strict: the response must itself contain
// an available-SF semantic and source-native/provenance structure.
const sourceNativeAvailableSfQualified=
  response.statusCode>=200 &&
  response.statusCode<300 &&
  availableSfExplicitlyPresent &&
  provenancePresent &&
  sourceNativeStructurePresent;

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AE_SOURCE_NATIVE_AVAILABLE_SF_SEMANTIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  requestHash:manifest.requestHash,
  sampleHash:manifest.sampleHash,
  rawResponseSha256:rawSha,
  httpStatus:response.statusCode,
  availableSfHits:finiteHits,
  provenanceHitCount:hits.provenance.length,
  timestampHitCount:hits.timestamps.length,
  sourceNativeStructureHitCount:hits.sourceNative.length,
  availableSfExplicitlyPresent,
  provenancePresent,
  timestampPresent,
  sourceNativeStructurePresent,
  sourceNativeAvailableSfQualified,
  canonicalOrTemporalFallbackUsed:false,
  syntheticEvidenceUsed:false
};
write(auditPath,audit);

let state,next;
if(sourceNativeAvailableSfQualified){
  state="M419D4AE_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_QUALIFIED";
  next="M4.19D4AF_SINGLE_RECORD_OBSERVATION_EVIDENCE_BINDING_AND_REFRESH_COHORT_EXPANSION_POLICY";
}else if(response.statusCode<200 || response.statusCode>=300){
  state="M419D4AE_SINGLE_ENRICH_READ_HTTP_RESPONSE_NOT_SUCCESSFUL";
  next="M4.19D4AF_LIGHTBOX_ENRICH_HTTP_RESPONSE_FORENSICS";
}else if(!availableSfExplicitlyPresent){
  state="M419D4AE_ENRICH_RESPONSE_VALID_BUT_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT";
  next="M4.19D4AF_LIGHTBOX_AVAILABLE_SF_SEMANTIC_PATH_GAP_FORENSICS";
}else if(!provenancePresent || !sourceNativeStructurePresent){
  state="M419D4AE_AVAILABLE_SF_PRESENT_BUT_SOURCE_NATIVE_PROVENANCE_INSUFFICIENT";
  next="M4.19D4AF_LIGHTBOX_AVAILABLE_SF_PROVENANCE_BINDING_FORENSICS";
}else{
  state="M419D4AE_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION_BLOCKED";
  next="M4.19D4AF_SINGLE_RECORD_RESPONSE_SEMANTIC_FORENSICS";
}

finish(sourceNativeAvailableSfQualified?"PASSED":"BLOCKED",state,{
  execution:{
    enrichmentRequestsPerformed:1,
    maximumEnrichmentRequests:1,
    automaticRetry:false,
    httpStatus:response.statusCode,
    rawResponseSha256:rawSha,
    requestHash:manifest.requestHash,
    sampleHash:manifest.sampleHash
  },
  qualification:{
    availableSfExplicitlyPresent,
    sourceNativeAvailableSfQualified,
    provenancePresent,
    timestampPresent,
    sourceNativeStructurePresent,
    qualifiedAvailableSfValues:finiteHits.map(x=>({path:x.path,value:x.numericValue})),
    canonicalOrTemporalFallbackUsed:false,
    syntheticEvidenceUsed:false
  },
  artifacts:{
    rawResponse:rawPath,
    semanticAudit:auditPath,
    runtimeLog:logPath
  },
  nextMilestone:next
},sourceNativeAvailableSfQualified?0:3);
