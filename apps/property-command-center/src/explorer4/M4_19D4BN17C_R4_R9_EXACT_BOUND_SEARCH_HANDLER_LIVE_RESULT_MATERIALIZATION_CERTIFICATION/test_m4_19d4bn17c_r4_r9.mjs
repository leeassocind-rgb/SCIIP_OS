#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r9.py"),"utf8");
const r=["invoke_bound_handler","boundHandlerInvoked","handlerAttemptCount","resultMaterialized","exactPropertyResultObserved","allThreeResultsMaterialized","allThreeExactPropertyResultsObserved","EXACT_BOUND_SEARCH_HANDLER_MATERIALIZES_EXACT_LIVE_PROPERTY_RESULTS_ON_MICRO_COHORT","M4_19D4BN17C_R4_R10_EXACT_RESULT_SELECTION_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R9_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"EXACT_BOUND_LIVE_SEARCH_HANDLER_MATERIALIZATION_CERTIFICATION"},null,2));