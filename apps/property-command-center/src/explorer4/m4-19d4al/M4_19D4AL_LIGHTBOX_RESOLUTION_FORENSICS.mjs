#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,classifyFile} from "./M419D4ALRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const akPath=path.join(ev,"m4-19d4ak-geocode-response-forensics-alternate-resolution-path.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4al-lightbox-address-identifier-resolution-capability-forensics.json");
const auditPath=path.join(ev,"m4-19d4al-lightbox-resolution-capability-audit.json");

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

for(const p of [akPath,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AL_PREREQUISITE_MISSING",{path:p},3);
}
const ak=JSON.parse(fs.readFileSync(akPath,"utf8"));
if(ak?.state!=="M419D4AK_GOOGLE_GEOCODING_API_NOT_ENABLED_ALTERNATE_LIGHTBOX_RESOLUTION_FORENSICS_SELECTED"){
  finish("BLOCKED","M419D4AL_AK_ALTERNATE_LIGHTBOX_STATE_REQUIRED",{observed:ak?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const address=locator?.locator?.address??null;
const boundIdentity=locator?.boundIdentity??null;

const roots=[
  path.join(app,"server/lightbox"),
  path.join(app,"src"),
  path.join(app,"evidence")
].filter(fs.existsSync);

const allowed=new Set([".js",".mjs",".cjs",".ts",".tsx",".jsx",".json"]);
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
    if(st.size>10*1024*1024)continue;
    text=fs.readFileSync(p,"utf8");
  }catch{continue}
  const c=classifyFile(text);
  if(!c.hasLightBox)continue;

  const routeMatches=[...text.matchAll(/['"`](\/api\/lightbox\/[^'"`?\s)]+)/g)].map(m=>m[1]);
  const addressTokens=[...text.matchAll(/\b(address|streetAddress|propertyAddress|formattedAddress|searchAddress|addressQuery)\b/gi)].map(m=>m[1]);
  const identifierTokens=[...text.matchAll(/\b(parcelId|propertyId|sourcePropertyId|canonicalPropertyId|apn|identifier)\b/gi)].map(m=>m[1]);
  const pointTokens=[...text.matchAll(/\b(lat|lng|latitude|longitude|geometry|point)\b/gi)].map(m=>m[1]);

  const score=
    (c.hasAddress?4:0)+
    (c.hasIdentifier?3:0)+
    (c.hasPoint?2:0)+
    (c.hasRoute?2:0)+
    (c.hasNetwork?1:0);

  if(c.hasAddress||c.hasIdentifier){
    candidates.push({
      file:p,
      score,
      hasAddress:c.hasAddress,
      hasIdentifier:c.hasIdentifier,
      hasPoint:c.hasPoint,
      hasNetwork:c.hasNetwork,
      hasRoute:c.hasRoute,
      routes:[...new Set(routeMatches)],
      addressTokens:[...new Set(addressTokens)],
      identifierTokens:[...new Set(identifierTokens)],
      pointTokens:[...new Set(pointTokens)].slice(0,20)
    });
  }
}
candidates.sort((a,b)=>b.score-a.score||a.file.localeCompare(b.file));

const likelyAddressResolution=candidates.filter(c=>
  c.hasAddress && (c.hasPoint||c.hasIdentifier) && (c.hasRoute||c.hasNetwork)
);
const likelyIdentifierResolution=candidates.filter(c=>
  c.hasIdentifier && c.hasPoint && (c.hasRoute||c.hasNetwork)
);

const routeSet=[...new Set(candidates.flatMap(c=>c.routes))].sort();
const semanticRoutes=routeSet.filter(r=>/resolve|search|lookup|enrich|parcel|address|property/i.test(r));

let classification,next,state;
if(likelyAddressResolution.length>0){
  classification="LIGHTBOX_ADDRESS_OR_IDENTIFIER_RESOLUTION_IMPLEMENTATION_CANDIDATES_FOUND";
  state="M419D4AL_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_CAPABILITY_CANDIDATES_FOUND_CONTRACT_FORENSICS_REQUIRED";
  next="M4.19D4AM_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_REQUEST_RESPONSE_CONTRACT_FORENSICS";
}else{
  classification="NO_PROVEN_LIGHTBOX_ADDRESS_IDENTIFIER_TO_COORDINATE_PATH";
  state="M419D4AL_NO_PROVEN_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_PATH_OPERATOR_CAPABILITY_DECISION_REQUIRED";
  next="M4.19D4AM_OPERATOR_CAPABILITY_DECISION_GOOGLE_GEOCODING_ENABLEMENT_OR_EXTERNAL_GEOCODER";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AL_LIGHTBOX_RESOLUTION_CAPABILITY_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress:address,
  inventory:{
    filesScanned:files.length,
    lightBoxCandidateFiles:candidates.length,
    likelyAddressResolutionFiles:likelyAddressResolution.length,
    likelyIdentifierResolutionFiles:likelyIdentifierResolution.length,
    routes:routeSet,
    semanticRoutes
  },
  topCandidates:candidates.slice(0,30),
  classification,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

finish("PASSED",state,{
  forensics:{
    classification,
    certifiedAddress:address,
    filesScanned:files.length,
    lightBoxCandidateFiles:candidates.length,
    likelyAddressResolutionFiles:likelyAddressResolution.length,
    likelyIdentifierResolutionFiles:likelyIdentifierResolution.length,
    semanticRoutes,
    topCandidates:candidates.slice(0,15)
  },
  policy:{
    noNetworkRequest:true,
    noBlindGoogleRetry:true,
    exactContractProofRequiredBeforeAnyLightBoxRead:true,
    addressOrIdentifierMustProduceSourceNativeCoordinateEvidence:true,
    automaticRetry:false
  },
  artifacts:{capabilityAudit:auditPath},
  nextMilestone:next
},0);
