import fs from "node:fs";
const s=fs.readFileSync(new URL("./localize_r29b_r2_r3_r2_r4_r3_r2.py",import.meta.url),"utf8");
const req=[
"HTTP_PREFLIGHT_FULLY_SETTLED_EXIT13_LIES_AFTER_PREFLIGHT",
"R29B_POST_PREFLIGHT_REACHED",
"R29B_AWAIT_BEGIN:",
"R29B_AWAIT_END:",
"R29B_GENERIC_AWAIT_LINE_BEGIN:",
"timeout=10",
"runner.write_text(original)",
"LOCALIZED_AWAIT:",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Strict sequential: ON",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R2_STATIC_TEST",
status:failed.length?"FAILED":"PASSED",
assertions:req.length,
failed
},null,2));
process.exit(failed.length?1:0);