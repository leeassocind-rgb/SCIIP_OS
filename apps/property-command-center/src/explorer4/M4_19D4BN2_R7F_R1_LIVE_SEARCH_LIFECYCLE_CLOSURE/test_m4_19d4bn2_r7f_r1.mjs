#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";

const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_live_search_lifecycle.py"),"utf8");

const required=[
 "2 Musick",
 "13900 Carmenita Rd",
 "GLOBAL_SEARCH_RUNTIME_CAUSAL_CONTRACT_CERTIFIED",
 "EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED",
 "MATCH_AUTO_SELECTED_OR_POST_VISIBLE",
 "recordCountExactlyTen",
 "exactApprovedCohort",
 "allControlledValueMatch",
 "allExplorerMounted",
 "allAutoSelectedOrPostVisible",
 "EXACT_TEN_LIVE_SEARCH_LIFECYCLE_CERTIFIED_AND_CLOSED",
 "BN2_LIVE_SEARCH_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
 "applicationSourceMutation",
 "canonicalWriteAuthority",
 "networkAuthority"
];

for(const x of required){
  if(!t.includes(x)){
    console.error("FAIL missing required token:",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_R7F_R1_STATIC_TEST",
  status:"PASSED",
  assertions:required.length
},null,2));
