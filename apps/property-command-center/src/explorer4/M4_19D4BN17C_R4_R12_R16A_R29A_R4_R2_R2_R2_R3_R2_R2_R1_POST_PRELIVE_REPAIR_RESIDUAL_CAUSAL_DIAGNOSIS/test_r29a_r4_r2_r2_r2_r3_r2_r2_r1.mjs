import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r2_r3_r2_r2_r1.py",import.meta.url),"utf8");
const req=[
"READ_ONLY_CURRENT_SELECTOR_AUTHORITATIVE_PRIOR200_DIRECT_DIAGNOSIS",
"choose(er,new_raw,set())",
"AUTHORITATIVE_PRIOR200_BRANCH_KEY_COUNT",
"NEW200_BRANCH_KEY_COUNT",
"PRIOR200_NEW200_BRANCH_KEY_OVERLAP",
"CHOOSE_PRIOR200_PRIOR_RETURN_TYPE",
"CHOOSE_PRIOR200_PRIOR_RETURN_COUNT",
"CURRENT AUTHORITATIVE BRANCH SOURCE",
"MAIN_EXPECTS_INCOMPATIBLE_RETURN_CONTRACT",
"liveUiInteractionOff",
"exportInvocationOff",
"applicationMutationOff",
"governedMutationOff"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);