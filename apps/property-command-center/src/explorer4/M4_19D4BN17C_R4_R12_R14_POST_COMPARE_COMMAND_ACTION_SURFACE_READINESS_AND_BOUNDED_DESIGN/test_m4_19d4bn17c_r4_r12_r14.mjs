#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"design_bn17c_r4_r12_r14.py"),"utf8");
const req=["compareClosurePassed","commandUiReferencesResolved","commandStateReferencesResolved","commandVerificationReferencesResolved","CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD","strictSequential","haltOnFirstFailure","commandReadbackRequired","liveCommandAuthorityOff","COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R14_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_FRESH_PAGE_DESIGN"},null,2));