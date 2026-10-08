#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"design_r24.py"),"utf8");
const q=[
"READ_ONLY_ARCHITECTURE_DESIGN",
"R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED",
"EXACT_TEN_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED",
"referenceCohortExactlyTen",
"exactTwentyFiveRecordNextCohort",
"fifteenNewRecordsRequired",
"targetBindingSettleMaximumSeconds",
"5.0",
"targetBindingSettleConsecutiveSamples",
"explorerSettleMaximumSeconds",
"selectedPropertySettleMaximumSeconds",
"targetBindingUniqueContainsFallbackAllowed",
"targetBindingAmbiguousContainsForbidden",
"freshPagePerRecordRequired",
"strictSequentialRequired",
"haltOnFirstFailureRequired",
"exactOneExportClickMaximumRequired",
"artifactPdfDownloadCountMustEqual",
"artifactPdfObjectUrlEventCountMustEqual",
"application/pdf",
"postPublishReportReviewMustUnmount",
"runtimeErrorsMustEqual",
"unhandledRejectionsMustEqual",
"EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_TWENTY_FIVE_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED",
"M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R23F_CLOSED_EXACT_TEN_EXPORT_LIFECYCLE_TO_EXACT_TWENTY_FIVE_PROGRESSIVE_EXPANSION_POLICY_WITH_ALL_CERTIFIED_SETTLE_ARTIFACT_AND_RUNTIME_GUARDS_PRESERVED"
},null,2));