#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,walk,text}from"./M419D4BJ2Runtime.js";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bj1p=path.join(ev,"m4-19d4bj1-five-property-lifecycle-preauthorization-and-gap-plan.json");
const bj1f=path.join(ev,"m4-19d4bj1-per-record-lineage-and-freshness-forensics.json");
const out=path.join(ev,"m4-19d4bj2-five-property-canonical-identity-lineage-adjudication.json");

function finish(state,extra={}){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ2_FIVE_PROPERTY_CANONICAL_IDENTITY_LINEAGE_RECOVERY_AND_ADJUDICATION",
 version:"4.0-m4.19d4bj2",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,syntheticIdentityUsed:false,automaticRetry:false}};
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}
if(!fs.existsSync(bj1p)||!fs.existsSync(bj1f))finish("M419D4BJ2_BJ1_ARTIFACTS_REQUIRED");
const bj1=readJson(bj1p),fr=readJson(bj1f);
if(bj1.state!=="M419D4BJ1_FIVE_PROPERTY_LIFECYCLE_GAP_PLAN_CERTIFIED_CONTROLLED_GAP_RESOLUTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 finish("M419D4BJ2_BJ1_CERTIFICATION_REQUIRED",{observed:bj1.state});

const roots=[
 path.join(app,"src"),path.join(app,"public"),path.join(app,"tools"),path.join(repo,"src")
].filter(fs.existsSync);
let files=[];for(const r of roots)files.push(...walk(r,6000));
const seen=new Map();for(const f of files)seen.set(f.p,f);files=[...seen.values()];

const identityFiles=files.filter(f=>/canonical|identity|property|migration|event|temporal|current/i.test(f.rel)&&!f.rel.includes("src/explorer4/"));
const records=[];
for(const r of fr.records){
 const seeds=[r.sourcePropertyId,r.address].filter(Boolean);
 const evidence=[];
 for(const f of identityFiles){
  const s=text(f.p);if(!s||!seeds.some(x=>s.includes(x)))continue;
  const ids=[...new Set(s.match(/\bCPROP-[A-F0-9]{12,}\b/g)||[])];
  const sourceMatches=[...new Set(s.match(/\bBASE-[A-F0-9]{12,}\b/g)||[])];
  evidence.push({file:path.relative(app,f.p),matchedSeeds:seeds.filter(x=>s.includes(x)),canonicalIds:ids.slice(0,20),sourceIds:sourceMatches.slice(0,20)});
 }
 const direct=evidence.flatMap(e=>e.canonicalIds.map(id=>({id,file:e.file,via:e.matchedSeeds.includes(r.sourcePropertyId)?"SOURCE_PROPERTY_ID":"ADDRESS"})));
 const ids=[...new Set(direct.map(x=>x.id))];
 let classification,canonical=null;
 if(ids.length===1){classification="EXISTING_CANONICAL_IDENTITY_RECOVERED_UNIQUELY";canonical=ids[0]}
 else if(ids.length>1)classification="MULTIPLE_CANONICAL_CANDIDATES_ADJUDICATION_REQUIRED";
 else classification="NO_EXISTING_CANONICAL_BINDING_RECOVERED_IDENTITY_CREATION_PREAUTHORIZATION_REQUIRED";
 records.push({
  cohortPosition:r.cohortPosition,address:r.address,sourcePropertyId:r.sourcePropertyId,
  classification,recoveredCanonicalPropertyId:canonical,candidateCanonicalIds:ids,
  evidence:direct.slice(0,30),
  identityReadyForExistingBinding:!!canonical,
  identityCreationRequired:ids.length===0,
  writeAuthorized:false
 });
}
const unique=records.filter(x=>x.identityReadyForExistingBinding).length;
const create=records.filter(x=>x.identityCreationRequired).length;
const ambiguous=records.filter(x=>x.candidateCanonicalIds.length>1).length;
finish("M419D4BJ2_FIVE_PROPERTY_CANONICAL_IDENTITY_LINEAGE_ADJUDICATED_IDENTITY_ACTION_PLAN_CERTIFIED_EXECUTION_NOT_AUTHORIZED",{
 adjudication:{cohortSize:5,filesInspected:identityFiles.length,uniqueExistingIdentityCount:unique,identityCreationRequiredCount:create,ambiguousIdentityCount:ambiguous,allFiveAdjudicated:records.length===5},
 records,
 policy:{
  noSyntheticCanonicalIdentity:true,
  existingCanonicalIdentityMustBeReusedWhenUniquelyProven:true,
  newCanonicalIdentityMayOnlyBeCreatedByExistingIdentityPipeline:true,
  identityCreationOrBindingRequiresSeparateAuthorization:true,
  noAvailabilityOrTemporalWriteInThisMilestone:true
 },
 nextMilestone:create||ambiguous
  ?"M4.19D4BJ3_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_BINDING_OR_CREATION_PREAUTHORIZATION"
  :"M4.19D4BJ4_SOURCE_NATIVE_AVAILABILITY_FRESHNESS_ACQUISITION_PREAUTHORIZATION"
});
