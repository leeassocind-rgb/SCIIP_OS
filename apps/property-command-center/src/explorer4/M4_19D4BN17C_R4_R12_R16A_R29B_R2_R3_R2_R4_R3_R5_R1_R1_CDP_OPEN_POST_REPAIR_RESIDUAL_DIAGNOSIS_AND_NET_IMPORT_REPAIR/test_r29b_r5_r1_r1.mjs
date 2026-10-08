import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_and_repair_r29b_r5_r1_r1.py",import.meta.url),"utf8");
const req=["net is not defined","cdpOpenTimeoutAbsent","net\\.createConnection","import net from \"node:net\"","NET_REFERENCE_ERROR_CLEARED","RECORD401_FRESH_TARGET_CREATED","RECORD401_RECERTIFIED","Governed data mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);