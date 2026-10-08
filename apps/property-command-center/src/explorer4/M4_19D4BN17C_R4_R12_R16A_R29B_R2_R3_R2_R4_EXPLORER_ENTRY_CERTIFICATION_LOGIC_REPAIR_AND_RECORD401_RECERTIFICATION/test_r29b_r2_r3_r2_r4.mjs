import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r2_r3_r2_r4.py",import.meta.url),"utf8");
const req=[
"r29bR4CertifyExplorerEntry",
"markerCount",
"consecutive>=3",
"1500",
"RECORD401_RECERTIFIED",
"Export invocation: OFF",
"Governed data mutation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);
