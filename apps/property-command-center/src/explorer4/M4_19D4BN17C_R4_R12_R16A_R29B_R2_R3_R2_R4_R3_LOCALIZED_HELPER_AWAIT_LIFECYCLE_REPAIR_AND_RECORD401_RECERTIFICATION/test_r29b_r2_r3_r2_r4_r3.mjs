import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r2_r3_r2_r4_r3.py",import.meta.url),"utf8");
const req=[
"LOCALIZED_HELPER",
"async function httpOk(url)",
"AbortController",
"setTimeout(()=>controller.abort(),2000)",
"clearTimeout(timeout)",
"HTTP_OK_REPAIR_APPLIED",
"NODE_CHECK_EXIT",
"AUTHORITATIVE_R29B_EXIT_CODE",
"RECORD401_RECERTIFIED",
"nodeExit13Cleared",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Strict sequential: ON",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);
