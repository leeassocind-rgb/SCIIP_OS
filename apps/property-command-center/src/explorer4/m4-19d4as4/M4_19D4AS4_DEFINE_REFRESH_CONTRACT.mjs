#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION} from "./M419D4AS4Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const as3Path=path.join(ev,"m4-19d4as3-preferred-market-availability-candidate-source-native-provenance-completion.json");
const resultPath=path.join(ev,"m4-19d4as4-market-availability-refresh-source-freshness-contract-definition.json");
const contractPath=path.join(ev,"m4-19d4as4-market-availability-refresh-source-contract.json");
const freshnessPath=path.join(ev,"m4-19d4as4-market-availability-freshness-policy.json");
const workflowPath=path.join(ev,"m4-19d4as4-market-availability-refresh-workflow-manifest.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const out={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
  automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,sourceMutationPerformed:false,processMutationPerformed:false,
  canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,
  operationalIngestionPerformed:false,availabilityObservationIngested:false,
  syntheticTimestampUsed:false,staleValuePromotedToCurrent:false,automaticRetry:false
 }};
 write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(code);
}

if(!fs.existsSync(as3Path)) finish("BLOCKED","M419D4AS4_AS3_RESULT_REQUIRED",{},3);
const as3=JSON.parse(fs.readFileSync(as3Path,"utf8"));
if(as3.state!=="M419D4AS3_GOVERNED_BASE_INVENTORY_SOURCE_NATIVE_FRESHNESS_NOT_RECOVERED_OPERATOR_OR_REFRESH_SOURCE_REQUIRED"){
 finish("BLOCKED","M419D4AS4_AS3_FRESHNESS_NOT_RECOVERED_STATE_REQUIRED",{observed:as3.state},3);
}

const refreshContract={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS4_MARKET_AVAILABILITY_REFRESH_SOURCE_CONTRACT",
 version:VERSION,
 generatedAt:new Date().toISOString(),
 authoritativeTarget:"governed-base-inventory.json",
 semanticField:"availableSf",
 semanticDefinition:"Square feet actively available to the market for occupancy or lease at the observation time.",
 requiredRefreshObservation:{
  canonicalPropertyId:"REQUIRED",
  sourcePropertyId:"REQUIRED_IF_SOURCE_HAS_STABLE_ID",
  address:"REQUIRED",
  availableSf:"REQUIRED_EXPLICIT_VALUE_OR_EXPLICIT_NOT_AVAILABLE",
  provider:"REQUIRED",
  sourceType:"REQUIRED",
  sourceRecordIdOrStableReference:"REQUIRED",
  sourceNativeFieldPath:"REQUIRED",
  observationTimestamp:"REQUIRED_SOURCE_OR_OPERATOR_OBSERVATION_TIME",
  capturedAt:"REQUIRED_SYSTEM_CAPTURE_TIME",
  rawEvidenceReference:"REQUIRED",
  rawEvidenceHash:"REQUIRED",
  identityMatchEvidence:"REQUIRED",
  confidence:"REQUIRED",
  status:"REQUIRED"
 },
 acceptableRefreshSourceFamilies:[
  {
   id:"OWNER_OR_PROPERTY_MANAGER",
   authorityRank:4,
   examples:["owner availability report","property manager rent roll or availability report","landlord confirmation"]
  },
  {
   id:"MARKET_LISTING_PROVIDER",
   authorityRank:3,
   examples:["active listing feed","brokerage listing database","market availability service"]
  },
  {
   id:"BROKERAGE_INTERNAL_MARKET_INTELLIGENCE",
   authorityRank:2,
   examples:["broker-maintained availability survey","internal market inventory","verified broker canvass"]
  },
  {
   id:"GOVERNED_OPERATOR_OBSERVATION",
   authorityRank:2,
   examples:["operator-entered availability backed by brochure, listing, email, call note, or other evidence"]
  }
 ],
 prohibitedRefreshSources:[
  "LightBox parcel/property intelligence",
  "comparable transaction data alone",
  "building area",
  "GLA without explicit availability assertion",
  "derived market cube without upstream observation",
  "canonical fallback without fresh evidence",
  "temporal fallback without fresh evidence"
 ],
 zeroSemantics:{
  zeroMeans:"EXPLICITLY_OBSERVED_ZERO_SF_CURRENTLY_AVAILABLE",
  missingDoesNotMeanZero:true,
  nullDoesNotMeanZero:true,
  expiredListingDoesNotAutomaticallyMeanZero:true
 },
 executionAuthorized:false
};
write(contractPath,refreshContract);

const freshnessPolicy={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS4_MARKET_AVAILABILITY_FRESHNESS_POLICY",
 version:VERSION,
 generatedAt:new Date().toISOString(),
 freshnessClock:"observationTimestamp",
 capturedAtRole:"AUDIT_ONLY_NOT_SUBSTITUTE_FOR_OBSERVATION_TIMESTAMP",
 classes:[
  {id:"FRESH",ageHoursMax:72,behavior:"ELIGIBLE_FOR_CURRENT_STATE_AFTER_IDENTITY_AND_PROVENANCE_QUALIFICATION"},
  {id:"AGING",ageHoursMinExclusive:72,ageHoursMax:168,behavior:"DISPLAY_WITH_AGE_WARNING_REFRESH_RECOMMENDED"},
  {id:"STALE",ageHoursMinExclusive:168,behavior:"NOT_ELIGIBLE_TO_ASSERT_CURRENT_MARKET_AVAILABILITY"},
  {id:"UNKNOWN",behavior:"NOT_ELIGIBLE_TO ASSERT_CURRENT MARKET AVAILABILITY"}
 ],
 policies:{
  sourceTimestampPreferred:true,
  governedOperatorObservationTimestampAllowedWithEvidence:true,
  fileModificationTimeProhibited:true,
  buildTimeProhibited:true,
  materializationTimeProhibitedAsFreshness:true,
  missingTimestampMeansUnknownFreshness:true,
  staleObservationRetainedHistorically:true,
  staleObservationCannotSilentlyPopulateCurrentState:true
 }
};
write(freshnessPath,freshnessPolicy);

const workflow={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS4_MARKET_AVAILABILITY_REFRESH_WORKFLOW_MANIFEST",
 version:VERSION,
 generatedAt:new Date().toISOString(),
 stages:[
  "SOURCE_OBSERVATION_CAPTURE",
  "PROPERTY_IDENTITY_BINDING",
  "SOURCE_PROVENANCE_VALIDATION",
  "AVAILABLE_SF_SEMANTIC_VALIDATION",
  "OBSERVATION_TIMESTAMP_VALIDATION",
  "FRESHNESS_CLASSIFICATION",
  "CONFLICT_RECONCILIATION",
  "TEMPORAL_OBSERVATION_APPEND",
  "CURRENT_STATE_PROMOTION_IF_ELIGIBLE",
  "DOWNSTREAM_MATERIALIZATION"
 ],
 conflictPolicy:{
  higherAuthorityDoesNotAutomaticallyBeatNewerEvidence:true,
  authorityAndFreshnessBothRequired:true,
  sameAuthoritySameFreshnessConflictRequiresReview:true,
  explicitOwnerOrManagerConfirmationMaySupersedeLowerAuthorityListing:true,
  newerLowerAuthorityObservationCannotAutomaticallyOverrideExplicitHigherAuthorityContradiction:true
 },
 mutationPolicy:{
  thisMilestoneAuthorizesWrites:false,
  futureRefreshExecutionRequiresExplicitAuthorization:true,
  temporalAppendBeforeCurrentStatePromotion:true,
  downstreamMaterializationOnlyAfterAuthorityDecision:true
 },
 nextMilestone:"M4.19D4AT_MARKET_AVAILABILITY_REFRESH_INPUT_CONTRACT_AND_SINGLE_RECORD_PREAUTHORIZATION"
};
write(workflowPath,workflow);

finish("PASSED","M419D4AS4_MARKET_AVAILABILITY_REFRESH_SOURCE_AND_FRESHNESS_CONTRACT_CERTIFIED_EXECUTION_NOT_AUTHORIZED",{
 definition:{
  authoritativeTarget:"governed-base-inventory.json",
  availableSfSemantic:refreshContract.semanticDefinition,
  acceptedSourceFamilyCount:refreshContract.acceptableRefreshSourceFamilies.length,
  freshnessClock:"observationTimestamp",
  freshMaxAgeHours:72,
  agingMaxAgeHours:168,
  staleAfterHours:168,
  currentStatePromotionRequiresFreshness:true
 },
 policy:{
  governedBaseInventoryRemainsPreferredCurrentStateDataset:true,
  freshnessMustComeFromObservationTimestamp:true,
  capturedAtCannotSubstituteForObservationTimestamp:true,
  missingTimestampMeansUnknownFreshness:true,
  staleAvailabilityRetainedHistoricallyButNotAssertedAsCurrent:true,
  lightBoxExcludedFromAvailabilityAuthority:true,
  networkRequestsPerformed:0
 },
 artifacts:{
  refreshSourceContract:contractPath,
  freshnessPolicy:freshnessPath,
  refreshWorkflowManifest:workflowPath
 },
 nextMilestone:"M4.19D4AT_MARKET_AVAILABILITY_REFRESH_INPUT_CONTRACT_AND_SINGLE_RECORD_PREAUTHORIZATION"
});
