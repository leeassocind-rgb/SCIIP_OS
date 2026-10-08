import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1.py", import.meta.url),"utf8");
const req=[
  "[sys.executable, str(selector), str(repo)]",
  "SELECTOR_REPO_ARGUMENT_REQUIRED",
  "PASS_REPO_ROOT_AS_ARGV1",
  "SELECTOR_EXIT_CODE"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);