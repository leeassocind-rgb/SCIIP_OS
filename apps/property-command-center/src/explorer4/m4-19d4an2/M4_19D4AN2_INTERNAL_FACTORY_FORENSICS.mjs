#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,fnSigs,imports} from "./M419D4AN2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const an1aPath=path.join(ev,"m4-19d4an1a-original-source-caller-proxy-request-shape-certification.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4an2-lightbox-internal-address-resolution-factory-provider-contract-forensics.json");
const auditPath=path.join(ev,"m4-19d4an2-internal-address-resolution-provider-contract-audit.json");
const planPath=path.join(ev,"m4-19d4an2-provider-request-preauthorization-plan.json");

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
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
};

for(const p of [an1aPath,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN2_PREREQUISITE_MISSING",{path:p},3);
}
const an1a=JSON.parse(fs.readFileSync(an1aPath,"utf8"));
if(an1a?.state!=="M419D4AN1A_AN1_CIRCULAR_TEST_EVIDENCE_REJECTED_ORIGINAL_SOURCE_PATH_NOT_PROVEN"){
  finish("BLOCKED","M419D4AN2_AN1A_ORIGINAL_SOURCE_PATH_NOT_PROVEN_STATE_REQUIRED",{observed:an1a?.state??null},3);
}
const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const certifiedAddress=locator?.locator?.address??null;
const boundIdentity=locator?.boundIdentity??null;

const targetRel=[
  "server/lightbox/LightBoxParcelResolution.mjs",
  "server/lightbox/LightBoxEvidenceExtractor.mjs",
  "server/lightbox/LightBoxService.mjs",
  "server/lightbox/LightBoxClient.mjs",
  "server/lightbox/LightBoxOrchestrator.mjs",
  "server/lightbox/proxy-server.mjs",
  "server/lightbox/config.mjs"
];
const targets=targetRel.map(rel=>({rel,abs:path.join(app,rel)})).filter(x=>fs.existsSync(x.abs));
const docs=Object.fromEntries(targets.map(t=>[t.rel,fs.readFileSync(t.abs,"utf8")]));

const evidence=[];
for(const [file,text] of Object.entries(docs)){
  const functions=fnSigs(text).filter(f=>/address|parcel|resolve|point|enrich|search|geometry|evidence/i.test(f.name));
  const importList=imports(text);
  const addressRefs=[...text.matchAll(/\b(?:address|streetAddress|propertyAddress|formattedAddress)\b/gi)].map(m=>m[0]);
  const upstreamPaths=[...text.matchAll(/['"`]([^'"`]*(?:parcel|property|address|geometry|search)[^'"`]*)['"`]/gi)]
    .map(m=>m[1]).filter(x=>/^\/|https?:\/\//.test(x)).slice(0,100);
  const networkCalls=[...text.matchAll(/\b(fetch|request|https\.request|http\.request)\s*\(/g)].map(m=>m[1]);
  const geometryRefs=[...text.matchAll(/\b(?:lat|lng|latitude|longitude|geometry|coordinates|wkt|POINT)\b/gi)].map(m=>m[0]);

  evidence.push({
    file,
    sha256:sha(text),
    imports:importList,
    functions,
    addressReferenceCount:addressRefs.length,
    upstreamPaths:[...new Set(upstreamPaths)],
    networkCalls:[...new Set(networkCalls)],
    geometryReferenceCount:geometryRefs.length
  });
}

const combined=Object.entries(docs).map(([f,t])=>`/* ${f} */\n${t}`).join("\n");
const getAddressProven=/function\s+getAddress\s*\(\s*parcel\s*\)|getAddress\s*\(\s*parcel\s*\)/i.test(combined);
const scoreUsesAddress=/scoreParcelCandidate[\s\S]{0,6000}(address|streetAddress|formattedAddress)/i.test(combined);
const rankResolveChain=/rankParcelCandidates|resolveParcelCandidate/i.test(combined);
const subjectAddressSeen=/subject\.(?:address|streetAddress|propertyAddress|formattedAddress)|subject\[['"]address['"]\]/i.test(combined);
const addressProviderPathSeen=/(address|search)[\s\S]{0,1200}(fetch|request|client)|(?:fetch|request|client)[\s\S]{0,1200}(address|search)/i.test(combined);
const pointProviderPathSeen=/parcelByPoint|POINT\s*\(|parcels\.geometry/i.test(combined);
const identifierProviderPathSeen=/propertyId|parcelId|\bapn\b/i.test(combined);

let classification,state,next,selectedMode;
if(subjectAddressSeen && addressProviderPathSeen){
  classification="INTERNAL_ADDRESS_TO_PROVIDER_REQUEST_CHAIN_PROVEN";
  state="M419D4AN2_INTERNAL_ADDRESS_RESOLUTION_PROVIDER_CONTRACT_CERTIFIED_PREAUTHORIZATION_READY";
  next="M4.19D4AN3_INTERNAL_ADDRESS_PROVIDER_SINGLE_READ_PREAUTHORIZATION";
  selectedMode="INTERNAL_ADDRESS_PROVIDER";
}else if(getAddressProven && scoreUsesAddress && rankResolveChain && pointProviderPathSeen){
  classification="ADDRESS_USED_FOR_CANDIDATE_SCORING_ONLY_PROVIDER_INPUT_REMAINS_POINT_BASED";
  state="M419D4AN2_ADDRESS_SEMANTICS_CONFIRMED_AS_POST_FETCH_SCORING_NOT_PROVIDER_LOCATOR";
  next="M4.19D4AN3_EXTERNAL_GEOCODER_OR_GOOGLE_GEOCODING_ENABLEMENT_DECISION";
  selectedMode="POST_FETCH_ADDRESS_SCORING";
}else if(identifierProviderPathSeen){
  classification="IDENTIFIER_PROVIDER_PATH_PRESENT_ADDRESS_PROVIDER_PATH_NOT_PROVEN";
  state="M419D4AN2_IDENTIFIER_PROVIDER_PATH_PRESENT_ADDRESS_LOCATOR_PATH_NOT_PROVEN";
  next="M4.19D4AN3_IDENTIFIER_BINDING_FEASIBILITY_FORENSICS";
  selectedMode="IDENTIFIER";
}else{
  classification="NO_INTERNAL_ADDRESS_OR_IDENTIFIER_PROVIDER_LOCATOR_CHAIN_PROVEN";
  state="M419D4AN2_INTERNAL_ADDRESS_RESOLUTION_PROVIDER_CONTRACT_NOT_PROVEN";
  next="M4.19D4AN3_OPERATOR_COORDINATE_PROVIDER_DECISION";
  selectedMode=null;
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN2_INTERNAL_PROVIDER_CONTRACT_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  certifiedAddress,
  boundIdentity,
  filesInspected:targets.length,
  implementationEvidence:evidence,
  conclusions:{
    getAddressProven,
    scoreUsesAddress,
    rankResolveChain,
    subjectAddressSeen,
    addressProviderPathSeen,
    pointProviderPathSeen,
    identifierProviderPathSeen,
    classification,
    selectedMode
  },
  networkRequestsPerformed:0
};
write(auditPath,audit);

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN2_PROVIDER_REQUEST_PREAUTHORIZATION_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress,
  classification,
  selectedMode,
  requirements:{
    exactProviderMethodRequired:true,
    exactProviderPathRequired:true,
    exactProviderPayloadRequired:true,
    sourceNativeResponseRequired:true,
    rawResponsePersistenceRequired:true,
    rawResponseSha256Required:true,
    maximumExternalRequests:1,
    automaticRetry:false,
    executionAuthorized:false
  }
};
write(planPath,plan);

finish("PASSED",state,{
  forensics:{
    classification,
    certifiedAddress,
    filesInspected:targets.length,
    getAddressProven,
    scoreUsesAddress,
    rankResolveChain,
    subjectAddressSeen,
    addressProviderPathSeen,
    pointProviderPathSeen,
    identifierProviderPathSeen,
    selectedMode,
    implementationEvidence:evidence
  },
  policy:{
    originalSourceOnly:true,
    exactProviderContractRequiredBeforeRead:true,
    noNetworkRequest:true,
    noBlindRetry:true,
    automaticRetry:false
  },
  artifacts:{
    providerContractAudit:auditPath,
    providerPreauthorizationPlan:planPath
  },
  nextMilestone:next
},0);
