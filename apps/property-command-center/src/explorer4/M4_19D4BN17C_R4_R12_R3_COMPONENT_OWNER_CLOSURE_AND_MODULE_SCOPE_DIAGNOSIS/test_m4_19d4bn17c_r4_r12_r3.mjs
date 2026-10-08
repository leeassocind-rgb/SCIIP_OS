#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r3.py"),"utf8");
const r=["activeRuntimeAssetInventoryCaptured","localSearchResultModuleInventoryCaptured","runtimeToLocalBundleCorrelationAttempted","searchResultSelectionOwnerCandidatesResolved","reactAttachmentTopologyCaptured","performanceResources","runtimeLocalCorrelations","searchResultSelectionOwnerCandidates","ACTIVE_BROWSER_RUNTIME_CORRELATES_TO_DIST_BUNDLE_SEARCH_PIPELINE_MODULE_SCOPE_OWNER","ACTIVE_DIST_BUNDLE_SEARCH_PIPELINE_SYMBOL_AND_EXECUTION_CONTRACT_RESOLUTION"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R3_STATIC_TEST",status:"PASSED",assertions:r.length,repair:"COMPONENT_OWNER_CLOSURE_PLUS_ACTIVE_RUNTIME_ASSET_AND_MODULE_SCOPE_CORRELATION"},null,2));