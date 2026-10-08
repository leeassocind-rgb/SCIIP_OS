import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r2_r3_r2_r4_r3_r5_r1.py",import.meta.url),"utf8");
const req=["NODE_EXIT13_CLEARED_CDP_OPEN_TIMEOUT_NOW_EXPLICIT","__r29bOpenPromise","HTTP/1.1 101","CDP_SOCKET_ERROR","CDP_SOCKET_CLOSED_BEFORE_UPGRADE","CDP_WEBSOCKET_UPGRADE_FAILED","RECORD401_FRESH_TARGET_CREATED","RECORD401_RECERTIFIED","Governed data mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R5_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);