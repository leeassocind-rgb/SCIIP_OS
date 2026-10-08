#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";

const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"design_bn3_next_phase.py"),"utf8");

const required=[
  "M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED",
  "EXACT_TEN_LIVE_SEARCH_LIFECYCLE_CERTIFIED_AND_CLOSED",
  "resolveGovernedSelectedPropertyMapRuntime",
  "resolveGovernedPropertyIntelligenceSelection",
  "selectedPropertyId",
  "POST_SELECTION_PROPERTY_DETAIL_PARITY_CERTIFICATION_READY",
  "M4_19D4BN3A_EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_PARITY_CERTIFICATION",
  "doNotReopenBN2WithoutContradictoryEvidence",
  "canonicalWriteAuthority",
  "applicationSourceMutation"
];

for(const x of required){
  if(!t.includes(x)){
    console.error("FAIL missing:",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN3_STATIC_TEST",
  status:"PASSED",
  assertions:required.length
},null,2));
