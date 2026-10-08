#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"design_r28.py"),"utf8");
const q=[
"authoritativeReferenceEvidence",
"exactCombinedCertifiedCount",
"REFERENCE_COHORT_SIZE:",
"NEXT_COHORT_SIZE:",
"PROGRESSIVE_DELTA_TWO_HUNDRED",
"heuristicReferenceEvidenceCandidateIgnored",
"referenceTwoHundredWillNotBeReexported",
"SELECT_QUALIFY_AND_EXECUTE_EXACT_NEW_200_ONLY",
"mustProduceExactNew200",
"mustBeDeterministic",
"nonExportQualification",
"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM",
"ambiguousContainsForbidden",
"buildingProjectAwareCanonicalBindingRequired",
"requiresSeparatePostQualificationAuthorization",
"maxExportClicksPerRecord",
"pdfDownloadCountMustEqual",
"pdfObjectUrlEventCountMustEqual",
"application/pdf",
"errorsMustEqual",
"unhandledRejectionsMustEqual",
"postPublishReportReviewMustUnmount",
"explorerMustRemainMounted",
"sameOriginMustRemain",
"R28_LIVE_EXPORT_AUTHORIZED: False",
"R28A_EXACT_FOUR_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
"Export invocation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R27E_EXACT200_LIFECYCLE_CLOSED_TO_EXACT400_PROGRESSIVE_DELTA200_POLICY_WITH_DIRECT_AUTHORITATIVE_R27E_BINDING_NO_HEURISTIC_REFERENCE_POINTER_AND_SEPARATE_QUALIFICATION_BEFORE_EXPORT_AUTHORIZATION"
},null,2));