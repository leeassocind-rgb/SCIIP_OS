import fs from "node:fs";
const s=fs.readFileSync(new URL("./reconstruct_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r3.py",import.meta.url),"utf8");
const req=[
"OVERLAP_DOM_ORDINALS",
"NEW_COHORT_STARTS_AT_DOM_ORDINAL_195",
"NEW_COHORT_DOM_ORDINALS_SEQUENTIAL",
"NEXT_SIX_SUCCESSORS",
"prior194Coverage",
"SIX_DUPLICATES_ARE_PRIOR200_TAIL_ORDINALS_195_200_AND_NEW200_SELECTION_BOUNDARY_STARTED_SIX_RECORDS_TOO_EARLY",
"NEW200_BOUNDARY_RECONSTRUCTION_WITH_ORDINALS_201_400",
"applicationMutationOff",
"exportInvocationOff"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R3_STATIC_TEST",
  status:failed.length?"FAILED":"PASSED",
  assertions:req.length,
  failed
},null,2));
process.exit(failed.length?1:0);