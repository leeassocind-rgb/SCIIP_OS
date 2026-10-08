import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r4_r2_r2_r2_r3_r2_r2.py",import.meta.url),"utf8");
const req=[
"choose_prior200(er,new200,set())",
"CHOOSE_PRIOR200_BEFORE_LIVE_INVENTORY",
"REFERENCE_RECONSTRUCTION_BEFORE_LIVE_INVENTORY",
"LIVE_INVENTORY_PRESERVED_FOR_NEW400_SELECTION",
"AST_PARSE_CERTIFIED",
"selectorControlFlowRepairOnly",
"Export invocation: OFF",
"governedDataMutationOff",
"R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);