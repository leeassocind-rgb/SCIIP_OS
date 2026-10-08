#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{write}from"./M419D4BH4BBIRuntime.js";
const repo=path.resolve(process.argv[2]||"."),ev=path.join(repo,"apps/property-command-center/evidence");
const bh4=path.join(ev,"m4-19d4bh4b-live-explorer-bessemer-search-selection-certification.json");
const out=path.join(ev,"m4-19d4bi-single-record-refresh-lifecycle-closure-and-scale-out-readiness.json");
const manifest=path.join(ev,"m4-19d4bi-single-record-lifecycle-closure-manifest.json");
function done(status,state,x={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS",version:"4.0-m4.19d4bi-r2",status,state,certifiedAt:new Date().toISOString(),...x,authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,currentStateMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(status==="PASSED"?0:3)}
if(!fs.existsSync(bh4))done("BLOCKED","M419D4BI_BH4B_CERTIFICATION_REQUIRED");
const b=JSON.parse(fs.readFileSync(bh4,"utf8"));
if(b.state!=="M419D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFIED")done("BLOCKED","M419D4BI_LIVE_EXPLORER_CERTIFICATION_REQUIRED",{observed:b.state});
const t=b.certification.target;
const stages=[
 "CERTIFIED_PROPERTY_IDENTITY",
 "SOURCE_BACKED_GOOGLE_COORDINATES",
 "QUALIFIED_LIGHTBOX_PARCEL_EVIDENCE",
 "MARKET_AVAILABILITY_SOURCE_SEPARATION",
 "SOURCE_BACKED_AVAILABILITY_OBSERVATION",
 "TEMPORAL_AVAILABILITY_APPEND",
 "GOVERNED_BASE_INVENTORY_INSERTION",
 "POST_INSERTION_CERTIFICATION",
 "SAFE_IN_PLACE_SPATIAL_MATERIALIZATION",
 "RUNTIME_TO_UI_DATAFLOW_CERTIFICATION",
 "LIVE_BROWSER_RUNTIME_CERTIFICATION",
 "LIVE_EXPLORER_NAVIGATION_AND_SEARCH_BINDING",
 "LIVE_BESSEMER_SEARCH_SELECTION_AND_VISIBILITY"
];
const m={contract:"SCIIP_EXPLORER_4_M4_19D4BI_SINGLE_RECORD_LIFECYCLE_CLOSURE_MANIFEST",version:"4.0-m4.19d4bi-r2",generatedAt:new Date().toISOString(),canonicalPropertyId:t.canonicalPropertyId,address:t.address,availableSf:t.availableSf,latitude:t.latitude,longitude:t.longitude,completedStages:stages,completedStageCount:stages.length,singleRecordLifecycleClosed:true,scaleOutReadiness:"CONTROLLED_MULTI_RECORD_COHORT_PREAUTHORIZATION_READY",recommendedNextBatchSize:5,broadAutomaticScaleOut:false,availabilityEvidencePolicy:"OPERATOR_OR_SOURCE_BACKED_MARKET_AVAILABILITY_REQUIRED"};
write(manifest,m);
done("PASSED","M419D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSED_CONTROLLED_MULTI_RECORD_SCALE_OUT_PREAUTHORIZATION_READY",{certification:{canonicalPropertyId:t.canonicalPropertyId,address:t.address,availableSf:t.availableSf,latitude:t.latitude,longitude:t.longitude,completedStageCount:stages.length,singleRecordLifecycleClosed:true,recommendedNextBatchSize:5,scaleOutReadiness:m.scaleOutReadiness},policy:{singleRecordPathEndToEndCertified:true,controlledCohortRequired:true,broadAutomaticScaleOutProhibited:true,operatorOrSourceBackedAvailabilityEvidenceRequired:true,lightBoxRemainsParcelOnly:true},artifacts:{lifecycleClosureManifest:manifest},nextMilestone:"M4.19D4BJ_CONTROLLED_MULTI_RECORD_MARKET_AVAILABILITY_REFRESH_COHORT_PREAUTHORIZATION"});
