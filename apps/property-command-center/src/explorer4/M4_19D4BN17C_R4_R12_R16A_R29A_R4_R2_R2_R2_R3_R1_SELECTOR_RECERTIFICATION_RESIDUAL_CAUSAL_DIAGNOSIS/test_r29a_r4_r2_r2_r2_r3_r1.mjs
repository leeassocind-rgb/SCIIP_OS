import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r2_r3_r1.py",import.meta.url),"utf8");
const req=[
"READ_ONLY_SELECTOR_HELPER_AND_AUTHORITATIVE_BRANCH_DIAGNOSIS",
"importlib.util.spec_from_file_location",
"marker_identity","keyset","choose_prior200",
"CONFIGURED_AUTHORITATIVE_PRIOR200_PATH",
"AUTHORITATIVE_PRIOR200_KEYSET_COUNT",
"R28_NEW200_KEYSET_COUNT",
"PRIOR200_VS_NEW200_OVERLAP",
"CHOOSE_PRIOR200_RETURN_COUNT",
"AUTHORITATIVE_BRANCH_SELECTED",
"CURRENT AUTHORITATIVE BRANCH SOURCE",
"noLiveInventoryRequiredForAuthoritativeBranchTest",
"MAIN_NEW200_ARGUMENT_AND_PRE_BRANCH_STATE_DEEP_DIAGNOSIS",
"liveUiInteractionOff","propertyClickOff","assignmentsInvocationOff","generateInvocationOff","exportInvocationOff",
"applicationMutationOff","governedMutationOff"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);