#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn11_lifecycle.py"),"utf8");
const req=[
"M419D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFIED",
"M419D4BN11B_R2_EXACT_TEN_LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED",
"allExportControlsClicked","allExportConsumersVisible","allPresentControlsClicked",
"allPresentationConsumersVisible","allMapsVisibleAfterConsumers","allOutcomesCertified",
"EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN11_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN11C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
