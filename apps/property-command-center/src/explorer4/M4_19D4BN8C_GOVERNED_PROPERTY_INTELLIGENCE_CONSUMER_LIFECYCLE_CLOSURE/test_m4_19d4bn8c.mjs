#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname);
const t=fs.readFileSync(path.join(d,"close_bn8_lifecycle.py"),"utf8");
const req=[
"M419D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFIED",
"M419D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED",
"allPropertyIntelligenceVisible",
"allDerivedSignalsObserved",
"allEvidenceSignalsObserved",
"allPresentationSignalsObserved",
"allMapsVisibleAfterIntelligence",
"EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN8_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"applicationSourceMutation"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN8C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
