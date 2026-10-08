#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r4.py"),"utf8");
const r=["resultMaterialized","eventBearingCandidateCount","selectedPropertyCertified","searchResults","selectedProperty","setSelectedProperty","afterSearch150ms","afterSearch500ms","afterSearch1250ms","SEARCH_RESULTS_MATERIALIZE_BUT_SELECTED_PROPERTY_ACTIVATION_ROUTE_REMAINS_UNRESOLVED"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R4_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"DOWNSTREAM_ACTIONS_REMOVED_CAUSAL_FOCUS_RESTRICTED_TO_SEARCH_RESULT_MATERIALIZATION_AND_SELECTION"},null,2));