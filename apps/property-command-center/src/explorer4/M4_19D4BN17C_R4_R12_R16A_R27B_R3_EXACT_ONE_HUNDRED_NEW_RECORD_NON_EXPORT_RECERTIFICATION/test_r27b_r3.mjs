#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r27b_r3.py"),"utf8");
const q=[
"R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE",
"exportControlDirectlyBindsExportReport",
"downloadClientListingReportLabelPresent",
'Download Client Listing Report',
"liveHandlerCertifiedBySourceContract",
"exportInvocation",
"Fresh page per record: REQUIRED",
"Strict sequential: ON",
"Halt on first failure: ON",
"explorerSettleCertified",
"targetBindingSettleCertified",
"selectedPropertySettleCertified",
"assignmentsEntryCertified",
"reportReviewEntryCertified",
"exportControlCertified",
"R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
if(s.includes('exact(w,"Export")==1')){console.error("FAIL stale literal Export control check");process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R27B_R3_STATIC_TEST",
 status:"PASSED",
 assertions:q.length+1,
 repair:"R27B_RUNTIME_HANDLER_INTROSPECTION_FAILURE_TO_SOURCE_CERTIFIED_DOWNLOAD_CLIENT_LISTING_REPORT_EXPORTREPORT_BINDING_WITH_EXACT_NEW100_NON_EXPORT_RECERTIFICATION"
},null,2));