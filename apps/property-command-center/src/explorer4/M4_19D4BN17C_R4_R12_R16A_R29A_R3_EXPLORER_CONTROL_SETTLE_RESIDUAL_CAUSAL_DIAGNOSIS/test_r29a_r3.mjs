import fs from "node:fs";
const s=fs.readFileSync(new URL("./diagnose_r29a_r3.py",import.meta.url),"utf8");
const req=[
"R29A_R2",
"FIRST_UNIQUE_EXPLORER_SECONDS",
"STABLE_LAST_FIVE_SAMPLES",
"VALID_SAMPLE_COUNT_AT_OR_AFTER_2S",
"boundedFiveSecondObservationUsed",
"exactExplorerCountsCaptured",
"visibleEnabledExplorerCountsCaptured",
"originCaptured",
"urlCaptured",
"Explorer click: OFF",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R3_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
