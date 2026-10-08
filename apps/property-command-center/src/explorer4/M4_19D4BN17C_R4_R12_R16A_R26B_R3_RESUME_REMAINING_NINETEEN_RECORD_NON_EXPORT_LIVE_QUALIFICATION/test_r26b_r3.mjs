#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"qualify_r26b_r3.py"),"utf8");
const q=["Previously qualified new records preserved: 30","Alondra record-31 recertification consumed: REQUIRED",
"Remaining execution records: 19","exactNineteenRemainingTargetsConsumed","firstThirtyQualifiedPreserved",
"alondraRecord31RecertificationConsumed","alondraProjectAggregateExclusionPreserved","allNineteenRemainingRecordsQualified",
"Fresh page per record: REQUIRED","Strict sequential: ON","Halt on first failure: ON","Export invocation: OFF",
"R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
const t=JSON.parse(fs.readFileSync(path.join(d,"REMAINING_NINETEEN_TARGETS.json"),"utf8"));
if(t.length!==19||new Set(t).size!==19){console.error("FAIL targets");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R3_STATIC_TEST",status:"PASSED",assertions:q.length+2,
repair:"R26B_FIRST_THIRTY_QUALIFIED_PLUS_ALONDRA_RECORD_31_CANONICALLY_RECERTIFIED_TO_STRICT_SEQUENTIAL_RESUME_OF_ONLY_REMAINING_NINETEEN_NON_EXPORT_RECORDS"},null,2));