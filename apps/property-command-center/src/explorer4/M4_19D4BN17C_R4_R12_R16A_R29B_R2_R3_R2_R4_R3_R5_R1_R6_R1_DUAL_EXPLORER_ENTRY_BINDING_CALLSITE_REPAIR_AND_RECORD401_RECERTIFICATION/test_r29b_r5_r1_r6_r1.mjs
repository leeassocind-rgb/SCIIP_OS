import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_dual_entry_callsites_and_recertify.py",import.meta.url),"utf8");
const req=["UNDEFINED_W_CALL_COUNT_BEFORE","REMAINING_CALLS_REPAIRED","UNDEFINED_W_CALL_COUNT_AFTER",
"r29bR4CertifyExplorerEntry(cdp)","node\",\"--check","RECORD401_EXPLORER_ENTRY_CERTIFIED",
"RECORD401_TARGET_BINDING_SETTLE_CERTIFIED","RECORD401_SELECTION_CERTIFIED","RECORD401_RECERTIFIED",
"Governed data mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);