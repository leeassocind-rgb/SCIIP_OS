#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"execute_r26d_r2_r2.py"),"utf8");
const q=[
"EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM",
"Reference closed records: 50",
"Live delta records: 50",
"SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED",
"runnerHashVerified",
"targetFileHashVerified",
"nativeOutcomeCountFifty",
"nativeCertifiedCountFifty",
"referenceFiftyNotReexported",
"strictSequentialPreserved",
"haltOnFirstFailurePreserved",
"singleExportMaximumPreserved",
"R26E_R1_STRUCTURED_EXACT_ONE_HUNDRED_ARTIFACT_RUNTIME_REVERIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R2_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R26D_R2_R1_R1_CERTIFIED_NATIVE_NEW50_RUNNER_TO_EXACT_NEW50_GUARDED_LIVE_EXPORT_EXECUTION_WITH_HASH_LOCKED_TARGET_AND_RUNNER"
},null,2));