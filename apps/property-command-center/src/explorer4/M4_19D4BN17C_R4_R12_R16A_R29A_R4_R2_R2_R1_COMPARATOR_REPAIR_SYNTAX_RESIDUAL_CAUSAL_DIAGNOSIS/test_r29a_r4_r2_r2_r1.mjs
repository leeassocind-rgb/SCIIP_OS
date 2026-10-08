import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r1.py",import.meta.url),"utf8");
const req=[
"READ_ONLY_SELECTOR_SYNTAX_DIAGNOSIS",
"ast.parse(src)",
"SYNTAX_ERROR_LINE",
"SYNTAX_ERROR_OFFSET",
"SYNTAX_ERROR_MESSAGE",
"SOURCE CONTEXT",
"AUTHORITATIVE BRANCH CONTEXT",
"_r29a_r4_r2_new_keys = keyset(new200)",
"_r29a_r4_r2_keys & _r29a_r4_r2_new_keys",
"livekeysComparatorRemoved",
"COMPARATOR_REPAIR_INTRODUCED_PYTHON_SYNTAX_ERROR",
"COMPARATOR_REPAIR_SYNTAX_ONLY_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION",
"Live UI interaction: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
