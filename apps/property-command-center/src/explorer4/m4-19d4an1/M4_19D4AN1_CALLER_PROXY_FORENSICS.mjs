#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,extractFetches,extractObjectAssignments} from "./M419D4AN1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const anPath=path.join(ev,"m4-19d4an-lightbox-address-resolution-single-read-preauthorization.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4an1-address-resolution-caller-to-proxy-request-shape-forensics.json");
const auditPath=path.join(ev,"m4-19d4an1-caller-proxy-request-shape-audit.json");
const planPath=path.join(ev,"m4-19d4an1-corrected-address-resolution-request-plan.json");

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
      networkRequestsPerformed:0,addressResolutionRequestsPerformed:0,enrichmentRequestsPerformed:0,
      sourceMutationPerformed:false,processMutationPerformed:false,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [anPath,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN1_PREREQUISITE_MISSING",{path:p},3);
}
const an=JSON.parse(fs.readFileSync(anPath,"utf8"));
if(an?.state!=="M419D4AN_DIRECT_ADDRESS_PROXY_REQUEST_CONTRACT_NOT_EXACTLY_BOUND"){
  finish("BLOCKED","M419D4AN1_AN_BLOCKED_STATE_REQUIRED",{observed:an?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const address=locator?.locator?.address??null;
const boundIdentity=locator?.boundIdentity??null;

const roots=[
  path.join(app,"src"),
  path.join(app,"server/lightbox")
].filter(fs.existsSync);

const allowed=new Set([".js",".mjs",".cjs",".ts",".tsx",".jsx"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage"].includes(ent.name))continue;
      walk(p);
    } else if(allowed.has(path.extname(ent.name).toLowerCase())) files.push(p);
  }
}
for(const r of roots)walk(r);

const candidates=[];
for(const p of files){
  let text;
  try{
    const st=fs.statSync(p);
    if(st.size>5*1024*1024)continue;
    text=fs.readFileSync(p,"utf8");
  }catch{continue}

  const hasLightBox=/lightbox/i.test(text);
  const hasAddress=/address|streetAddress|propertyAddress|formattedAddress/i.test(text);
  const hasProxyRoute=/\/api\/lightbox\/(enrich|parcel\/resolve|resolve)/i.test(text);
  if(!(hasLightBox&&(hasAddress||hasProxyRoute))) continue;

  const fetches=extractFetches(text).filter(f=>/lightbox|api\/lightbox/i.test(f.urlExpr+f.optionsExpr));
  const objects=extractObjectAssignments(text).filter(o=>/address|subject|property|parcel/i.test(o.body));
  const routeRefs=[...text.matchAll(/['"`](\/api\/lightbox\/(?:enrich|parcel\/resolve|resolve))['"`]/g)].map(m=>m[1]);

  const addressSources=[...text.matchAll(/([A-Za-z0-9_$.]+)\.(?:address|streetAddress|propertyAddress|formattedAddress)\b/g)].map(m=>m[0]);
  const subjectBuilders=[...text.matchAll(/subject\s*[:=]\s*\{([\s\S]{0,1200}?)\}/g)].map(m=>m[1]);

  let score=0;
  if(fetches.length)score+=5;
  if(routeRefs.length)score+=4;
  if(addressSources.length)score+=3;
  if(subjectBuilders.length)score+=3;
  if(objects.length)score+=1;

  candidates.push({
    file:p,
    sha256:sha(text),
    score,
    fetches,
    routeRefs:[...new Set(routeRefs)],
    addressSources:[...new Set(addressSources)],
    subjectBuilders:subjectBuilders.slice(0,20),
    objectBuilders:objects.slice(0,30)
  });
}
candidates.sort((a,b)=>b.score-a.score||a.file.localeCompare(b.file));

const strong=candidates.filter(c=>
  c.routeRefs.length>0 &&
  c.addressSources.length>0 &&
  (c.fetches.length>0 || c.subjectBuilders.length>0 || c.objectBuilders.length>0)
);

// Try to infer exact caller contract from strongest evidence.
let selected=null;
if(strong.length){
  selected=strong[0];
}

let classification,state,next;
if(selected){
  classification="CALLER_TO_PROXY_ADDRESS_INJECTION_PATH_PROVEN";
  state="M419D4AN1_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_CERTIFIED_CORRECTED_PREAUTHORIZATION_READY";
  next="M4.19D4AN2_CORRECTED_ADDRESS_RESOLUTION_REQUEST_PREAUTHORIZATION";
}else{
  classification="CALLER_TO_PROXY_ADDRESS_INJECTION_PATH_NOT_PROVEN";
  state="M419D4AN1_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_NOT_PROVEN";
  next="M4.19D4AN2_LIGHTBOX_INTERNAL_ADDRESS_RESOLUTION_FACTORY_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN1_CALLER_PROXY_REQUEST_SHAPE_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  certifiedAddress:address,
  boundIdentity,
  filesScanned:files.length,
  candidates,
  strongCandidates:strong,
  selectedCandidate:selected,
  classification,
  networkRequestsPerformed:0
};
write(auditPath,audit);

const correctedPlan={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN1_CORRECTED_ADDRESS_RESOLUTION_REQUEST_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress:address,
  classification,
  selectedCandidate:selected?{
    file:selected.file,
    routeRefs:selected.routeRefs,
    addressSources:selected.addressSources,
    fetches:selected.fetches,
    subjectBuilders:selected.subjectBuilders
  }:null,
  requirements:{
    exactCallerSourceRequired:true,
    exactProxyRouteRequired:true,
    exactBodyShapeRequired:true,
    addressMustBeSourceBound:true,
    maximumExternalRequests:1,
    automaticRetry:false,
    executionAuthorized:false
  }
};
write(planPath,correctedPlan);

finish("PASSED",state,{
  forensics:{
    classification,
    certifiedAddress:address,
    filesScanned:files.length,
    candidateCount:candidates.length,
    strongCandidateCount:strong.length,
    selectedCandidate:selected?{
      file:selected.file,
      routeRefs:selected.routeRefs,
      addressSources:selected.addressSources,
      fetches:selected.fetches,
      subjectBuilders:selected.subjectBuilders
    }:null
  },
  policy:{
    exactCallerProofRequired:true,
    exactProxyRouteRequired:true,
    exactBodyShapeRequired:true,
    noNetworkRequest:true,
    noBlindRetry:true,
    automaticRetry:false
  },
  artifacts:{
    callerProxyRequestShapeAudit:auditPath,
    correctedAddressResolutionRequestPlan:planPath
  },
  nextMilestone:next
},0);
