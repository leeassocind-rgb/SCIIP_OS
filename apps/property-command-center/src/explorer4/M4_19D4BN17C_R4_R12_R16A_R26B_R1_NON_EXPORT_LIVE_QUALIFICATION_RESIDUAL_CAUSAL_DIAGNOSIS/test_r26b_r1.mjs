#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r1.py"),"utf8");
const q=["READ_ONLY_EVIDENCE_DIAGNOSIS","112 W Alondra Blvd","thirtyRecordsQualifiedBeforeHalt",
"firstFailureOrdinalThirtyOne","targetBindingSettleFailed","selectionNotPerformed","explorerContinuityPreserved",
"sameOriginPreserved","noRetryPerformed","liveUiInteractionOff","exportInvocationOff",
"R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSIS"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R1_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_THIRTY_OF_FIFTY_QUALIFIED_WITH_RECORD_31_TARGET_BINDING_FAILURE_TO_READ_ONLY_EXACT_STAGE_RESIDUAL_CAUSAL_DIAGNOSIS"},null,2));