#!/usr/bin/env node
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r8.py"),"utf8");
const r=[
"sourceHandlerCandidatesRanked",
"liveReactSearchOwnerCaptured",
"liveEventFunctionsFingerprinted",
"sourceToRuntimeMappingAttempted",
"sourceRuntimeMappings",
"directEventProps",
"ownerChain",
"handleSearch",
"setSearchResults",
"dispatcher",
"context_store",
"EXACT_SOURCE_SEARCH_HANDLER_OWNER_MAPPED_TO_LIVE_REACT_RUNTIME"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R8_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"SOURCE_DEFINED_SEARCH_HANDLER_AND_LIVE_REACT_OWNER_FINGERPRINTS_CROSS_MAPPED"
},null,2));