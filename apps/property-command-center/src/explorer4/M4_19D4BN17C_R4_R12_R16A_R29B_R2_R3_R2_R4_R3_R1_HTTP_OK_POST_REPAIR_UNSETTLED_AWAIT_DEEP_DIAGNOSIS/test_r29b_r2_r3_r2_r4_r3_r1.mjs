import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r2_r3_r2_r4_r3_r1.py",import.meta.url),"utf8");
const req=["HTTP_OK_LIFECYCLE_REPAIR_INSTALLED_NODE_EXIT13_RESIDUAL_REMAINS",
"R29B_DEEP_HTTP_FETCH_BEGIN","R29B_DEEP_HTTP_FETCH_END","R29B_DEEP_HTTP_FETCH_CATCH",
"R29B_DEEP_HTTP_FETCH_FINALLY","R29B_DEEP_TOPLEVEL_PREFLIGHT_BEGIN",
"R29B_DEEP_TOPLEVEL_APP_HTTP_END","R29B_DEEP_TOPLEVEL_CDP_HTTP_END",
"timeout=8","runner.write_text(original)","Governed data mutation: OFF",
"Live workflow mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R1_STATIC_TEST",
status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);