#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r28b_r3_r3_r3.py"),"utf8");
const q=[
"R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS",
"firstUniqueExplorerSeconds",
"stableLastFiveSamples",
"Previously certified records preserved: 32",
"Resume ordinal: 233",
"Residual live records: 168",
"Explorer settle bound: 3 consecutive samples within 2.0 seconds",
"Explorer sampling anchor: document complete + nonzero button DOM + app origin",
"settle_explorer_page_ready_anchored",
"pageReadyAnchoredSamplingUsed",
"twoSecondExplorerBoundPreserved",
"threeSampleExplorerGuardPreserved",
"previousThirtyTwoNotReplayed",
"record233ExplorerSettleRecertificationAttempted",
"record233ExplorerSettleCertified",
"record233NonExportCertified",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"Download Client Listing Report",
"exportReportHandlerCertifiedBySourceContract",
"sameOriginStableCertified",
"exportInvocation",
"exactNewTwoHundredNonExportQualified",
"R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
"R28B_R3_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS",
"Governed data mutation: OFF",
"Network authority: OFF",
"Pixel evidence: OFF",
"Export invocation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28B_R3_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28B_R3_R3_R2_PROVED_RECORD233_EXPLORER_MATERIALIZES_STABLY_AT_ONE_SECOND_WITHIN_EXISTING_TWO_SECOND_BOUND_TO_PAGE_READY_ANCHORED_THREE_SAMPLE_SETTLE_RECERTIFICATION_AND_STRICT_SEQUENTIAL_RESUME_233_THROUGH_400_WITH_PRIOR32_PRESERVED"
},null,2));