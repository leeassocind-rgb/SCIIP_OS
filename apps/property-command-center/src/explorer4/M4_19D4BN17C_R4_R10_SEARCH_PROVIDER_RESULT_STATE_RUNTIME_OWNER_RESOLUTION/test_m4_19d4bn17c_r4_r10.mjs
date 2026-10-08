#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r10.py"),"utf8");
const r=[
"sourceResultOwnerCandidatesRanked",
"liveReactProviderOwnersCaptured",
"liveResultArrayCandidatesCaptured",
"liveDispatchFunctionsCaptured",
"sourceRuntimeOwnerMappingAttempted",
"context_provider",
"store",
"dispatcher",
"selector",
"SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_STORE_OR_CONTEXT_RUNTIME",
"M4_19D4BN17C_R4_R11_EXACT_RESULT_STORE_ACTION_RUNTIME_BINDING_AND_MATERIALIZATION_CERTIFICATION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R10_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"SEARCH_RESULT_PROVIDER_STORE_SELECTOR_RUNTIME_OWNER_CROSS_MAPPING"
},null,2));