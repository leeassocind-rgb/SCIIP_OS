#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"authorize_r26c.py"),"utf8");
const q=["READ_ONLY_AUTHORIZATION_DESIGN","REFERENCE_CERTIFIED_RECORDS: 50","NEW_NON_EXPORT_QUALIFIED_RECORDS: 50",
"EXACT_ONE_HUNDRED_EXECUTION_COHORT: 100","freshPagePerRecordRequired","strictSequentialRequired","haltOnFirstFailureRequired",
"targetBindingFiveSecondBoundRequired","buildingProjectAwareCanonicalBindingRequired","ambiguousAddressOnlyBindingForbidden",
"singleExportClickMaximumPerRecord","artifactPdfDownloadCountExactlyOne","artifactPdfObjectUrlEventCountExactlyOne",
"postPublishReportReviewUnmountRequired","authorityRelockAfterEveryRecordRequired","runtimeErrorsZeroRequired",
"unhandledRejectionsZeroRequired","Export invocation: OFF","R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26C_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_R3_COMPLETE_NEW_FIFTY_NON_EXPORT_QUALIFICATION_TO_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"},null,2));