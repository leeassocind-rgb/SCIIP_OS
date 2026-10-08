#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,extractRoutes,hasAny} from "./M419D4AMRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const alPath=path.join(ev,"m4-19d4al-lightbox-address-identifier-resolution-capability-forensics.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");

const resultPath=path.join(ev,"m4-19d4am-lightbox-address-identifier-resolution-contract-forensics.json");
const auditPath=path.join(ev,"m4-19d4am-lightbox-resolution-request-response-contract-audit.json");
const preauthPlanPath=path.join(ev,"m4-19d4am-lightbox-resolution-preauthorization-plan.json");

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
      networkRequestsPerformed:0,enrichmentRequestsPerformed:0,geocodeRequestsPerformed:0,
      sourceMutationPerformed:false,processMutationPerformed:false,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [alPath,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AM_PREREQUISITE_MISSING",{path:p},3);
}
const al=JSON.parse(fs.readFileSync(alPath,"utf8"));
if(al?.state!=="M419D4AL_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_CAPABILITY_CANDIDATES_FOUND_CONTRACT_FORENSICS_REQUIRED"){
  finish("BLOCKED","M419D4AM_AL_CAPABILITY_CANDIDATE_STATE_REQUIRED",{observed:al?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const certifiedAddress=locator?.locator?.address??null;
const boundIdentity=locator?.boundIdentity??null;
if(!certifiedAddress||!boundIdentity?.canonicalPropertyId||!boundIdentity?.sourcePropertyId){
  finish("BLOCKED","M419D4AM_CERTIFIED_LOCATOR_BINDING_REQUIRED",{},3);
}

const targets=[
  "server/lightbox/proxy-server.mjs",
  "server/lightbox/LightBoxParcelResolution.mjs",
  "server/lightbox/LightBoxEvidenceExtractor.mjs",
  "server/lightbox/LightBoxService.mjs",
  "server/lightbox/LightBoxClient.mjs",
  "server/lightbox/LightBoxOrchestrator.mjs",
  "src/broker-product/property-explorer/integrations/lightbox/useLightBoxParcelEnrichment.js",
  "src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js"
].map(r=>({rel:r,abs:path.join(app,r)})).filter(x=>fs.existsSync(x.abs));

const docs={};
for(const t of targets){
  docs[t.rel]=fs.readFileSync(t.abs,"utf8");
}

const proxyText=docs["server/lightbox/proxy-server.mjs"]??"";
const routes=extractRoutes(proxyText);

function snippet(text,needle,before=12,after=28){
  const lines=text.split(/\r?\n/);
  const idx=lines.findIndex(l=>l.includes(needle));
  if(idx<0)return null;
  return {
    startLine:Math.max(1,idx+1-before),
    endLine:Math.min(lines.length,idx+1+after),
    lines:lines.slice(Math.max(0,idx-before),Math.min(lines.length,idx+1+after))
  };
}

const routeEvidence=[];
for(const route of routes){
  if(!/\/api\/lightbox\/(resolve|parcel\/resolve|parcel\/by-point|enrich)/i.test(route.route))continue;
  const s=snippet(proxyText,route.route);
  routeEvidence.push({route:route.route,method:route.method,snippet:s});
}

const implFiles=Object.entries(docs).map(([file,text])=>({
  file,
  sha256:sha(text),
  hasAddressSemantics:hasAny(text,["address","streetAddress","propertyAddress","formattedAddress"]),
  hasIdentifierSemantics:hasAny(text,["propertyId","parcelId","apn","identifier"]),
  hasCoordinateSemantics:hasAny(text,["latitude","longitude","lat","lng","geometry","POINT("]),
  hasResolveSemantics:hasAny(text,["resolve","parcelByPoint","parcel/resolve","parcel/by-point"]),
  hasFetchOrHttp:hasAny(text,["fetch(","https://","http.request","https.request","request("])
}));

function scanContract(text){
  return {
    subjectRequired:/body\.subject|const\s+subject\s*=\s*body\.subject/i.test(text),
    subjectIdRequired:/subject\.id|SUBJECT_REQUIRED/i.test(text),
    latRequired:/subject\.lat|searchParams\.get\(['"]lat['"]\)|INVALID_COORDINATES/i.test(text),
    lngRequired:/subject\.lng|searchParams\.get\(['"]lng['"]\)|INVALID_COORDINATES/i.test(text),
    addressReferenced:/subject\.address|body\.address|streetAddress|propertyAddress|formattedAddress/i.test(text),
    propertyIdReferenced:/propertyId|subject\.id/i.test(text),
    parcelIdReferenced:/parcelId/i.test(text),
    apnReferenced:/\bapn\b/i.test(text),
    requestedArray:/body\.requested|requested:Array\.isArray/i.test(text)
  };
}

const proxyContract=scanContract(proxyText);

const candidateContracts={};
for(const [file,text] of Object.entries(docs)){
  candidateContracts[file]=scanContract(text);
}

// Try to recover concrete function names and signatures in parcel resolver/service/client files.
const functionEvidence=[];
for(const [file,text] of Object.entries(docs)){
  if(!/LightBox|lightbox|parcel|resolve/i.test(file+text))continue;
  const sigs=[];
  for(const m of text.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)|(?:async\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g)){
    const name=m[1]||m[3];
    const args=(m[2]||m[4]||"").trim();
    if(/parcel|resolve|address|point|enrich/i.test(name)) sigs.push({name,args});
  }
  if(sigs.length)functionEvidence.push({file,functions:sigs.slice(0,50)});
}

const routeNames=routeEvidence.map(r=>r.route);
const hasParcelResolve=routeNames.includes("/api/lightbox/parcel/resolve");
const hasParcelByPoint=routeNames.includes("/api/lightbox/parcel/by-point");
const hasEnrich=routeNames.includes("/api/lightbox/enrich");
const hasResolve=routeNames.includes("/api/lightbox/resolve");

// Determine whether any source proves address can be accepted directly.
const addressDirectFiles=implFiles.filter(f=>f.hasAddressSemantics&&f.hasResolveSemantics);
const addressDirectProven=Object.entries(candidateContracts).some(([file,c])=>c.addressReferenced && /proxy-server|ParcelResolution|Service|Client|Orchestrator/i.test(file));

const pointContractProven=hasParcelByPoint && hasParcelResolve && proxyContract.latRequired && proxyContract.lngRequired;
const identifierContractProven=hasEnrich && proxyContract.subjectIdRequired;

let classification,next,state,selectedMode=null;
if(addressDirectProven){
  classification="LIGHTBOX_ADDRESS_RESOLUTION_CONTRACT_PROVEN";
  state="M419D4AM_LIGHTBOX_ADDRESS_RESOLUTION_REQUEST_RESPONSE_CONTRACT_CERTIFIED_PREAUTHORIZATION_READY";
  next="M4.19D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZATION";
  selectedMode="ADDRESS";
}else if(identifierContractProven){
  classification="LIGHTBOX_IDENTIFIER_ENRICH_CONTRACT_PROVEN_ADDRESS_TO_COORDINATE_NOT_PROVEN";
  state="M419D4AM_LIGHTBOX_IDENTIFIER_CONTRACT_CERTIFIED_ADDRESS_TO_COORDINATE_PATH_UNPROVEN";
  next="M4.19D4AN_LIGHTBOX_IDENTIFIER_RESOLUTION_INPUT_BINDING_AND_PREAUTHORIZATION";
  selectedMode="IDENTIFIER";
}else if(pointContractProven){
  classification="LIGHTBOX_POINT_RESOLUTION_CONTRACT_PROVEN_BUT_TRUE_COORDINATE_INPUT_STILL_REQUIRED";
  state="M419D4AM_LIGHTBOX_POINT_RESOLUTION_CONTRACT_CERTIFIED_TRUE_COORDINATE_INPUT_STILL_REQUIRED";
  next="M4.19D4AN_EXTERNAL_GEOCODER_OR_GOOGLE_GEOCODING_ENABLEMENT_DECISION";
  selectedMode="POINT";
}else{
  classification="LIGHTBOX_RESOLUTION_CONTRACT_NOT_PROVEN";
  state="M419D4AM_LIGHTBOX_RESOLUTION_REQUEST_RESPONSE_CONTRACT_NOT_PROVEN";
  next="M4.19D4AN_OPERATOR_CAPABILITY_DECISION_REQUIRED";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AM_LIGHTBOX_RESOLUTION_CONTRACT_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress,
  routeEvidence,
  implementationInventory:implFiles,
  candidateContracts,
  functionEvidence,
  conclusions:{
    hasResolveRoute:hasResolve,
    hasParcelResolveRoute:hasParcelResolve,
    hasParcelByPointRoute:hasParcelByPoint,
    hasEnrichRoute:hasEnrich,
    addressDirectProven,
    identifierContractProven,
    pointContractProven,
    classification,
    selectedMode
  },
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

const preauthPlan={
  contract:"SCIIP_EXPLORER_4_M4_19D4AM_LIGHTBOX_RESOLUTION_PREAUTHORIZATION_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress,
  selectedMode,
  classification,
  routeCandidates:routeEvidence.map(r=>({route:r.route,method:r.method})),
  requirements:{
    exactRequestShapeMustBeBound:true,
    exactResponseFieldsMustBeBound:true,
    sourceNativeCoordinatesOrGeometryRequired:true,
    providerIdentityRequired:true,
    observationTimestampRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    maximumExternalRequests:1,
    automaticRetry:false,
    executionAuthorized:false
  }
};
write(preauthPlanPath,preauthPlan);

finish("PASSED",state,{
  forensics:{
    classification,
    certifiedAddress,
    filesInspected:targets.length,
    routes:routeEvidence.map(r=>({route:r.route,method:r.method})),
    addressDirectProven,
    identifierContractProven,
    pointContractProven,
    selectedMode,
    functionEvidence
  },
  policy:{
    exactRequestContractRequiredBeforeRead:true,
    exactResponseContractRequiredBeforeRead:true,
    sourceNativeCoordinateEvidenceRequired:true,
    noNetworkRequest:true,
    noBlindRetry:true,
    automaticRetry:false
  },
  artifacts:{
    requestResponseContractAudit:auditPath,
    preauthorizationPlan:preauthPlanPath
  },
  nextMilestone:next
},0);
