import fs from "node:fs";
const s=fs.readFileSync(new URL("./reconcile_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r2.py",import.meta.url),"utf8");
const req=["REFERENCE_UNION_COUNT","OVERLAP_KEYS","ALL_OVERLAP_SF_MATCH","EXACT_DISJOINT_200_CANDIDATE_COUNT","MISSING_SIX_PRIOR200_MEMBERS_LINEAGE_RECONSTRUCTION","applicationMutationOff","exportInvocationOff"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);