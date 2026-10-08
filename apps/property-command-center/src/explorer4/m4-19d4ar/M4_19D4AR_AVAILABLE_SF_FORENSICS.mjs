#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,sha,walk,numeric,classifyKey} from "./M419D4ARRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const aq2ResultPath=path.join(ev,"m4-19d4aq2-controlled-single-lightbox-point-read-retry-parcel-evidence-qualification.json");
const aq2QualifiedPath=path.join(ev,"m4-19d4aq2-qualified-lightbox-parcel-evidence.json");
const aq2RawPath=path.join(ev,"m4-19d4aq2-lightbox-point-read-retry-raw-response.json");

const resultPath=path.join(ev,"m4-19d4ar-source-native-available-sf-path-qualification.json");
const semanticAuditPath=path.join(ev,"m4-19d4ar-source-native-available-sf-semantic-audit.json");
const fieldManifestPath=path.join(ev,"m4-19d4ar-available-sf-field-provenance-manifest.json");

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
      networkRequestsPerformed:0,enrichmentRequestsPerformed:0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      syntheticEvidenceUsed:false,buildingAreaSubstitutedForAvailableSf:false,
      secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [aq2ResultPath,aq2QualifiedPath,aq2RawPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AR_PREREQUISITE_MISSING",{path:p},3);
}

const aq2=JSON.parse(fs.readFileSync(aq2ResultPath,"utf8"));
if(aq2?.state!=="M419D4AQ2_CONTROLLED_LIGHTBOX_POINT_READ_RETRY_EXECUTED_PARCEL_EVIDENCE_QUALIFIED"){
  finish("BLOCKED","M419D4AR_AQ2_QUALIFIED_PARCEL_STATE_REQUIRED",{observed:aq2?.state??null},3);
}

const qualified=JSON.parse(fs.readFileSync(aq2QualifiedPath,"utf8"));
const rawText=fs.readFileSync(aq2RawPath,"utf8");
let raw;
try{raw=JSON.parse(rawText)}catch{
  finish("BLOCKED","M419D4AR_AQ2_RAW_RESPONSE_NOT_PARSEABLE",{},3);
}
const rawSha=sha(rawText);

// Inspect original source only.
const sourceRoots=[
  path.join(app,"server"),
  path.join(app,"src/broker-product")
].filter(fs.existsSync);

const allowed=new Set([".js",".mjs",".cjs",".ts",".tsx",".jsx"]);
const sourceFiles=[];
function admissible(p){
  const s=p.replaceAll("\\","/");
  if(/\/src\/explorer4\//i.test(s)) return false;
  if(/\/evidence\//i.test(s)) return false;
  if(/\.test\.[cm]?[jt]sx?$/i.test(s)||/\.spec\.[cm]?[jt]sx?$/i.test(s)) return false;
  if(/\/__tests__\/|\/tests?\//i.test(s)) return false;
  return true;
}
function scan(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules",".git","dist","build","coverage"].includes(ent.name))continue;
      if(admissible(p+"/x"))scan(p);
    }else if(allowed.has(path.extname(ent.name).toLowerCase())&&admissible(p)){
      sourceFiles.push(p);
    }
  }
}
for(const r of sourceRoots)scan(r);

const sourceEvidence=[];
for(const p of sourceFiles){
  let text;
  try{
    if(fs.statSync(p).size>5*1024*1024)continue;
    text=fs.readFileSync(p,"utf8");
  }catch{continue}
  if(!/(availableSf|availableSF|available.*(?:sf|sq|square|area)|buildingSf|buildingSF|building.*(?:sf|area|size)|grossBuildingArea|gla|squareFeet)/i.test(text))continue;

  const refs=[];
  const re=/\b([A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*)\b/g;
  for(const m of text.matchAll(re)){
    const token=m[1];
    if(/availableSf|availableSF|available.*(?:sf|sq|square|area)|buildingSf|buildingSF|building.*(?:sf|area|size)|grossBuildingArea|gla|squareFeet/i.test(token)){
      refs.push(token);
    }
  }
  sourceEvidence.push({
    file:p,
    sha256:sha(text),
    references:[...new Set(refs)].slice(0,100)
  });
}

// Inspect raw provider response paths.
const rawEntries=walk(raw);
const semanticEntries=[];
for(const e of rawEntries){
  const cls=classifyKey(e.key);
  if(!cls) continue;
  const n=numeric(e.value);
  semanticEntries.push({
    path:e.path,
    key:e.key,
    classification:cls,
    numericValue:n,
    rawType:Array.isArray(e.value)?"array":typeof e.value
  });
}

const availabilityEntries=semanticEntries.filter(x=>x.classification.startsWith("MARKET_AVAILABILITY"));
const physicalEntries=semanticEntries.filter(x=>x.classification.startsWith("PHYSICAL_BUILDING_AREA"));

const explicitAvailability=availabilityEntries.filter(x=>x.classification==="MARKET_AVAILABILITY"&&x.numericValue!==null);
const candidateAvailability=availabilityEntries.filter(x=>x.numericValue!==null);
const physicalNumerics=physicalEntries.filter(x=>x.numericValue!==null);

const exactAvailableSfQualified = explicitAvailability.length===1;
const ambiguousAvailableSf = explicitAvailability.length>1;
const onlyHeuristicAvailability = explicitAvailability.length===0 && candidateAvailability.length>0;
const physicalOnly = availabilityEntries.length===0 && physicalNumerics.length>0;

let state,classification,nextMilestone,qualifiedField=null;
if(exactAvailableSfQualified){
  qualifiedField=explicitAvailability[0];
  state="M419D4AR_SOURCE_NATIVE_AVAILABLE_SF_FIELD_PATH_QUALIFIED";
  classification="EXACT_SOURCE_NATIVE_MARKET_AVAILABILITY_FIELD_PROVEN";
  nextMilestone="M4.19D4AS_AVAILABLE_SF_OBSERVATION_PREAUTHORIZATION_USING_QUALIFIED_SOURCE_NATIVE_FIELD";
}else if(ambiguousAvailableSf){
  state="M419D4AR_MULTIPLE_SOURCE_NATIVE_AVAILABLE_SF_FIELDS_REQUIRE_RECONCILIATION";
  classification="MULTIPLE_EXPLICIT_MARKET_AVAILABILITY_FIELDS_PRESENT";
  nextMilestone="M4.19D4AR1_AVAILABLE_SF_FIELD_PRECEDENCE_AND_SEMANTIC_RECONCILIATION";
}else if(onlyHeuristicAvailability){
  state="M419D4AR_AVAILABILITY_LIKE_FIELDS_PRESENT_BUT_SOURCE_NATIVE_AVAILABLE_SF_NOT_EXACTLY_PROVEN";
  classification="AVAILABILITY_CANDIDATES_REQUIRE_EXACT_SEMANTIC_BINDING";
  nextMilestone="M4.19D4AR1_AVAILABLE_SF_FIELD_SEMANTIC_BINDING_FORENSICS";
}else if(physicalOnly){
  state="M419D4AR_BUILDING_AREA_PRESENT_AVAILABLE_SF_NOT_PROVEN_SUBSTITUTION_BLOCKED";
  classification="PHYSICAL_BUILDING_AREA_ONLY_NO_MARKET_AVAILABILITY_FIELD";
  nextMilestone="M4.19D4AR2_LIGHTBOX_PROPERTY_AVAILABILITY_CONTRACT_CAPABILITY_FORENSICS";
}else{
  state="M419D4AR_SOURCE_NATIVE_AVAILABLE_SF_NOT_PRESENT_IN_QUALIFIED_PARCEL_RESPONSE";
  classification="NO_MARKET_AVAILABILITY_SEMANTIC_PRESENT_IN_POINT_PARCEL_RESPONSE";
  nextMilestone="M4.19D4AR2_LIGHTBOX_PROPERTY_AVAILABILITY_CONTRACT_CAPABILITY_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AR_SOURCE_NATIVE_AVAILABLE_SF_SEMANTIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:qualified?.boundIdentity??null,
  boundAddress:qualified?.boundAddress??null,
  selectedParcel:qualified?.selectedCandidate?{
    address:qualified.selectedCandidate.address??null,
    apn:qualified.selectedCandidate.apn??null,
    propertyId:qualified.selectedCandidate.propertyId??null
  }:null,
  rawResponse:{
    path:aq2RawPath,
    sha256:rawSha
  },
  semantics:{
    explicitAvailabilityFieldCount:explicitAvailability.length,
    availabilityCandidateCount:candidateAvailability.length,
    physicalAreaFieldCount:physicalNumerics.length,
    explicitAvailabilityFields:explicitAvailability,
    availabilityCandidates:candidateAvailability,
    physicalAreaFields:physicalNumerics,
    exactAvailableSfQualified,
    buildingAreaSubstitutionProhibited:true,
    buildingAreaSubstitutionPerformed:false
  },
  originalSourceCode:{
    filesScanned:sourceFiles.length,
    semanticReferenceFiles:sourceEvidence.length,
    evidence:sourceEvidence
  },
  classification,
  networkRequestsPerformed:0
};
write(semanticAuditPath,audit);

const manifest={
  contract:"SCIIP_EXPLORER_4_M4_19D4AR_AVAILABLE_SF_FIELD_PROVENANCE_MANIFEST",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:qualified?.boundIdentity??null,
  provider:"LIGHTBOX",
  sourceResponsePath:aq2RawPath,
  sourceResponseSha256:rawSha,
  fieldQualification:{
    classification,
    qualified:exactAvailableSfQualified,
    qualifiedField,
    explicitAvailabilityFields:explicitAvailability,
    physicalAreaFields:physicalNumerics
  },
  semanticPolicy:{
    physicalBuildingAreaIsNotAvailability:true,
    buildingSizeCannotSubstituteForAvailableSf:true,
    heuristicNameMatchCannotCreateAuthority:true,
    canonicalOrTemporalFallbackCannotBePromotedAsFreshLightBoxEvidence:true
  }
};
write(fieldManifestPath,manifest);

finish("PASSED",state,{
  qualification:{
    classification,
    canonicalPropertyId:qualified?.boundIdentity?.canonicalPropertyId??null,
    sourcePropertyId:qualified?.boundIdentity?.sourcePropertyId??null,
    selectedParcelAddress:qualified?.selectedCandidate?.address??null,
    rawResponseSha256:rawSha,
    explicitAvailabilityFieldCount:explicitAvailability.length,
    availabilityCandidateCount:candidateAvailability.length,
    physicalAreaFieldCount:physicalNumerics.length,
    sourceNativeAvailableSfQualified:exactAvailableSfQualified,
    qualifiedField,
    buildingAreaSubstitutionBlocked:true
  },
  policy:{
    sourceNativeFieldPathRequired:true,
    physicalBuildingAreaAndMarketAvailabilityMustRemainDistinct:true,
    buildingAreaCannotSubstituteForAvailableSf:true,
    noNetworkRequest:true,
    noBlindRetry:true,
    automaticRetry:false
  },
  artifacts:{
    semanticAudit:semanticAuditPath,
    fieldProvenanceManifest:fieldManifestPath
  },
  nextMilestone
},0);
