import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29b_r2.py",import.meta.url),"utf8");
const req=[
"class RawWebSocket",
'import("node:net")',
"Sec-WebSocket-Key",
"writeBigUInt64BE",
"readBigUInt64BE",
"opcode===0x9",
"this.ws=new RawWebSocket(this.wsUrl)",
'node","--check',
"Export invocation: OFF",
"Fresh page per record: REQUIRED",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
