#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const r=fs.readFileSync(path.join(d,"native_residual_twenty_runner.py"),"utf8");
const w=fs.readFileSync(path.join(d,"execute_r26d_r2_r3_r3.py"),"utf8");
const rq=["EXPECTED_COUNT=20","len(outcomes)==20 and count==20",'"targetCount":20',
"EXACT_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION","112 W Alondra Blvd|181831",
"ALONDRA_PROJECT_AGGREGATE_SF=422277","MAX_EXPORT_CLICKS_PER_RECORD=1","STRICT_SEQUENTIAL=True",
"HALT_ON_FIRST_FAILURE=True","SCIIP_R26D_R2_R3_R3_LIVE_EXPORT_AUTHORIZED"];
for(const x of rq)if(!r.includes(x)){console.error("FAIL runner",x);process.exit(1)}
if(r.includes("EXPECTED_COUNT=50")){console.error("FAIL stale EXPECTED_COUNT=50");process.exit(1)}
const wq=["residualCountExactTwenty","runnerExpectedCountTwenty","runnerNoExpectedCountFifty",
"nativeOutcomeCountTwenty","nativeCertifiedCountTwenty","referenceFiftyNotReexported",
"previousThirtyNotReexported","str(runner),str(repo),str(residual_file)"];
for(const x of wq)if(!w.includes(x)){console.error("FAIL wrapper",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R26D_R2_R3_R3_STATIC_TEST",
 status:"PASSED",
 assertions:rq.length+1+wq.length,
 repair:"R26D_R2_R3_R2_REACHED_NATIVE_RUNNER_BUT_RESIDUAL20_REJECTED_BY_STALE_EXPECTED_COUNT50_TO_DEDICATED_EXPECTED_COUNT20_RUNNER_AND_DISTINCT_RESIDUAL_EVIDENCE_NAMESPACE"
},null,2));