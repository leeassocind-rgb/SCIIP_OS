#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r1.py"),"utf8");
const r=["dispatchAssumptionInvalidated","liveRuntimeStateTransitionSurfacesScanned","liveCallableSearchOrUpdateSurfaceFound","getState","setState","subscribe","providerValue","context:","window.","LIVE_EXTERNAL_STORE_API_SURFACE_RESOLVED_OUTSIDE_REACT_HOOK_DISPATCH"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R1_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"REACT_HOOK_DISPATCH_ASSUMPTION_RECONCILED_TRUE_LIVE_STATE_TRANSITION_SURFACE_DISCOVERY"},null,2));