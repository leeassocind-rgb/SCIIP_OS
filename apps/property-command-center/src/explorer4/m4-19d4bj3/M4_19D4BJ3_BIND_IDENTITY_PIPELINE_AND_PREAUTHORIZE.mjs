#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,sha,walk,text}from"./M419D4BJ3Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bj2p=path.join(ev,"m4-19d4bj2-five-property-canonical-identity-lineage-adjudication.json");
const out=path.join(ev,"m4-19d4bj3-five-property-canonical-identity-creation-preauthorization.json");

function finish(state,extra={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_PREAUTHORIZATION",
  version:"4.0-m4.19d4bj3",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,syntheticIdentityUsed:false,identityCreationExecuted:false,automaticRetry:false}
 };
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}

if(!fs.existsSync(bj2p))finish("M419D4BJ3_BJ2_ADJUDICATION_REQUIRED");
const bj2=readJson(bj2p);
if(bj2.state!=="M419D4BJ2_FIVE_PROPERTY_CANONICAL_IDENTITY_LINEAGE_ADJUDICATED_IDENTITY_ACTION_PLAN_CERTIFIED_EXECUTION_NOT_AUTHORIZED")
 finish("M419D4BJ3_BJ2_CERTIFICATION_REQUIRED",{observed:bj2.state});

const recs=bj2.records||[];
if(recs.length!==5||!recs.every(r=>r.identityCreationRequired===true))
 finish("M419D4BJ3_EXACT_FIVE_IDENTITY_CREATION_TARGETS_REQUIRED",{recordCount:recs.length});

const files=walk(app,7000).filter(f=>/identity|canonical|property|migration|event|graph|asset/i.test(f.rel));
const candidates=[];
for(const f of files){
 const s=text(f.p);if(!s)continue;
 const score=[
  /canonicalPropertyId/i.test(s),
  /create.*canonical|canonical.*create/i.test(s),
  /identity.*create|create.*identity/i.test(s),
  /sourcePropertyId/i.test(s),
  /CPROP-/i.test(s),
  /event/i.test(s),
  /append/i.test(s)
 ].filter(Boolean).length;
 if(score>=3)candidates.push({path:f.rel,score});
}
candidates.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));

const top=candidates.slice(0,25);
const uniqueBest=top.length>0 && (top.length===1 || top[0].score>top[1].score);
const pipelineBinding=uniqueBest?top[0]:null;

const targets=recs.map((r,i)=>({
 cohortPosition:r.cohortPosition,
 address:r.address,
 sourcePropertyId:r.sourcePropertyId,
 creationRequired:true,
 preauthorizationInputHash:sha({
  cohortPosition:r.cohortPosition,
  address:r.address,
  sourcePropertyId:r.sourcePropertyId,
  action:"CREATE_CANONICAL_IDENTITY_THROUGH_EXISTING_PIPELINE"
 }),
 requiredAction:"CREATE_CANONICAL_IDENTITY_THROUGH_EXISTING_PIPELINE",
 executionAuthorized:false
}));

finish(pipelineBinding
 ?"M419D4BJ3_EXISTING_CANONICAL_IDENTITY_CREATION_PIPELINE_UNIQUELY_BOUND_FIVE_RECORD_CREATION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"
 :"M419D4BJ3_CANONICAL_IDENTITY_CREATION_PIPELINE_NOT_UNIQUELY_BOUND_FORENSICS_REQUIRED",{
 binding:{
  candidateCount:candidates.length,
  topCandidates:top,
  uniqueBinding:pipelineBinding
 },
 targets,
 policy:{
  exactlyFiveIdentityCreationsMaximum:true,
  existingIdentityPipelineRequired:true,
  directSyntheticCPROPGenerationProhibited:true,
  duplicateIdentityRecheckRequiredImmediatelyBeforeCreation:true,
  sourcePropertyIdAndAddressMustRemainBound:true,
  noAvailabilityOrTemporalWrite:true,
  explicitAuthorizationRequiredBeforeExecution:true
 },
 nextMilestone:pipelineBinding
  ?"M4.19D4BJ4_CONTROLLED_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_EXECUTION"
  :"M4.19D4BJ3A_EXACT_IDENTITY_CREATION_PIPELINE_INVOCATION_FORENSICS"
});
