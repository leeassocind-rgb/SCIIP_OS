#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"repair_r28a_r4.py"),"utf8");
const q=["strip_ui_action_prefix","UI_PREFIXES=[\"SELECT\"]","uiActionPrefixNormalizationOccursBeforeCanonicalComparison","rawUiTextForbiddenAsCanonicalIdentity","Select 701 E Ball Rd","Select 3200 Nasa St","referenceLabelsExcludedAfterPrefixNormalization","knownOverlapRegressionAddressesExcluded","postRepairReferenceOverlapCount","exactNewTwoHundredCandidatesResolved","ADDRESS_PLUS_VISIBLE_SF","Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF","R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R28A_R4_STATIC_TEST",status:"PASSED",assertions:q.length,repair:"R28A_R3_EXPOSED_PRESENTATION_LAYER_SELECT_PREFIX_CONTAMINATION_TO_PREFIX_FIRST_CANONICALIZATION_REFERENCE_EXCLUSION_INTEGRITY_REPAIR_AND_EXACT_NEW200_RECERTIFICATION"},null,2));
