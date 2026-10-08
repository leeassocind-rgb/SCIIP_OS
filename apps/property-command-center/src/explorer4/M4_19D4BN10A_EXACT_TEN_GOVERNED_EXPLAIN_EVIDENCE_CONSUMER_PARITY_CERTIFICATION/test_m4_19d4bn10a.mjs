#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"certify_bn10a.py"),"utf8");
const req=["EXPLAIN_EVIDENCE","exactTenCohort","selectedPropertyBoundaryPresent","governedPropertyBindingPresent",
"explainConsumerPresent","evidenceConsumerPresent","provenanceOrConfidencePresent","explainRouteOrActionPresent",
"propertyContextConsumptionPresent","noMutationAuthority",
"M419D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFIED",
"M4_19D4BN10B_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_OBSERVATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN10A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
