import fs from "node:fs";
const s=fs.readFileSync(new URL("./qualify_r29b.mjs",import.meta.url),"utf8");
const req=[
"EXACT NEW 400 ONLY",
"Fresh page per record: REQUIRED",
"Strict sequential: ON",
"Halt on first failure: ON",
"TARGET_BINDING_FAILED",
"Generate Client Listing Report",
"Download Client Listing Report",
"exportReport",
"Export invocation: OFF",
"EXACT_NEW_400_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29B_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
