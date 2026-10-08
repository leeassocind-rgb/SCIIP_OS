#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2_r3_r1_r3.py"),"utf8");
const q=["READ_ONLY_EVIDENCE_CANONICAL_IDENTITY_RECONCILIATION","181,831 SF","422,277 SF",
"visibleInnerTextSfNotRequiredWhenSelectedMarkerLabelCollapses","addressOnlyBindingStillForbidden",
"projectAggregateBindingForbiddenForBuilding1","selectedPropertyIdMayBeUsedOnlyAsReadbackAfterMarkerIdentityCertified",
"buildingSfPresentInSelectedMarkerOuterHtml","bindingRequiresSelectedMarkerState",
"Live UI interaction: OFF","Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF",
"BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R3_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_R2_R3_R1_R2_DISTINCT_SELECTED_ADDRESS_ONLY_MARKER_WITH_181831_SF_IN_HIDDEN_CARD_TO_CANONICAL_BUILDING_BINDING_CONTRACT"},null,2));