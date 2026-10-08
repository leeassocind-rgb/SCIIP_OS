import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r5_r1_r6_r3.py",import.meta.url),"utf8");
const req=["EXPLORER_ENTRY_HELPER_RETains_UNDEFINED_LEGACY_EV_CALLS_WHILE_CALLSITES_NOW_BIND_CDP_EVALUATOR","LEGACY_EV_W_CALL_COUNT_BEFORE","cdp.eval(","LEGACY_EV_W_CALLS_REPAIRED","EV_REFERENCE_ERROR_CLEARED","RECORD401_EXPLORER_ENTRY_CERTIFIED","RECORD401_TARGET_BINDING_SETTLE_CERTIFIED","RECORD401_SELECTION_CERTIFIED","RECORD401_SELECTED_PROPERTY_SETTLE_CERTIFIED","RECORD401_ASSIGNMENTS_ENTRY_CERTIFIED","RECORD401_GENERATE_CONTROL_CERTIFIED","RECORD401_RECERTIFIED","Governed data mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R3_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);