#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const o=fs.readFileSync(path.join(d,"observe_bn8b.py"),"utf8");
const req=[
 ["self-contained websocket class",o.includes("class WS:")],
 ["no external websocket import",!o.includes("import websocket")],
 ["accepts explicit validated port",o.includes("cdp_port=int(sys.argv[2])")],
 ["validates supplied port",o.includes("VALIDATED_SCIIP_CDP_TARGET_NOT_FOUND")],
 ["property intelligence live observation retained",o.includes("propertyIntelligenceVisible")],
 ["derived evidence presentation signals retained",o.includes("derivedSignalCount")&&o.includes("evidenceSignalCount")&&o.includes("presentationSignalCount")],
 ["exact-ten success retained",o.includes("EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED")],
 ["BN8C transition retained",o.includes("M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE")]
];
for(const [label,ok] of req){if(!ok){console.error("FAIL",label);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN8B_R3_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"REMOVED_EXTERNAL_WEBSOCKET_DEPENDENCY_USING_SELF_CONTAINED_CDP_CLIENT"
},null,2));
