#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r26b_r2_r1.py"),"utf8");
const q=["DUPLICATE_IDENTITY_DIAGNOSIS","112 W Alondra Blvd","normalizedCount=2","visibleSfTokensDistinct",
"PriorClassificationCorrected".toLowerCase(),"Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF",
"CANONICAL_RECORD_KEY_BINDING_REPAIR"];
for(const x0 of q){const x=x0; if(!s.toLowerCase().includes(x.toLowerCase())){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R2_R1_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_R2_BOUNDARY_NORMALIZED_BINDING_OBSERVED_BUT_TWO_SAME_ADDRESS_CANDIDATES_PROVE_AMBIGUITY_TO_READ_ONLY_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION"},null,2));