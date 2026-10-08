import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r1_r5_r1.py",import.meta.url),"utf8");
const req=[
"CDP_JSON_NEW_GET_STATUS",
"CDP_JSON_NEW_PUT_STATUS",
'req(new_url,"PUT",2)',
"live_inventory()",
"SUCCESSOR_SIX_RESOLVED",
"CORRECTED_REFERENCE_UNION_COUNT",
"Property click: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R1_R5_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);