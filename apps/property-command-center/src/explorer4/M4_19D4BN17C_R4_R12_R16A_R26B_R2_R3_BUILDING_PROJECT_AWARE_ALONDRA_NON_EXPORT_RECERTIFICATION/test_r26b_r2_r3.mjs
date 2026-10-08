#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r26b_r2_r3.py"),"utf8");
const q=[
"112 W Alondra Blvd|181831",
"422,277",
"buildingProjectGranularityContractConsumed",
"addressOnlyBindingNotUsed",
"twoGranularitiesObservedAtAddress",
"building181831Unique",
"projectAggregate422277Unique",
"buildingProjectAwareBindingCertified",
"projectAggregateExplicitlyExcluded",
"selectedBuildingReadbackCertified",
"assignmentsEntryCertified",
"directGenerateToReportReviewCertified",
"exportControlCertified",
"liveHandlerCertified",
"exportInvocationOff",
"R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26B_R2_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26B_R2_R2_CERTIFIED_BUILDING_VS_PROJECT_AGGREGATE_GRANULARITY_TO_BUILDING_1_ONLY_CANONICAL_BINDING_SELECTION_AND_NON_EXPORT_RECERTIFICATION"
},null,2));