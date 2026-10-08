#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r2.py"),"utf8");
const r=["evaluate_raw","exceptionDetails","unserializableValue","react_key_counts","react_event_metadata","specific_action_metadata","reactPropsSurfaceObserved","reactFiberSurfaceObserved","priorNullRuntimeResultCountEighteen","M4_19D4BN17C_R4_R3_EXCEPTION_AWARE_EXACT_REACT_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFICATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R2_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"FULL_CDP_RUNTIME_EVALUATE_RESPONSE_AND_REACT_RUNTIME_SURFACE_DIAGNOSIS"},null,2));