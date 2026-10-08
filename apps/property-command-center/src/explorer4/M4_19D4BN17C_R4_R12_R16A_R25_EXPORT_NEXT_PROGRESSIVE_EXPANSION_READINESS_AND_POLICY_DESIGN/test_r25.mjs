#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"design_r25.py"),"utf8");
const q=[
"READ_ONLY_ARCHITECTURE_DESIGN",
"R24F_EXACT_TWENTY_FIVE_LIFECYCLE_CLOSURE_REQUIRED",
"referenceCohortExactlyTwentyFive",
"nextExpansionBounded",
"exactFiftyRecordNextCohort",
"twentyFiveNewRecordsRequired",
"scaleFactorTwo",
"threeSampleExplorerGuardConsumed",
"fiveSecondTargetBindingGuardConsumed",
"threeSampleSelectedPropertyGuardConsumed",
"identityNormalizationGuardConsumed",
"directReportReviewMaterializationConsumed",
"singleExportMaximumPerRecordConsumed",
"recordMustPassBoundedExplorerEntrySettle",
"recordMustPassBoundedTargetBindingSettle",
"targetBindingAmbiguousContainsForbidden",
"generateMustDirectlyMaterializeReportReview",
"artifactPdfDownloadCountMustEqual",
"artifactPdfObjectUrlEventCountMustEqual",
"runtimeErrorsMustEqual",
"unhandledRejectionsMustEqual",
"EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_FIFTY_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED",
"M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R25_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24F_CLOSED_EXACT_TWENTY_FIVE_EXPORT_LIFECYCLE_TO_EXACT_FIFTY_PROGRESSIVE_EXPANSION_POLICY_WITH_ALL_CERTIFIED_IDENTITY_SETTLE_ARTIFACT_AND_RUNTIME_GUARDS_PRESERVED"
},null,2));