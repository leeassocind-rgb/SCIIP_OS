import fs from "node:fs";
const s=fs.readFileSync(new URL("./requalify_r29a_r1_r7.py",import.meta.url),"utf8");
const req=[
"recertified_reference_four_hundred.json",
'exact_new_four_hundred_candidates_requalified.json',
'exact_eight_hundred_candidate_union.json',
'selectedNew400DisjointReference400',
'exactCombined800Unique',
'canonicalLiveOrderPreserved',
'CDP_FRESH_PAGE_PUT_STATUS',
'Property click: OFF',
'Export invocation: OFF'
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29A_R1_R7_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);
