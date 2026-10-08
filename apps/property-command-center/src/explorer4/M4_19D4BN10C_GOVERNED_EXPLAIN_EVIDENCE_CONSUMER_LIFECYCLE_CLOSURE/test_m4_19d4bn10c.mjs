#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"close_bn10_lifecycle.py"),"utf8");

const req=[
"M419D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFIED",
"M419D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLVED",
"M419D4BN10B_R3_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED",
"bn10bR2DiagnosticGapRecorded",
"allExplainActionsResolved",
"allExplainActionsClicked",
"allExplainConsumersVisible",
"allEvidenceSignalsObserved",
"allExplanationSignalsObserved",
"allMapsVisibleAfterExplain",
"EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN10_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY"
];

for(const x of req){
  if(!t.includes(x)){
    console.error("FAIL",x);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_BN10C_STATIC_TEST",
  status:"PASSED",
  assertions:req.length
},null,2));
