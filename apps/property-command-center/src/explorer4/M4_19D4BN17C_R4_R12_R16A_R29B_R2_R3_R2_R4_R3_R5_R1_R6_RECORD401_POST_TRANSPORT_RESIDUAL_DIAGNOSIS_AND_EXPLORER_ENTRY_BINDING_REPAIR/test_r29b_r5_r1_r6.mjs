import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_repair_and_recertify_r29b_r5_r1_r6.py",import.meta.url),"utf8");
const req=[
"CDP_INBOUND_DECODE_REPAIRED_RECORD401_ADVANCED_NEXT_RESIDUAL_CAPTURED",
"w is not defined",
"r29bR4CertifyExplorerEntry(w)",
"r29bR4CertifyExplorerEntry(cdp)",
"UNDEFINED_W_RESIDUAL_CLEARED",
"RECORD401_EXPLORER_ENTRY_CERTIFIED",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Strict sequential: ON",
"Halt on first failure: ON",
"node\",\"--check",
"RECORD401_RECERTIFIED"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R5_R1_R6_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);