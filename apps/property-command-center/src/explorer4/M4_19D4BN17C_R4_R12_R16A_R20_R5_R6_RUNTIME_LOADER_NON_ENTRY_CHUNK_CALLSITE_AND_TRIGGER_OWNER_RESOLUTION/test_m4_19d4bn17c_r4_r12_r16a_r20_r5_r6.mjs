#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r5_r6.py"),"utf8");
const req=["r5R5NonEntryDirectImportClassificationConsumed","directNonEntryImportBindingsResolved",
"callsiteScanCompleted","lexicalOwnerResolutionAttempted","argumentShapesCaptured",
"sourceSemanticCorrelationCompleted","NON_ENTRY_RUNTIME_IMPORT_CALLSITE_AND_LEXICAL_TRIGGER_OWNER_RESOLVED",
"liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R6_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"R5_R5_NON_ENTRY_RUNTIME_IMPORT_TO_EXACT_CALLSITE_LEXICAL_TRIGGER_OWNER_ARGUMENT_SHAPE_AND_SOURCE_CORRELATION"
},null,2));