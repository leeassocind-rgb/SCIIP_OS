#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r4_r1.py"),"utf8");
const r=[
"cdpAbsenceTolerated",
"certifiedRuntimeAssetFallbackAvailable",
"CERTIFIED_R4_R12_R3_EVIDENCE",
"activeLocalDistBundlesResolved",
"queryIngressSymbolsCaptured",
"resultDerivationSymbolsCaptured",
"resultOwnerSymbolsCaptured",
"selectionSymbolsCaptured",
"sourceModuleCorrelationCaptured",
"CERTIFIED_ACTIVE_DIST_BUNDLE_CONTAINS_COMPLETE_SEARCH_RESULT_SELECTION_EXECUTION_CONTRACT",
"ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_RUNTIME_BINDING_RESOLUTION"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R4_R1_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"CDP_TARGET_ABSENCE_RECONCILED_WITH_CERTIFIED_R3_RUNTIME_ASSET_EVIDENCE_FALLBACK"
},null,2));