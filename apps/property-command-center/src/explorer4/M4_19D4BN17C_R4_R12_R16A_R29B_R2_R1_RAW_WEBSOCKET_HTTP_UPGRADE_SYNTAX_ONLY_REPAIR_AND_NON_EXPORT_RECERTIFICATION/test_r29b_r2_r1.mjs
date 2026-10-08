import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29b_r2_r1.py",import.meta.url),"utf8");
const req=[
"startsWith(\"HTTP/1.1 101\")",
"class RawWebSocket",
'import("node:net")',
"this.ws=new RawWebSocket(this.wsUrl)",
"mask=crypto.randomBytes(4)",
"readBigUInt64BE",
"opcode===0x9",
'node","--check',
"Export invocation: OFF",
"Fresh page per record: REQUIRED",
"Strict sequential: ON",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R1_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
