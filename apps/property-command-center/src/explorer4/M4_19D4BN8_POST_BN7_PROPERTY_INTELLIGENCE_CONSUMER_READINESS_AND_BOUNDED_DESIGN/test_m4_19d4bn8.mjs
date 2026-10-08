#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"design_bn8.py"),"utf8");
const req=[
"M419D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED",
"propertyIntelligencePresent","selectedPropertyBoundaryPresent",
"derivedIntelligenceSurfacePresent","evidenceOrProvenanceSurfacePresent",
"presentationSurfacePresent","propertyContextConsumptionPresent",
"READ_ONLY_ARCHITECTURE_DESIGN",
"M419D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_READINESS_CERTIFIED",
"M4_19D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN8_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
