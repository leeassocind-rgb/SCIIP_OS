import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r4_r2_r2.py",import.meta.url),"utf8");
const req=[
"WRONGLY_TESTS_DISJOINTNESS_AGAINST_LIVE_INVENTORY",
"_r29a_r4_r2_new_keys = keyset(new200)",
"not (_r29a_r4_r2_keys & _r29a_r4_r2_new_keys)",
"AUTHORITATIVE_BRANCH_USES_NEW200_KEYSET",
"AUTHORITATIVE_BRANCH_LIVEKEYS_DISJOINTNESS_REMOVED",
"RUNNER_REPAIR_ONLY",
"selectorExitZero",
"r29aStatusPassed",
"exactNewFourHundredTargetArtifactPresent",
"exactNewFourHundredTargetCountExactly400",
"exactNewFourHundredTargetsUnique",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
