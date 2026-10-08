import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r5_r1_r3.py",import.meta.url),"utf8");
const req=["this.ws.send(JSON.stringify({id,method,params}));","crypto.randomBytes(4)","0x81","writeUInt16BE","writeBigUInt64BE","this.socket.write(Buffer.concat","WS_SEND_REFERENCE_ERROR_CLEARED","RECORD401_RECERTIFIED","Governed data mutation: OFF","Export invocation: OFF","Strict sequential: ON","Halt on first failure: ON"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R3_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);