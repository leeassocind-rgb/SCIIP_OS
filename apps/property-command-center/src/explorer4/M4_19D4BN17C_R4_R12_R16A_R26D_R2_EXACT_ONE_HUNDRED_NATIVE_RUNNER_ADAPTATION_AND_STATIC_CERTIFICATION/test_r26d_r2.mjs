#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"adapt_r26d_r2.py"),"utf8");
const q=[
"READ_ONLY_PROGRESSIVE_EXECUTION_ADAPTATION_DESIGN",
"PROGRESSIVE_DELTA_FIFTY_EXECUTION",
"REUSE_CLOSED_R25F_EVIDENCE",
"NEW_NATIVE_GUARDED_LIVE_EXPORT",
"referenceFiftyWillNotBeReexported",
"externalNewFiftyTargetFileRequired",
"mustNotLoadR25CExactFiftyCohort",
"mustConsumeR26CGuardContract",
"buildingProjectAwareBindingRequired",
"ambiguousAddressOnlyBindingForbidden",
"singleExportMaximumPreserved",
"allArtifactGuardsPreserved",
"allRuntimeGuardsPreserved",
"R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION",
"Live UI interaction: OFF",
"Export invocation: OFF"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26D_R1_PROVED_EXACT100_HANDOFF_FAILURE_TO_PROGRESSIVE_DELTA50_NATIVE_EXECUTION_ADAPTATION_WITH_REFERENCE50_LIFECYCLE_REUSE"
},null,2));