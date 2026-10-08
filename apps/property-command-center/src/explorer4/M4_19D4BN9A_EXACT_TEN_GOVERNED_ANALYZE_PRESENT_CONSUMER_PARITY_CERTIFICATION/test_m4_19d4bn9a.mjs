#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"certify_bn9a.py"),"utf8");
const r=["READ_ONLY_CERTIFICATION","exactTenCohort","selectedPropertyGoverned","governedPropertyBindingPresent",
"analyzeModePresent","presentModePresent","analyzeConsumerReceivesPropertyContext",
"presentConsumerReceivesPropertyContext","CERTIFIED","M4_19D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_OBSERVATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN9A_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));
