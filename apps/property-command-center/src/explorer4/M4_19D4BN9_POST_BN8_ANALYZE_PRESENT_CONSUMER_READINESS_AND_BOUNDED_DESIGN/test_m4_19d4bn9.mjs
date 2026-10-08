#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"design_bn9.py"),"utf8");
const req=["BN8C_GOVERNED_PROPERTY_INTELLIGENCE","analyzeModePresent","presentModePresent",
"selectedPropertyBoundaryPresent","governedPropertyBindingPresent","propertyIntelligencePresent",
"analyzeConsumerContextPresent","presentConsumerContextPresent","noMutationAuthority",
"M4_19D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN9_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
