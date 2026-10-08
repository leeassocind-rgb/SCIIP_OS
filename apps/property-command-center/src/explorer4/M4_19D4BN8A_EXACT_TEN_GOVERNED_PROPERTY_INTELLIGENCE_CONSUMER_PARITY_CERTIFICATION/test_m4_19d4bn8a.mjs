#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"certify_bn8a.py"),"utf8");
const req=["M419D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_READINESS_CERTIFIED","selectedPropertyGoverned",
"propertyIntelligencePresent","derivedIntelligencePresent","evidenceProvenancePresent","presentationPresent",
"propertyContextConsumptionPresent","EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVATION","READ_ONLY_CERTIFICATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN8A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
