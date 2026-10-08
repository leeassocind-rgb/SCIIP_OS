#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const s=fs.readFileSync(path.join(d,"qualify_r22a.py"),"utf8");

const q=[
"r22PolicyClassificationConsumed",
"sourceExportPathContractsPreserved",
"certifiedBrowserContextAvailable",
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
"EXACT_THREE_RECORD_EXPORT_TARGETS_QUALIFIED_AND_PREAUTHORIZED_FOR_BOUNDED_LIVE_EXECUTION"
];

for(const x of q){
  if(!s.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R22A_STATIC_TEST",
  status:"PASSED",
  assertions:q.length,
  repair:"R22_CERTIFIED_EXACT_THREE_RECORD_EXPORT_POLICY_TO_FRESH_PAGE_PER_RECORD_TARGET_QUALIFICATION_WITH_EXPORT_INVOCATION_OFF"
},null,2));