#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,sha,normLocator,recordIdentityStrength,directAddress,sourceFamily
} from "./M419D4AH7Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const ah6Path=path.join(ev,"m4-19d4ah6-coordinate-validation-repair-true-locator-recovery.json");
const preauthPath=path.join(ev,"m4-19d4ad-single-record-enrich-read-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4ah7-record-structural-locator-reconciliation-certification.json");
const auditPath=path.join(ev,"m4-19d4ah7-record-structural-locator-reconciliation-audit.json");
const locatorManifestPath=path.join(ev,"m4-19d4ah7-certified-locator-manifest.json");

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
      syntheticLocatorUsed:false,proximitySearchUsed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [ah6Path,preauthPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AH7_PREREQUISITE_MISSING",{path:p},3);
}
const ah6=JSON.parse(fs.readFileSync(ah6Path,"utf8"));
if(ah6?.state!=="M419D4AH6_COORDINATE_VALIDATION_REPAIRED_TRUE_LOCATOR_RECOVERY_CERTIFIED"){
  finish("BLOCKED","M419D4AH7_AH6_CERTIFIED_STATE_REQUIRED",{observed:ah6?.state??null},3);
}
const preauth=JSON.parse(fs.readFileSync(preauthPath,"utf8"));
const canonicalId=preauth?.sample?.canonicalPropertyId;
const sourceId=preauth?.sample?.sourcePropertyId;
if(!canonicalId||!sourceId) finish("BLOCKED","M419D4AH7_BOUND_IDENTITY_REQUIRED",{},3);

const roots=[
  path.join(app,"src/production-validation"),
  path.join(app,"public/production-validation-data"),
  ev
].filter(fs.existsSync);

const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p);
    else if(path.extname(ent.name).toLowerCase()===".json")files.push(p);
  }
}
for(const r of roots)walk(r);

const recordHits=[];
function visit(node,file,trail=[]){
  if(Array.isArray(node)){
    node.forEach((v,i)=>visit(v,file,[...trail,String(i)]));
    return;
  }
  if(!node||typeof node!=="object")return;

  const strength=recordIdentityStrength(node,canonicalId,sourceId);
  if(strength>0){
    const address=directAddress(node);
    if(address){
      recordHits.push({
        file,
        family:sourceFamily(file),
        objectPath:trail.join(".")||"$",
        identityStrength:strength,
        hasCanonicalId:strength>=2,
        hasSourceId:strength===1||strength===3,
        address,
        normalizedAddress:normLocator(address),
        recordSha256:sha(JSON.stringify(node))
      });
    }
  }

  for(const [k,v] of Object.entries(node)){
    if(v&&typeof v==="object")visit(v,file,[...trail,k]);
  }
}

let parsedFiles=0,parseFailures=0;
for(const p of files){
  let doc;
  try{doc=JSON.parse(fs.readFileSync(p,"utf8"));parsedFiles++}catch{parseFailures++;continue}
  visit(doc,p,[]);
}

// Deduplicate exact same record/address/file/path hits.
const hitMap=new Map();
for(const h of recordHits){
  const key=[h.file,h.objectPath,h.normalizedAddress,h.identityStrength].join("|");
  if(!hitMap.has(key))hitMap.set(key,h);
}
const hits=[...hitMap.values()];

const groups=new Map();
for(const h of hits){
  if(!h.normalizedAddress)continue;
  if(!groups.has(h.normalizedAddress)){
    groups.set(h.normalizedAddress,{
      normalizedAddress:h.normalizedAddress,
      representativeAddress:h.address,
      hits:[],
      families:new Set(),
      canonicalFamilies:new Set(),
      sourceFamilies:new Set()
    });
  }
  const g=groups.get(h.normalizedAddress);
  g.hits.push(h);
  g.families.add(h.family);
  if(h.hasCanonicalId)g.canonicalFamilies.add(h.family);
  if(h.hasSourceId)g.sourceFamilies.add(h.family);
}

const candidates=[...groups.values()].map(g=>({
  normalizedAddress:g.normalizedAddress,
  address:g.representativeAddress,
  hitCount:g.hits.length,
  families:[...g.families].sort(),
  familyCount:g.families.size,
  canonicalIdentityFamilyCount:g.canonicalFamilies.size,
  sourceIdentityFamilyCount:g.sourceFamilies.size,
  authoritativeCanonicalIdentity:
    g.families.has("SRC_CANONICAL_IDENTITY") ||
    g.families.has("PUBLIC_CANONICAL_IDENTITY"),
  independentCorroboration:
    g.families.size>=2,
  strongestIdentityStrength:Math.max(...g.hits.map(h=>h.identityStrength)),
  evidence:g.hits.map(h=>({
    file:h.file,
    family:h.family,
    objectPath:h.objectPath,
    identityStrength:h.identityStrength,
    recordSha256:h.recordSha256
  }))
}));

// Qualification is deliberately strict:
// - same parsed record owns identity + address
// - at least one canonical identity artifact
// - at least two source families
// - at least one hit that directly/shallowly binds canonical ID
const qualified=candidates.filter(c=>
  c.authoritativeCanonicalIdentity &&
  c.independentCorroboration &&
  c.strongestIdentityStrength>=2
);

let classification,next,state;
if(qualified.length===1){
  classification="ONE_STRUCTURALLY_BOUND_CORROBORATED_LOCATOR_CERTIFIED";
  state="M419D4AH7_ONE_RECORD_STRUCTURAL_LOCATOR_CERTIFIED_GEOCODE_PREAUTHORIZATION_READY";
  next="M4.19D4AI_CERTIFIED_ADDRESS_LOCATOR_GEOCODE_PREAUTHORIZATION";
}else if(qualified.length>1){
  classification="MULTIPLE_STRUCTURALLY_BOUND_CORROBORATED_LOCATORS_REQUIRE_PRECEDENCE_RECONCILIATION";
  state="M419D4AH7_MULTIPLE_STRUCTURAL_LOCATORS_REQUIRE_PRECEDENCE_RECONCILIATION";
  next="M4.19D4AH8_LOCATOR_PRECEDENCE_AND_ALIAS_RECONCILIATION";
}else{
  classification="NO_STRUCTURALLY_BOUND_CORROBORATED_LOCATOR_QUALIFIED";
  state="M419D4AH7_NO_STRUCTURAL_LOCATOR_QUALIFIED_EXTERNAL_LOCATOR_EVIDENCE_REQUIRED";
  next="M4.19D4AH8_EXTERNAL_LOCATOR_EVIDENCE_ACQUISITION_POLICY";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AH7_RECORD_STRUCTURAL_LOCATOR_RECONCILIATION_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  boundIdentity:{canonicalPropertyId:canonicalId,sourcePropertyId:sourceId},
  searchPolicy:{
    parsedJsonObjectsOnly:true,
    proximitySearch:false,
    sameRecordIdentityAndAddressRequired:true,
    shallowIdentityObjectAllowed:true,
    shallowAddressObjectAllowed:true,
    arbitraryDescendantAssociationProhibited:true
  },
  inventory:{
    jsonFilesConsidered:files.length,
    parsedFiles,
    parseFailures,
    structuralRecordHits:hits.length,
    normalizedCandidates:candidates.length,
    qualifiedCandidates:qualified.length
  },
  candidates,
  qualifiedCandidates:qualified,
  classification,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0
};
write(auditPath,audit);

const artifacts={structuralReconciliationAudit:auditPath};
if(qualified.length===1){
  const q=qualified[0];
  const locatorManifest={
    contract:"SCIIP_EXPLORER_4_M4_19D4AH7_CERTIFIED_LOCATOR_MANIFEST",
    version:VERSION,
    generatedAt:new Date().toISOString(),
    boundIdentity:{canonicalPropertyId:canonicalId,sourcePropertyId:sourceId},
    locator:{
      address:q.address,
      normalizedAddress:q.normalizedAddress,
      sourceBacked:true,
      structurallyBound:true,
      corroborated:true,
      families:q.families,
      strongestIdentityStrength:q.strongestIdentityStrength
    },
    evidence:q.evidence,
    geocodeExecutionAuthorized:false,
    explicitAuthorizationRequired:true,
    maximumFutureGeocodeRequests:1,
    automaticRetry:false
  };
  write(locatorManifestPath,locatorManifest);
  artifacts.certifiedLocatorManifest=locatorManifestPath;
}

finish("PASSED",state,{
  reconciliation:{
    classification,
    priorBroadCandidateCount:ah6?.locatorRecovery?.candidateCount??143,
    parsedFiles,
    structuralRecordHits:hits.length,
    normalizedCandidateCount:candidates.length,
    qualifiedCandidateCount:qualified.length,
    qualifiedCandidates:qualified.map(q=>({
      address:q.address,
      normalizedAddress:q.normalizedAddress,
      families:q.families,
      familyCount:q.familyCount,
      strongestIdentityStrength:q.strongestIdentityStrength
    }))
  },
  policy:{
    proximityEvidenceRejected:true,
    sameRecordOwnershipRequired:true,
    authoritativeCanonicalArtifactRequired:true,
    independentFamilyCorroborationRequired:true,
    noGeocodeExecutionAuthorized:true,
    automaticRetry:false
  },
  artifacts,
  nextMilestone:next
},0);
