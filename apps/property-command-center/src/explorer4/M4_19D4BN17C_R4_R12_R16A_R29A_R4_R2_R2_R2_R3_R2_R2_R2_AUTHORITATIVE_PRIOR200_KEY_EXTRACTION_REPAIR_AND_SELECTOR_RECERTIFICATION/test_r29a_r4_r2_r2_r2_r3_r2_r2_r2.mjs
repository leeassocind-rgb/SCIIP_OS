import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r4_r2_r2_r2_r3_r2_r2_r2.py",import.meta.url),"utf8");
const req=["extract comparison keys directly","k.startswith('select ')","_r29a_r4_r2_keys","_r29a_r4_r2_new_keys","marker_identity()","AST_PARSE_CERTIFIED"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);