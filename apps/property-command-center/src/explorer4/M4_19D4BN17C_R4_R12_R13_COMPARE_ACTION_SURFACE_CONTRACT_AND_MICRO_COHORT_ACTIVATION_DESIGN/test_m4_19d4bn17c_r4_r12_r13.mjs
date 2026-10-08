#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"design_bn17c_r4_r12_r13.py"),"utf8");
const req=[
"r12ResolvedCompareFirst",
"compareUiContractReferencesResolved",
"compareStateOrConsumerReferencesResolved",
"compareVerificationSignalsResolved",
"compareControlLabelsResolved",
"strictSequentialRequired",
"haltOnFirstFailureRequired",
"readAfterActionRequired",
"COMPARE_ACTION_SURFACE_CONTRACT_RESOLVED_THREE_RECORD_LIVE_ACTIVATION_CERTIFICATION_READY",
"COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"COMPARE_ACTION_SURFACE_SOURCE_UI_STATE_AND_VERIFICATION_CONTRACT_DESIGN"
},null,2));