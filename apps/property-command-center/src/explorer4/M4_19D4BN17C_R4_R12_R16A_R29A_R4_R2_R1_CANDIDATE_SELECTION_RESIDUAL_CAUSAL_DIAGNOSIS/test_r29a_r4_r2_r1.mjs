import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r2_r1.py",import.meta.url),"utf8");
const req=[
"choosePrior200Signature","choosePrior200Callsites","AUTHORITATIVE_BRANCH_COMPARES_AGAINST_LIVEKEYS",
"authoritativePrior200DisjointFromR28New200","argumentRoleMismatchEvaluated",
"WRONGLY_TESTS_DISJOINTNESS_AGAINST_LIVE_INVENTORY",
"DISJOINTNESS_COMPARATOR_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION",
"Live UI interaction: OFF","Property click: OFF","Assignments invocation: OFF",
"Generate invocation: OFF","Export invocation: OFF","Application source mutation: OFF"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R2_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
