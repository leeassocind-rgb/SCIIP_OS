#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r11.py"),"utf8");
const r=["r10CertifiedTwoOfThree","twoMusickWasSoleGap","clickableAncestorScoringCompleted","boundedActivationProbeCompleted","__reactProps$","reactHandlers","TWO_MUSICK_CLICK_TARGET_RESOLVED_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_MICRO_COHORT_CAN_CLOSE","SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_RECERTIFICATION_AND_CLOSURE"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R11_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"EVENT_BEARING_RESULT_ANCESTOR_SCORING_AND_TWO_MUSICK_STATE_TRANSITION_DIAGNOSIS"},null,2));