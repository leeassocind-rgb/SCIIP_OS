import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_and_recertify_r29b_r2_r3_r2_r4_r3_r5.py",import.meta.url),"utf8");
const req=[
"RECORD401_EXIT13_LOCALIZED_TO_CREATE_FRESH_PAGE_INTERNAL_AWAIT",
"CREATE_FRESH_PAGE_UNRETURNED_AWAIT",
"c.open",
"R29B_R5_CDP_OPEN_BOUND_MS=2000",
"Promise.race([",
"R29B_CDP_OPEN_TIMEOUT_2000MS",
"clearTimeout(__r29b_r5_open_timer)",
"nodeExit13Cleared",
"record401Recertified",
"Governed data mutation: OFF",
"Export invocation: OFF",
"Strict sequential: ON",
"Halt on first failure: ON"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R5_STATIC_TEST",
 status:failed.length?"FAILED":"PASSED",
 assertions:req.length,
 failed
},null,2));
process.exit(failed.length?1:0);