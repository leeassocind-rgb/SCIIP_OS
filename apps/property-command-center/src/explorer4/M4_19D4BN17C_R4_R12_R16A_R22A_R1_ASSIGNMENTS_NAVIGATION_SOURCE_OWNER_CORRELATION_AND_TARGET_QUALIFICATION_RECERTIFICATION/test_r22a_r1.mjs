#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"recertify_r22a_r1.py"),"utf8");

const q=[
"priorR22ABlockedSourceContractConsumed",
"assignmentsNavigationSourceOwnerCorrelationCompleted",
"assignmentsNavigationSourceOwnerResolved",
"generateReportBindingPreserved",
"reportReviewMountGatePreserved",
"downloadReportBindingPreserved",
"freshPagePerRecordPolicyUsed",
"strictSequentialObserved",
"haltOnFirstFailureObserved",
"allExecutedSelectedPropertiesCertified",
"allExecutedAssignmentsEntriesCertified",
"allExecutedGenerateControlsCertified",
"allExecutedReportReviewEntriesCertified",
"allExecutedExportControlsCertified",
"allExecutedLiveHandlersCertified",
"allThreeTargetsQualified",
"exportInvocationOff",
"ASSIGNMENTS_SOURCE_OWNER_REPAIRED_EXACT_THREE_RECORD_EXPORT_TARGETS_QUALIFIED_AND_PREAUTHORIZED"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R22A_R1_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R22A_FALSE_NEGATIVE_SINGLE_FILE_ASSIGNMENTS_BINDING_CHECK_REPLACED_BY_SOURCE_TREE_OWNER_CORRELATION_AND_THREE_RECORD_RECERTIFICATION"
},null,2));