import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r1.py",import.meta.url),"utf8");
const req=[
"READ_ONLY_CURRENT_SELECTOR_AUTHORITATIVE_BRANCH_DIAGNOSIS",
"PRIOR_UNIQUE_KEY_COUNT",
"NEW_UNIQUE_KEY_COUNT",
"PRIOR_NEW_OVERLAP_COUNT",
"BRANCH_CONDITIONS",
"CHOOSE_PRIOR200_PRIOR_RETURN_TYPE",
"CURRENT AUTHORITATIVE BRANCH SOURCE",
"GENUINELY_OVERLAP",
"RETURN_IS_SWALLOWED_OR_FALLS_THROUGH",
"liveUiInteractionOff",
"exportInvocationOff",
"applicationMutationOff",
"governedMutationOff"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R1_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);