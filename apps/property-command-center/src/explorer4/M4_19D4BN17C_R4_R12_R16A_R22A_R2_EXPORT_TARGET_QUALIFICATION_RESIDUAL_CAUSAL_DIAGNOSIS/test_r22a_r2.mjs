#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r22a_r2.py"),"utf8");
const q=["r22aR1IncompleteStateConsumed","sourceTargetSelectionCorrelationCompleted","targetAbsentOnFreshBrokerHome",
"explorerControlAvailableOnFreshPage","EXPLORER_ACTION","TARGET_VISIBLE_AFTER_EXPLORER_ENTRY",
"exportInvocationOff","generateReportInvocationOff","applicationMutationOff","governedMutationOff",
"R22A_R1_SELECTION_ORDER_INVALID_TARGET_LOOKUP_EXECUTED_BEFORE_EXPLORER_SEARCH_CONTEXT_MATERIALIZATION",
"TARGET_NOT_MATERIALIZED_BY_EXPLORER_ENTRY_SEARCH_DRIVEN_SELECTION_REQUIRED"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R22A_R2_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R22A_R1_ZERO_OF_THREE_SELECTED_PROPERTY_READBACK_FAILURE_TO_NON_MUTATING_FRESH_PAGE_EXPLORER_ENTRY_AND_SEARCH_SELECTION_CAUSAL_DIAGNOSIS"},null,2));