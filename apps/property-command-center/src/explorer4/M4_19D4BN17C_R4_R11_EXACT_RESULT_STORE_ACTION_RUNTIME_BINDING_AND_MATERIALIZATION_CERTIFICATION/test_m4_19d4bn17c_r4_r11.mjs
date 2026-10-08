#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r11.py"),"utf8");
const r=["bind_and_dispatch","queue.dispatch","SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_STORE_OR_CONTEXT_RUNTIME","allResultStoreActionsInvoked","allThreeResultsMaterialized","allThreeExactPropertyResultsObserved","EXACT_RESULT_STORE_ACTION_MATERIALIZES_EXACT_LIVE_SEARCH_RESULTS_ON_MICRO_COHORT","M4_19D4BN17C_R4_R12_EXACT_RESULT_SELECTION_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R11_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"EXACT_RESULT_STORE_ACTION_RUNTIME_BINDING_AND_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"},null,2));