import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r4_r1.py",import.meta.url),"utf8");
const req=[
"R29A_R4",
"R28A_R4",
"CANDIDATE_200_SOURCE_COUNT",
"EXACT_COMPATIBLE_SINGLE_SOURCE_COUNT",
"SAME_AS_R28_NEW200_SOURCE_COUNT",
"PARTIAL_OVERLAP_SOURCE_COUNT",
"EXACT_COMPATIBLE_COMPOSITE_100_PAIR_COUNT",
"overlapWithR28New200",
"unionUniqueWithR28New200",
"withinDuplicateCount",
"exactReferenceCompatible",
"compatibleCompositeHundredPairs",
"Live UI interaction: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"AUTHORITATIVE_PRIOR_200_SOURCE_BINDING_REPAIR",
"REFERENCE_400_LINEAGE_DEEP_DIAGNOSIS"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R4_R1_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
