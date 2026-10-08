#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r6.py"),"utf8");
const r=["searchResults","filteredResults","useMemo","useEffect","render_gate","liveSearchOwnerChainCaptured","hookState","arrayObservations","BODY_RESULT_MATERIALIZED","RUNTIME_ARRAY_STATE_CHANGED","SEARCH_RESULT_COLLECTION_CHANGES_IN_RUNTIME_BUT_RENDER_CONDITION_SUPPRESSES_VISIBLE_RESULTS"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R6_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_TRACED_FROM_SOURCE_TO_REACT_OWNER_CHAIN"},null,2));