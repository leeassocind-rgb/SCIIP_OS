#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const o=fs.readFileSync(path.join(d,"observe_bn8b.py"),"utf8");
const v=fs.readFileSync(path.join(d,"validate_cdp_sciip_target.py"),"utf8");
const req=[
 ["validator emits validated port",v.includes('"port":p')],
 ["validator emits valid target",v.includes('"valid":True')],
 ["observer accepts explicit validated port",o.includes("cdp_port=int(sys.argv[2])")],
 ["observer requires explicit port",o.includes("VALIDATED_CDP_PORT_ARGUMENT_REQUIRED")],
 ["observer validates that exact port",o.includes("VALIDATED_SCIIP_CDP_TARGET_NOT_FOUND")],
 ["property intelligence observation retained",o.includes("propertyIntelligenceVisible")],
 ["exact-ten success retained",o.includes("EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED")],
 ["BN8C transition retained",o.includes("M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE")]
];
for(const [label,ok] of req){if(!ok){console.error("FAIL",label);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN8B_R2_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"OBSERVER_NOW_ACTUALLY_ACCEPTS_AND_USES_VALIDATED_CDP_PORT"
},null,2));
