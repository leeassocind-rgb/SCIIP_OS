#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r26a.py"),"utf8");
const q=[
"R26_POLICY_CERTIFICATION_REQUIRED",
"CERTIFIED_REFERENCE_FIFTY_REQUIRED",
"freshExplorerPageUsed",
"explorerEntrySettleCertified",
"explorerEntryCertified",
"candidateInventoryCaptured",
"referenceFiftyPreserved",
"fiftyNewCandidatesResolved",
"exactOneHundredCandidateCohortResolved",
"exactOneHundredCandidateCohortUnique",
"deterministicDomOrderUsed",
"candidateStatusSuffixNormalizationUsed",
"recognizedStatusBoundaryOnly",
"fiveSecondTargetBindingPolicyConsumed",
"threeSampleTargetBindingPolicyConsumed",
"threeSampleExplorerPolicyConsumed",
"twoSecondExplorerPolicyConsumed",
"threeSampleSelectedPropertyPolicyConsumed",
"twoSecondSelectedPropertyPolicyConsumed",
"freshPagePerRecordPolicyConsumed",
"strictSequentialPolicyConsumed",
"haltOnFirstFailurePolicyConsumed",
"oneExportClickMaximumPolicyConsumed",
"eligibilityContractConsumed",
"exportInvocationOff",
"assignmentsInvocationOff",
"R26B_FIFTY_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26A_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26_EXACT_ONE_HUNDRED_POLICY_TO_REFERENCE_FIFTY_PLUS_FIFTY_NEW_DETERMINISTIC_LIVE_CANDIDATE_SELECTION_AND_NON_EXPORT_PREAUTHORIZATION"
},null,2));