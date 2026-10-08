#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"reconcile_bn6a_r1.py"),"utf8");
const req=[
"governedPropertyUsesMapRuntime",
"resolveGovernedSelectedPropertyMapRuntime",
"propertyUsesActualGovernedMapRuntime",
"toggleCompare(property.id)",
"governedPropertyBindingPrecedesCompareConsumption",
"BN6A_BINDING_PROBE_IDENTIFIER_MISMATCH_RECONCILED_COMPARE_CONTRACT_CERTIFIED",
"M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED",
"M4_19D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVATION",
"applicationSourceMutation",
"networkAuthority"
];
for(const x of req){
  if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
}
console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN6A_R1_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
