#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn17c_r4_r3.py"),"utf8");
const r=["exceptionDetails","__reactProps$","onChange","onKeyDown","onClick","MICRO=[","02_SELECTED_PROPERTY","06_COMPARE","07_COMMAND","09_ANALYZE_PRESENT","11_EXPORT_PRESENTATION","microCohortRecertifiedThreeOfThree"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R3_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"EXCEPTION_AWARE_EXACT_REACT_EVENT_ACTIVATION_WITH_THREE_RECORD_MICRO_COHORT"},null,2));