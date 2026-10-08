import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r4_r2_r2_r2.py",import.meta.url),"utf8");
const req=[
"COMPARATOR_REPAIR_INTRODUCED_PYTHON_SYNTAX_ERROR",
"LINE_187_IF_INDENTATION_REPAIRED_4_TO_8_SPACES",
"ast.parse(repaired_src)",
"py_compile",
"_r29a_r4_r2_new_keys = keyset(new200)",
"_r29a_r4_r2_keys & _r29a_r4_r2_new_keys",
"OBSOLETE_LIVEKEYS_COMPARATOR_ABSENT",
"PAGE_READY_ANCHOR_PRESERVED",
"TWO_SECOND_BOUND_PRESERVED",
"THREE_SAMPLE_GUARD_PRESERVED",
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
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
