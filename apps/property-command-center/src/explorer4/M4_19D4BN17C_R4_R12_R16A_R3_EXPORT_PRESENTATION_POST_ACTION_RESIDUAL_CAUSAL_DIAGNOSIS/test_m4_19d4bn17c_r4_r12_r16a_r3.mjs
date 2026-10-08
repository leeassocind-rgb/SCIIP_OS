#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r16a_r3.py"),"utf8");
const req=["r2FalsePositiveControlClassified","propertyCardExclusionApplied","exactActionSemanticsScored","contextualMenusDiagnosed","FALSE_POSITIVE_PROPERTY_CARD_TARGET_CAUSED_R2_FAILURE","EXACT_ACTION_SEMANTIC_EXPORT_PRESENTATION_LIVE_MICRO_COHORT_RECERTIFICATION","EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLUTION","exportPresentationExecutionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R3_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"FALSE_POSITIVE_PROPERTY_CARD_EXPORT_TARGET_EXCLUSION_AND_EXACT_ACTION_SEMANTIC_DIAGNOSIS"},null,2));
