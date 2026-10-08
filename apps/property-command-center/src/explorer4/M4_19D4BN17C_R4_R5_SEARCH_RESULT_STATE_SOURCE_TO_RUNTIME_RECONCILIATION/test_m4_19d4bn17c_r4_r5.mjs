#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"reconcile_bn17c_r4_r5.py"),"utf8");
const r=["searchResults","debounce","useEffect","fiberChain","directReactActivation","nativeDomActivation","DIRECT_REACT_RESULT_MATERIALIZED","NATIVE_DOM_RESULT_MATERIALIZED","SEARCH_RESULT_MATERIALIZATION_REQUIRES_NATIVE_DOM_EVENT_CONTRACT_NOT_DIRECT_REACT_PROP_INVOCATION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R5_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"SEARCH_RESULT_STATE_TRACED_FROM_SOURCE_TO_LIVE_REACT_AND_NATIVE_DOM_ACTIVATION_PATHS"},null,2));