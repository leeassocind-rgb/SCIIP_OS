import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29b_r1.py",import.meta.url),"utf8");
const req=[
"sfFromKey(sk) ?? Number(target.sf||0) || null",
"sfFromKey(sk) ?? (Number(target.sf||0) || null)",
"node\",\"--check",
"syntax-only repair",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Fresh page per record: REQUIRED",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
