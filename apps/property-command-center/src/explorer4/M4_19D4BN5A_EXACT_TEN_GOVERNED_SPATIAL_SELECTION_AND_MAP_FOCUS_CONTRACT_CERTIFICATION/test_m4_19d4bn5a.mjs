#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";

const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"certify_bn5a.py"),"utf8");

const req=[
"M419D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED",
"resolveGovernedSelectedPropertyMapRuntime",
"buildGovernedMarketSpatialHighlightContract",
"resolveGovernedMarketSpatialSelection",
"'MAP'",
"'FOCUS'",
"'NEIGHBOR'",
"'PROPERTY_INTELLIGENCE'",
"focusPropertyId={focusPropertyId}",
"focusRequestKey={focusRequestKey}",
"setFocusPropertyId(resolution.property.id)",
"setFocusRequestKey(key=>key+1)",
"M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED",
"M4_19D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVATION",
"applicationSourceMutation"
];

for(const x of req){
  if(!t.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN5A_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
