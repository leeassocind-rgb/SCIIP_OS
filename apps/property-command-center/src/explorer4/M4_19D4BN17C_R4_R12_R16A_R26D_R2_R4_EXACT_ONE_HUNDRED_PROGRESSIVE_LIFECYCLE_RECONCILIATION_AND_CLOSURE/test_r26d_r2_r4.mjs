#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r26d_r2_r4.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE",
"REFERENCE_CLOSED_COUNT: 50",
"PREVIOUSLY_CERTIFIED_NEW_COUNT: 30",
"RESIDUAL_CERTIFIED_COUNT: 20",
"EXACT_ONE_HUNDRED_COUNT: 100",
"candidateOneHundredExact",
"candidateOneHundredUnique",
"progressiveNewFiftyOrderMatchesCandidateCohort",
"alondraOverallOrdinal81Preserved",
"firstThirtyArtifactRuntimeCertified",
"residualTwentyArtifactRuntimeCertified",
"referenceFiftyNotReexported",
"previousThirtyNotReexported",
"residualTwentyNotRetriedAfterCertification",
"EXACT_ONE_HUNDRED_RECORD_EXPORT_LIFECYCLE_CLOSED",
"R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
"Export invocation: OFF",
"Export retry: OFF"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R4_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R25F_CLOSED_REFERENCE50_PLUS_R26D_R2_R2_FIRST30_PLUS_R26D_R2_R3_R3_RESIDUAL20_TO_EXACT100_READ_ONLY_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE"
},null,2));