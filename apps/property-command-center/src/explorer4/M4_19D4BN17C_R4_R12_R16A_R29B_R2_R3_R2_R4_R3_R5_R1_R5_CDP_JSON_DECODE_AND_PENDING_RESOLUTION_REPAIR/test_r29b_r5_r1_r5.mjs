import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r5_r1_r5.py",import.meta.url),"utf8");
const req=[
"WEBSOCKET_FRAME_RECEIVE_PATH_PRESENT_BUT_CDP_JSON_DECODE_ABSENT",
"_onData(chunk)",
"JSON.parse(text)",
"this.pending.get(msg.id)",
"this.pending.delete(msg.id)",
"p.resolve(msg.result)",
"p.reject(",
"readUInt16BE",
"readBigUInt64BE",
"RUNTIME_ENABLE_TIMEOUT_CLEARED",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Strict sequential: ON",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R5_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);