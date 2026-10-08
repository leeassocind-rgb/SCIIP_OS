#!/usr/bin/env node
import fs from"node:fs"; import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"certify_bn3a.py"),"utf8");
const req=["POST_SELECTION_PROPERTY_DETAIL_PARITY_CERTIFICATION_READY","selectedPropertyId",
"resolveGovernedSelectedPropertyMapRuntime","resolveGovernedPropertyIntelligenceSelection",
"selectedProperty:property","selectedPropertyId={property.id}","property={property}",
"propertyIntelligenceProperty={propertyIntelligenceProperty}",
"EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL:",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN3A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
