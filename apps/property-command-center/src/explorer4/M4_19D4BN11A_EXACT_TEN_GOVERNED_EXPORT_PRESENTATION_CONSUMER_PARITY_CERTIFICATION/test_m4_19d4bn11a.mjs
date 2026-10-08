#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"certify_bn11a.py"),"utf8");
const req=[
"M419D4BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
"POST_BN10_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
"EXPORT_PRESENTATION","exactTenCohort","selectedPropertyBoundaryPresent",
"governedPropertyBindingPresent","exportConsumerPresent","presentationConsumerPresent",
"propertyContextConsumptionPresent","outputSurfacePresent","noMutationAuthority",
"M4_19D4BN11B_EXACT_TEN_LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMER_OBSERVATION"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN11A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
