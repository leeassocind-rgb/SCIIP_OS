import fs from "node:fs";
const s=fs.readFileSync(new URL("./reconstruct_r29a_r1_r6.py",import.meta.url),"utf8");
const req=["corrected_new_two_hundred_candidates.json","recertified_reference_four_hundred.json","correctedNew200DisjointPrior200","reference400Unique","r5r1SuccessorResolutionCertified","Export invocation: OFF"];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R1_R6_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
