import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29b_r5_r1_r6_r2.py",import.meta.url),"utf8");
const req=["ev is not defined","r29bR4CertifyExplorerEntry","EV_CALL_COUNT","EV_DECLARATION_COUNT",
"CDP_RELEVANT_METHODS","RUNTIME_EVALUATE_HIT_COUNT","ENTRY_HELPER_CALLS",
"Application source mutation: OFF","Governed data mutation: OFF","Live UI interaction: OFF",
"Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);