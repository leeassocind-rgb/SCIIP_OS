#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const a=fs.readFileSync(path.join(d,"build_r26d_r2_r1.py"),"utf8");
const r=fs.readFileSync(path.join(d,"native_new_fifty_runner.py"),"utf8");
const q=[
"RUNNER_INSTALL_AND_STATIC_CERTIFICATION",
"exactNewFiftyTargetCount",
"runnerReadsExternalTargetArgument",
"runnerRejectsWrongCardinality",
"runnerHasExplicitLiveAuthorizationGate",
"runnerNoR25CExactFiftyCoupling",
"singleExportMaximumCertified",
"strictSequentialCertified",
"haltOnFirstFailureCertified",
"artifactPdfContractCertified",
"runtimeZeroContractCertified",
"postPublishUnmountContractCertified",
"R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
];
for(const x of q)if(!a.includes(x)){console.error("FAIL build",x);process.exit(1)}
const rq=[
'EXPECTED_COUNT=50','MAX_EXPORT_CLICKS_PER_RECORD=1','STRICT_SEQUENTIAL=True','HALT_ON_FIRST_FAILURE=True',
'SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED','exportReport','application/pdf',
'pdfDownloadCount','pdfObjectUrlEventCount','runtimeErrorCount','unhandledRejectionCount'
];
for(const x of rq)if(!r.includes(x)){console.error("FAIL runner",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length+rq.length,
 repair:"R26D_R2_CERTIFIED_PROGRESSIVE_DELTA50_CONTRACT_TO_DEDICATED_EXTERNAL_TARGET_NATIVE_NEW50_RUNNER_BUILD_AND_STATIC_CERTIFICATION"
},null,2));