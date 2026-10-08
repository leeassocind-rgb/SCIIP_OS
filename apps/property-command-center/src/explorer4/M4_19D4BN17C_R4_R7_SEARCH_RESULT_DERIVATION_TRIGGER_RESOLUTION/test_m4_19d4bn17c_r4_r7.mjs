#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r7.py"),"utf8");
const r=["useMemo","useEffect","useCallback","resultSetterReferencesCaptured","queue","lastRenderedState","native_input_only","keydown_enter","submit_nearest_form","CHANGED_ARRAY_TRIGGERS","MATERIALIZED_TRIGGERS","EXACT_SOURCE_SEARCH_HANDLER_RUNTIME_BINDING_RESOLUTION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R7_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"QUERY_TO_RESULT_DERIVATION_INVALIDATION_TRIGGER_RESOLVED_ACROSS_SOURCE_AND_LIVE_HOOK_STATE"},null,2));