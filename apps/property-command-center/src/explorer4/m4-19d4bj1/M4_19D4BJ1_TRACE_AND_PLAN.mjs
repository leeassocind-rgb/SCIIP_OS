#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,walk,safeText,isoCandidates,norm}from"./M419D4BJ1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const bjPath=path.join(ev,"m4-19d4bj-controlled-production-cohort-selection-and-readiness.json");
const cohortPath=path.join(ev,"m4-19d4bj-five-property-production-cohort-manifest.json");
const out=path.join(ev,"m4-19d4bj1-five-property-lifecycle-preauthorization-and-gap-plan.json");
const perRecordPath=path.join(ev,"m4-19d4bj1-per-record-lineage-and-freshness-forensics.json");

function finish(state,x={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ1_CONTROLLED_FIVE_PROPERTY_COHORT_LIFECYCLE_PREAUTHORIZATION_AND_PER_RECORD_GAP_PLAN",
  version:"4.0-m4.19d4bj1",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,availabilityObservationIngested:false,syntheticIdentityUsed:false,syntheticTimestampUsed:false,broadScaleOutExecuted:false}
 };
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}

if(!fs.existsSync(bjPath)||!fs.existsSync(cohortPath))finish("M419D4BJ1_BJ_COHORT_ARTIFACTS_REQUIRED");
const bj=readJson(bjPath),manifest=readJson(cohortPath);
if(bj.state!=="M419D4BJ_FIVE_PROPERTY_CONTROLLED_PRODUCTION_COHORT_SELECTED_AND_READINESS_CERTIFIED_LIFECYCLE_PREAUTHORIZATION_REQUIRED")
 finish("M419D4BJ1_BJ_SELECTION_CERTIFICATION_REQUIRED",{observed:bj.state});

const cohort=manifest.cohort||[];
if(cohort.length!==5)finish("M419D4BJ1_EXACT_FIVE_PROPERTY_COHORT_REQUIRED",{observedCount:cohort.length});

// Bounded forensic scan. Exclude generated Explorer 4 milestone code/tests as fresh authority.
// Evidence is admissible for lineage/history discovery but never treated as fresh market observation authority.
const roots=[
 path.join(app,"public"),
 path.join(app,"src"),
 path.join(app,"server"),
 path.join(app,"tools"),
 path.join(app,"evidence")
].filter(fs.existsSync);

let files=[];
for(const r of roots){
 files.push(...walk(r,{
  maxFiles:1800,
  maxBytes:1572864,
  exclude:[
   "src/explorer4/",
   "node_modules/",
   ".git/",
   "__pycache__/",
   "dist/",
   "build/"
  ]
 }));
}
const uniq=new Map();for(const f of files)uniq.set(f.path,f);files=[...uniq.values()].slice(0,3500);

function admissibleAuthorityRole(rel){
 if(rel.includes("evidence/"))return"HISTORICAL_OR_GOVERNANCE_EVIDENCE";
 if(rel.includes("public/explorer/governed-base-inventory.json"))return"CURRENT_MATERIALIZED_PRODUCTION_RECORD";
 if(rel.match(/identity|canonical|temporal|observation|event|property_current|property-current|base.inventory|base-inventory|market/i))return"POSSIBLE_UPSTREAM_OR_IDENTITY_LINEAGE";
 return"SUPPORTING_SOURCE";
}

const results=[];
for(const c of cohort){
 const seeds=[
  norm(c.sourcePropertyId),
  norm(c.address),
  norm(c.recordHash),
  norm(c.canonicalPropertyId)
 ].filter(Boolean);
 const hits=[];
 for(const f of files){
  const text=safeText(f.path);if(!text)continue;
  const matched=seeds.filter(s=>text.includes(s));
  if(!matched.length)continue;
  const canon=[...new Set((text.match(/\bCPROP-[A-F0-9-]{8,}\b/g)||[]))].slice(0,20);
  const srcIds=[...new Set((text.match(/\b(?:PROPERTY|BASE)-[A-F0-9-]{8,}\b/g)||[]))].slice(0,20);
  const times=isoCandidates(text);
  const availableContext=[];
  const lower=text.toLowerCase();
  for(const term of ["availablesf","available sf","availability"]){
   let idx=lower.indexOf(term);
   if(idx>=0)availableContext.push(text.slice(Math.max(0,idx-180),Math.min(text.length,idx+320)));
  }
  hits.push({
   file:f.rel,
   role:admissibleAuthorityRole(f.rel),
   matchedSeeds:matched,
   canonicalIds:canon,
   sourceIds:srcIds,
   timestamps:times,
   availabilityContextCount:availableContext.length
  });
 }
 // Strong canonical candidates: same file must match sourcePropertyId or exact address and contain canonical id.
 const strongCanonical=[];
 for(const h of hits){
  const sourceMatched=c.sourcePropertyId&&h.matchedSeeds.includes(c.sourcePropertyId);
  const addressMatched=h.matchedSeeds.includes(c.address);
  if(!(sourceMatched||addressMatched))continue;
  for(const id of h.canonicalIds)strongCanonical.push({canonicalPropertyId:id,file:h.file,role:h.role,via:sourceMatched?"SOURCE_PROPERTY_ID":"EXACT_ADDRESS"});
 }
 const canonicalIds=[...new Set(strongCanonical.map(x=>x.canonicalPropertyId))];
 const exactCanonical=canonicalIds.length===1?canonicalIds[0]:null;

 // Freshness evidence is only "recovered" if timestamp appears in a non-evidence data/upstream file that also matched the exact record.
 const freshSourceHits=hits.filter(h=>
  h.role!=="HISTORICAL_OR_GOVERNANCE_EVIDENCE" &&
  h.role!=="SUPPORTING_SOURCE" &&
  h.timestamps.length>0 &&
  (h.matchedSeeds.includes(c.sourcePropertyId)||h.matchedSeeds.includes(c.address))
 );
 const freshnessRecovered=freshSourceHits.length>0;
 const allTimestamps=[...new Set(freshSourceHits.flatMap(x=>x.timestamps))].slice(0,10);

 const gapPlan=[];
 if(!exactCanonical)gapPlan.push(canonicalIds.length===0
  ?"RECOVER_OR_CREATE_CANONICAL_IDENTITY_FROM_EXISTING_IDENTITY_PIPELINE"
  :"ADJUDICATE_MULTIPLE_CANONICAL_IDENTITY_CANDIDATES");
 if(!freshnessRecovered)gapPlan.push("OBTAIN_SOURCE_NATIVE_CURRENT_AVAILABILITY_OBSERVATION_WITH_OBSERVATION_TIMESTAMP");
 gapPlan.push("VALIDATE_SOURCE_RECORD_REFERENCE_AND_SOURCE_NATIVE_AVAILABLE_SF_FIELD");
 gapPlan.push("PREAUTHORIZE_TEMPORAL_APPEND_BEFORE_ANY_CURRENT_STATE_PROMOTION");
 gapPlan.push("CERTIFY_GOVERNED_CURRENT_STATE_PARITY_AFTER_APPEND");
 gapPlan.push("CERTIFY_LIVE_EXPLORER_SEARCH_AND_RENDER_PARITY");

 results.push({
  cohortPosition:c.cohortPosition,
  inventoryRecordIndex:c.inventoryRecordIndex,
  address:c.address,
  city:c.city,
  sourcePropertyId:c.sourcePropertyId,
  currentAvailableSf:c.availableSf,
  latitude:c.latitude,longitude:c.longitude,
  recordHash:c.recordHash,
  forensicHitCount:hits.length,
  canonicalLineage:{
   strongCandidateCount:strongCanonical.length,
   uniqueCanonicalIdCount:canonicalIds.length,
   uniqueCanonicalIds:canonicalIds,
   exactCanonicalPropertyId:exactCanonical,
   ready:exactCanonical!==null,
   evidence:strongCanonical.slice(0,25)
  },
  freshnessLineage:{
   sourceNativeTimestampRecovered:freshnessRecovered,
   timestamps:allTimestamps,
   evidence:freshSourceHits.slice(0,20),
   ready:freshnessRecovered
  },
  executionGaps:gapPlan,
  lifecycleStages:[
   {stage:"IDENTITY_BINDING",ready:exactCanonical!==null},
   {stage:"SOURCE_NATIVE_FRESHNESS",ready:freshnessRecovered},
   {stage:"TEMPORAL_APPEND_PREAUTHORIZATION",ready:false},
   {stage:"CURRENT_STATE_PARITY",ready:false},
   {stage:"LIVE_EXPLORER_PARITY",ready:false}
  ]
 });
}

writeJson(perRecordPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ1_PER_RECORD_LINEAGE_AND_FRESHNESS_FORENSICS",
 version:"4.0-m4.19d4bj1",
 generatedAt:new Date().toISOString(),
 filesScanned:files.length,
 cohortSize:cohort.length,
 records:results
});

const summary={
 exactCanonicalReadyCount:results.filter(x=>x.canonicalLineage.ready).length,
 sourceNativeFreshnessReadyCount:results.filter(x=>x.freshnessLineage.ready).length,
 requiresCanonicalWorkCount:results.filter(x=>!x.canonicalLineage.ready).length,
 requiresFreshnessWorkCount:results.filter(x=>!x.freshnessLineage.ready).length,
 allFiveBoundedAndPlanned:results.length===5&&results.every(x=>x.executionGaps.length>=4),
 noWriteReadyYet:results.every(x=>!(x.canonicalLineage.ready&&x.freshnessLineage.ready))
};

const executionOrder=[
 "PHASE_1_CANONICAL_IDENTITY_LINEAGE_RECOVERY_OR_ADJUDICATION",
 "PHASE_2_SOURCE_NATIVE_AVAILABILITY_FRESHNESS_ACQUISITION",
 "PHASE_3_PER_RECORD_TEMPORAL_APPEND_PREAUTHORIZATION",
 "PHASE_4_CONTROLLED_FIVE_RECORD_TEMPORAL_APPEND",
 "PHASE_5_CURRENT_STATE_PARITY_AND_MATERIALIZATION_CERTIFICATION",
 "PHASE_6_LIVE_EXPLORER_FIVE_PROPERTY_PARITY_CERTIFICATION"
];

finish(summary.allFiveBoundedAndPlanned
 ?"M419D4BJ1_FIVE_PROPERTY_LIFECYCLE_GAP_PLAN_CERTIFIED_CONTROLLED_GAP_RESOLUTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED"
 :"M419D4BJ1_PER_RECORD_GAP_PLAN_INCOMPLETE_RECONCILIATION_REQUIRED",{
 planning:{
  cohortSize:5,
  repositoryFilesScanned:files.length,
  summary,
  executionOrder,
  executionAuthorized:false
 },
 records:results,
 policy:{
  originalSourceAndHistoricalEvidenceMayInformLineage:true,
  generatedExplorer4MilestoneCodeExcludedFromAuthority:true,
  evidenceArtifactsCannotSupplyFreshMarketAvailability:true,
  canonicalIdentityMustBeRecoveredOrAdjudicatedBeforeIdentityWrite:true,
  sourceNativeObservationTimestampRequiredBeforeAvailabilityWrite:true,
  temporalAppendBeforeCurrentStatePromotion:true,
  noBatchWriteUntilAllFiveRecordPlansAreBounded:true,
  noSyntheticIdentity:true,
  noSyntheticTimestamp:true,
  noNetworkRequest:true
 },
 artifacts:{perRecordForensics:perRecordPath},
 nextMilestone:"M4.19D4BJ2_FIVE_PROPERTY_CANONICAL_IDENTITY_LINEAGE_RECOVERY_AND_ADJUDICATION"
});
