#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"diagnose_r28c_r1.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_SHAPE_AND_POLICY_FIELD_DIAGNOSIS",
"r28cPriorR28PolicyPassedFalse",
"r28cPriorR28ExactPolicyFalse",
"referenceCohortSize200Resolved",
"nextCohortSize400Resolved",
"scaleFactor2Resolved",
"newLiveExpansionRecords200Resolved",
"progressiveDeltaTwoHundredResolved",
"referenceReexportFalseResolved",
"semanticR28PolicyCertified",
"fieldPathsCaptured",
"R28_POLICY_SEMANTICALLY_CERTIFIED_R28C_READER_FIELD_LOCATION_OR_SHAPE_MISMATCH_CONFIRMED",
"R28C_R2_SHAPE_SAFE_R28_POLICY_BINDING_REPAIR_AND_EXECUTION_AUTHORIZATION_RECERTIFICATION",
"Live UI interaction: OFF",
"Export invocation: OFF",
"Application source mutation: OFF",
"Governed data mutation: OFF"
];
for(const x of q){if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R28C_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R28C_ONLY_R28_POLICY_CHECKS_FALSE_WHILE_ALL_DOWNSTREAM_AUTHORIZATION_GUARDS_PASS_TO_READ_ONLY_R28_EVIDENCE_SHAPE_FIELD_LOCATION_AND_SEMANTIC_POLICY_CAUSAL_DIAGNOSIS"
},null,2));