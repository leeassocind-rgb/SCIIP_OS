#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"observe_bn5b.py"),"utf8");
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=[
"2 Musick","13900 Carmenita Rd",
"LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVED",
"SPATIAL_FOCUS_SIGNAL_NOT_OBSERVED",
"SEARCH_SESSION_QUERY_NOT_CONSUMED",
"M419D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVED",
"M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE",
"chrome-extension://","Search SCIIP","applicationSourceMutation"
];
for(const x of req){
  if(!(t.includes(x)||v.includes(x))){
    console.error("FAIL",x);process.exit(1)
  }
}
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN5B_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
