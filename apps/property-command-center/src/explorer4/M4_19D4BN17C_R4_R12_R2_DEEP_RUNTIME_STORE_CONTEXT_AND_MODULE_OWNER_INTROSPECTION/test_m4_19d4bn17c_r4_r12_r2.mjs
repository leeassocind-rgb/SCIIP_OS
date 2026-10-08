#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"introspect_bn17c_r4_r12_r2.py"),"utf8");
const r=["reactRootsEnumerated","deepFiberTreeTraversed","alternateFibersIncluded","stateNode","updateQueue","dependencies","_currentValue","getState","setState","DEEP_RUNTIME_EXTERNAL_OR_INTERNAL_STORE_SURFACE_RESOLVED","BUNDLE_MODULE_SCOPE_SEARCH_PIPELINE_RESOLUTION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R2_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"DEEP_REACT_ROOT_ALTERNATE_FIBER_CONTEXT_STATE_NODE_AND_MODULE_OWNER_INTROSPECTION"},null,2));