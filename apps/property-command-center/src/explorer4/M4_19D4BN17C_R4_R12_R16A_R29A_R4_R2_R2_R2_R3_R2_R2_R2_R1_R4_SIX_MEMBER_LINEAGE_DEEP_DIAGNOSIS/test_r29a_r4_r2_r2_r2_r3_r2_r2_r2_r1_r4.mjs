import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r4.py",import.meta.url),"utf8");
const req=[
"NEW_MISSING_ORDINALS_WITHIN_RANGE",
"NEW_DUPLICATE_ORDINALS",
"EVIDENCE ORDINAL READBACK",
"range(399,405)",
"LIVE_BOUNDARY_ORDINALS",
"SUCCESSOR_SIX_RESOLVED",
"CORRECTED_REFERENCE_UNION_COUNT",
"NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION",
"Property click: OFF",
"Export invocation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",assertions:req.length,failed
},null,2));
process.exit(failed.length?1:0);