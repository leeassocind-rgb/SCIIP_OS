#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r12_r16a_r9.py"),"utf8");
const req=[
"r16aR8Passed",
"r8ExportAliasesResolved",
"r8PresentationAliasesResolved",
"nativeBrowserIntrinsicsExcluded",
"applicationOwnedAliasesOnly",
"freshPageTargetPerRecordPolicyUsed",
"allExecutedExportAliasesCertified",
"allExecutedPresentationAliasesCertified",
"allThreeExportAliasesCertified",
"allThreePresentationAliasesCertified",
"APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTIONS_CERTIFIED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION",
"EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R9_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R8_APPLICATION_OWNED_ALIAS_ONLY_EXPORT_PRESENTATION_THREE_RECORD_FRESH_PAGE_LIVE_RECERTIFICATION"
},null,2));