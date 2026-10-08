#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,isAdmissiblePath,extractFetches} from "./M419D4AN1ARuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const an1Path=path.join(ev,"m4-19d4an1-address-resolution-caller-to-proxy-request-shape-forensics.json");
const locatorPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");
const resultPath=path.join(ev,"m4-19d4an1a-original-source-caller-proxy-request-shape-certification.json");
const auditPath=path.join(ev,"m4-19d4an1a-original-source-caller-proxy-request-shape-audit.json");
const planPath=path.join(ev,"m4-19d4an1a-original-source-corrected-request-plan.json");

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
      identityMutationPerformed:false,operationalIngestionPerformed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [an1Path,locatorPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AN1A_PREREQUISITE_MISSING",{path:p},3);
}
const an1=JSON.parse(fs.readFileSync(an1Path,"utf8"));
if(an1?.state!=="M419D4AN1_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_CERTIFIED_CORRECTED_PREAUTHORIZATION_READY"){
  finish("BLOCKED","M419D4AN1A_AN1_CERTIFIED_STATE_REQUIRED",{observed:an1?.state??null},3);
}

const locator=JSON.parse(fs.readFileSync(locatorPath,"utf8"));
const certifiedAddress=locator?.locator?.address??null;
const boundIdentity=locator?.boundIdentity??null;

// Explicitly reject AN1's selected evidence if it is generated/test/milestone code.
const priorSelected=an1?.forensics?.selectedCandidate??null;
const priorSelectedAdmissible=priorSelected?.file ? isAdmissiblePath(priorSelected.file) : false;
const priorCircularEvidenceRejected=!!priorSelected && !priorSelectedAdmissible;

const roots=[
  path.join(app,"src"),
  path.join(app,"server")
].filter(fs.existsSync);

const allowed=new Set([".js",".mjs",".cjs",".ts",".tsx",".jsx"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage"].includes(ent.name))continue;
      if(!isAdmissiblePath(p+"/x"))continue;
      walk(p);
    }else if(allowed.has(path.extname(ent.name).toLowerCase())&&isAdmissiblePath(p)){
      files.push(p);
    }
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

  if(!/lightbox/i.test(text))continue;
  const fetches=extractFetches(text).filter(f=>/api\/lightbox|lightbox/i.test(f.urlExpr+f.optionsExpr));
  const routeRefs=[...text.matchAll(/['"`](\/api\/lightbox\/(?:enrich|parcel\/resolve|resolve))['"`]/g)].map(m=>m[1]);
  const addressSources=[...text.matchAll(/([A-Za-z0-9_$.]+)\.(?:address|streetAddress|propertyAddress|formattedAddress)\b/g)].map(m=>m[0]);
  const subjectBuilders=[...text.matchAll(/subject\s*[:=]\s*\{([\s\S]{0,1600}?)\}/g)].map(m=>m[1]);
  const bodyBuilders=[...text.matchAll(/JSON\.stringify\s*\(\s*\{([\s\S]{0,1800}?)\}\s*\)/g)].map(m=>m[1]);

  let score=0;
  if(fetches.length)score+=5;
  if(routeRefs.length)score+=4;
  if(addressSources.length)score+=4;
  if(subjectBuilders.length)score+=3;
  if(bodyBuilders.length)score+=2;

  if(score>0){
    candidates.push({
      file:p,
      sha256:sha(text),
      score,
      fetches,
      routeRefs:[...new Set(routeRefs)],
      addressSources:[...new Set(addressSources)],
      subjectBuilders:subjectBuilders.slice(0,20),
      bodyBuilders:bodyBuilders.slice(0,20)
    });
  }
}
candidates.sort((a,b)=>b.score-a.score||a.file.localeCompare(b.file));

const strong=candidates.filter(c=>
  c.routeRefs.length>0 &&
  c.addressSources.length>0 &&
  (c.fetches.length>0||c.subjectBuilders.length>0||c.bodyBuilders.length>0)
);

let classification,state,next,selected=null;
if(strong.length===1){
  selected=strong[0];
  classification="ONE_ORIGINAL_SOURCE_CALLER_TO_PROXY_ADDRESS_REQUEST_SHAPE_PROVEN";
  state="M419D4AN1A_ORIGINAL_SOURCE_CALLER_PROXY_ADDRESS_REQUEST_SHAPE_CERTIFIED_PREAUTHORIZATION_READY";
  next="M4.19D4AN2_CORRECTED_ADDRESS_RESOLUTION_REQUEST_PREAUTHORIZATION";
}else if(strong.length>1){
  classification="MULTIPLE_ORIGINAL_SOURCE_CALLER_REQUEST_SHAPES_REQUIRE_RECONCILIATION";
  state="M419D4AN1A_MULTIPLE_ORIGINAL_SOURCE_CALLER_REQUEST_SHAPES_REQUIRE_RECONCILIATION";
  next="M4.19D4AN1B_CALLER_REQUEST_SHAPE_PRECEDENCE_RECONCILIATION";
}else{
  classification="NO_ORIGINAL_SOURCE_CALLER_TO_PROXY_ADDRESS_INJECTION_PATH_PROVEN";
  state="M419D4AN1A_AN1_CIRCULAR_TEST_EVIDENCE_REJECTED_ORIGINAL_SOURCE_PATH_NOT_PROVEN";
  next="M4.19D4AN2_LIGHTBOX_INTERNAL_ADDRESS_RESOLUTION_FACTORY_AND_PROVIDER_CONTRACT_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN1A_ORIGINAL_SOURCE_CALLER_PROXY_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  certifiedAddress,
  boundIdentity,
  correction:{
    priorSelectedCandidate:priorSelected,
    priorSelectedAdmissible,
    priorCircularEvidenceRejected,
    generatedMilestoneSourcesExcluded:true,
    testSourcesExcluded:true,
    evidenceArtifactsExcluded:true
  },
  inventory:{
    originalSourceFilesScanned:files.length,
    candidateCount:candidates.length,
    strongCandidateCount:strong.length
  },
  candidates,
  strongCandidates:strong,
  selectedCandidate:selected,
  classification,
  networkRequestsPerformed:0
};
write(auditPath,audit);

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4AN1A_ORIGINAL_SOURCE_CORRECTED_REQUEST_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity,
  certifiedAddress,
  classification,
  selectedCandidate:selected,
  policy:{
    generatedMilestoneEvidenceProhibited:true,
    testEvidenceProhibited:true,
    evidenceArtifactAsSourceOfTruthProhibited:true,
    exactOriginalSourceCallerRequired:true,
    exactProxyRouteRequired:true,
    exactBodyShapeRequired:true,
    maximumExternalRequests:1,
    automaticRetry:false,
    executionAuthorized:false
  }
};
write(planPath,plan);

finish("PASSED",state,{
  correction:{
    priorAN1State:an1.state,
    priorSelectedFile:priorSelected?.file??null,
    priorCircularEvidenceRejected,
    generatedMilestoneSourcesExcluded:true,
    testSourcesExcluded:true,
    evidenceArtifactsExcluded:true
  },
  forensics:{
    classification,
    certifiedAddress,
    originalSourceFilesScanned:files.length,
    candidateCount:candidates.length,
    strongCandidateCount:strong.length,
    selectedCandidate:selected
  },
  policy:{
    onlyOriginalSourceAdmissible:true,
    exactCallerProofRequired:true,
    noNetworkRequest:true,
    noBlindRetry:true,
    automaticRetry:false
  },
  artifacts:{
    originalSourceCallerAudit:auditPath,
    correctedRequestPlan:planPath
  },
  nextMilestone:next
},0);
