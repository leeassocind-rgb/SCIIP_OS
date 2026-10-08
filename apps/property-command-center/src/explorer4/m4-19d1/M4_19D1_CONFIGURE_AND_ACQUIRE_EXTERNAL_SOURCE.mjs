#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import {CONTRACT,VERSION,EXPECTED_PREAUTHORIZED_ROWS,validateEvidence,sha} from "./M419D1ConnectorRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const execute=process.argv.includes("AUTHORIZE_EXTERNAL_SOURCE_ACQUISITION");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const preauthPath=path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json");
const stageInput=path.join(ev,"m4-19-refresh-observation-source-evidence.json");
const inboxPath=path.join(ev,"m4-19d1-external-source-inbox.json");
const manifestPath=path.join(ev,"m4-19d1-external-refresh-source-connector-acquisition-manifest.json");

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");

const fail=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false}};
  write(manifestPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(preauthPath)) fail("M419D1_PREAUTHORIZATION_MANIFEST_REQUIRED",{path:preauthPath});
const preauth=read(preauthPath);
const rows=preauth?.rows||[];
if(rows.length!==EXPECTED_PREAUTHORIZED_ROWS) fail("M419D1_EXACT_400_PREAUTHORIZED_ROWS_REQUIRED",{observed:rows.length});

const pairSet=new Set(rows.map(r=>`${r.canonicalPropertyId}|${r.sourcePropertyId}`));

function normalizeEvidence(doc, mode, sourceRef){
  const arr=Array.isArray(doc)?doc:(doc?.rows||doc?.observations||doc?.records||[]);
  const valid=[], rejected=[];
  for(const raw of arr){
    const key=`${raw?.canonicalPropertyId}|${raw?.sourcePropertyId}`;
    const v=validateEvidence(raw);
    const reasons=[];
    if(!pairSet.has(key)) reasons.push("PAIR_NOT_PREAUTHORIZED");
    if(!v.ok) reasons.push(...v.missing, ...(v.timestampValid?[]:["INVALID_TIMESTAMP"]), ...(v.observedAvailableSf===null?["INVALID_AVAILABLE_SF"]:[]));
    if(reasons.length){ rejected.push({canonicalPropertyId:raw?.canonicalPropertyId??null,sourcePropertyId:raw?.sourcePropertyId??null,reasons}); continue; }
    valid.push({
      canonicalPropertyId:raw.canonicalPropertyId,
      sourcePropertyId:raw.sourcePropertyId,
      observationId:raw.observationId,
      observationTimestamp:raw.observationTimestamp,
      observedAvailableSf:v.observedAvailableSf,
      sourceProvenance:raw.sourceProvenance,
      sourceSnapshotEvidence:raw.sourceSnapshotEvidence,
      acquisitionMetadata:{mode,sourceRef,recordHash:sha(raw),acquiredAt:new Date().toISOString()},
      stale:raw.stale===true,
      outOfOrder:raw.outOfOrder===true,
      contradictory:raw.contradictory===true
    });
  }
  return {valid,rejected};
}

function requestJson(url, method, headers, body){
  return new Promise((resolve,reject)=>{
    const u=new URL(url);
    const lib=u.protocol==="https:"?https:http;
    const req=lib.request(u,{method,headers},res=>{
      let data="";
      res.on("data",c=>data+=c);
      res.on("end",()=>{
        if(res.statusCode<200||res.statusCode>=300) return reject(new Error(`HTTP_${res.statusCode}`));
        try{resolve(JSON.parse(data));}catch(e){reject(new Error("INVALID_JSON_RESPONSE"))}
      });
    });
    req.on("error",reject);
    if(body) req.write(body);
    req.end();
  });
}

let mode=null, sourceRef=null, acquiredDoc=null;

if(fs.existsSync(inboxPath)){
  mode="OPERATOR_SUPPLIED_SOURCE_EVIDENCE";
  sourceRef=inboxPath;
  acquiredDoc=read(inboxPath);
}else{
  const url=process.env.SCIIP_REFRESH_SOURCE_URL||"";
  if(!url){
    fail("M419D1_EXTERNAL_SOURCE_CONFIGURATION_REQUIRED",{
      configuration:{
        acceptedModes:["OPERATOR_SUPPLIED_SOURCE_EVIDENCE","HTTP_EXTERNAL_CONNECTOR"],
        operatorInboxPath:inboxPath,
        httpEnvironment:["SCIIP_REFRESH_SOURCE_URL","SCIIP_REFRESH_SOURCE_API_KEY(optional)","SCIIP_REFRESH_SOURCE_METHOD(optional; default POST)"],
        acquisitionAuthorizationArgument:"AUTHORIZE_EXTERNAL_SOURCE_ACQUISITION",
        configured:false
      },
      safety:{externalNetworkRequestPerformed:false,evidenceFabricated:false}
    });
  }
  if(!execute){
    fail("M419D1_EXTERNAL_SOURCE_CONFIGURED_ACQUISITION_NOT_AUTHORIZED",{
      configuration:{mode:"HTTP_EXTERNAL_CONNECTOR",urlConfigured:true,acquisitionAuthorizationArgument:"AUTHORIZE_EXTERNAL_SOURCE_ACQUISITION"},
      safety:{externalNetworkRequestPerformed:false,evidenceFabricated:false}
    });
  }

  mode="HTTP_EXTERNAL_CONNECTOR"; sourceRef=url;
  const method=(process.env.SCIIP_REFRESH_SOURCE_METHOD||"POST").toUpperCase();
  const payload=JSON.stringify({contract:CONTRACT,version:VERSION,requestedField:"availableSf",
    rows:rows.map(r=>({canonicalPropertyId:r.canonicalPropertyId,sourcePropertyId:r.sourcePropertyId}))});
  const headers={"accept":"application/json","content-type":"application/json","content-length":Buffer.byteLength(payload)};
  if(process.env.SCIIP_REFRESH_SOURCE_API_KEY) headers["authorization"]=`Bearer ${process.env.SCIIP_REFRESH_SOURCE_API_KEY}`;
  try{ acquiredDoc=await requestJson(url,method,headers,method==="GET"?null:payload); }
  catch(e){ fail("M419D1_EXTERNAL_SOURCE_ACQUISITION_FAILED",{acquisition:{mode,sourceRef,error:String(e.message)},safety:{externalNetworkRequestPerformed:true,evidenceFabricated:false}}); }
}

const {valid,rejected}=normalizeEvidence(acquiredDoc,mode,sourceRef);
const byPair=new Map();
for(const r of valid){
  const key=`${r.canonicalPropertyId}|${r.sourcePropertyId}`;
  const prior=byPair.get(key);
  if(!prior || Date.parse(r.observationTimestamp)>Date.parse(prior.observationTimestamp)) byPair.set(key,r);
}
const dedup=[...byPair.values()];

if(dedup.length>0){
  write(stageInput,{contract:"SCIIP_EXPLORER_4_M4_19D1_ACQUIRED_REFRESH_OBSERVATION_SOURCE_EVIDENCE",version:VERSION,generatedAt:new Date().toISOString(),acquisitionMode:mode,rows:dedup});
}

const complete=dedup.length===EXPECTED_PREAUTHORIZED_ROWS;
const out={
  contract:CONTRACT,version:VERSION,status:complete?"PASSED":"BLOCKED",
  state:complete?"M419D1_400_EXTERNAL_SOURCE_OBSERVATIONS_ACQUIRED_STAGING_READY":"M419D1_EXTERNAL_SOURCE_ACQUISITION_PARTIAL_OR_INCOMPLETE",
  certifiedAt:new Date().toISOString(),
  acquisition:{mode,sourceRef,preauthorizedRecords:rows.length,validUniqueEvidenceRows:dedup.length,rejectedRows:rejected.length,
    evidenceFileCreated:dedup.length>0,evidenceFilePath:dedup.length>0?stageInput:null,all400Acquired:complete},
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false},
  safety:{evidenceFabricated:false,canonicalValuesCopiedAsEvidence:false,priorTemporalValuesRelabeledFresh:false,temporalMutationPerformed:false,canonicalMutationPerformed:false},
  nextMilestone:dedup.length>0?"M4.19D_EXTERNAL_REFRESH_SOURCE_ADAPTER_AND_EVIDENCE_STAGING_GATE":"M4.19D1_EXTERNAL_REFRESH_SOURCE_CONNECTOR_CONFIGURATION_ACQUISITION_HARNESS"
};
write(manifestPath,out); console.log(JSON.stringify(out,null,2)); if(!complete) process.exit(3);
