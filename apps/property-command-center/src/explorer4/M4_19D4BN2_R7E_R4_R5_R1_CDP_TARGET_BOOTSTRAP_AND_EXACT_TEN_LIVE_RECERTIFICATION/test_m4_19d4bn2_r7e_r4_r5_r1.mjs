#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const live=fs.readFileSync(path.join(d,"exact_ten_live_recertification.py"),"utf8");
const boot=fs.readFileSync(path.join(d,"detect_local_sciip_app.py"),"utf8");
const req=[
"2 Musick","13900 Carmenita Rd",
"MATCH_AUTO_SELECTED_OR_POST_VISIBLE",
"AMBIGUOUS_RENDERED","NO_MATCH_RENDERED",
"BLOCKED_CDP_BOOTSTRAP_FAILED",
"applicationSourceMutation","governedDataMutation","pixelEvidence",
"BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE"
];
for(const x of req){
 if(!(live.includes(x)||boot.includes(x))){
   console.error("FAIL",x);process.exit(1);
 }
}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R4_R5_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length
},null,2));
