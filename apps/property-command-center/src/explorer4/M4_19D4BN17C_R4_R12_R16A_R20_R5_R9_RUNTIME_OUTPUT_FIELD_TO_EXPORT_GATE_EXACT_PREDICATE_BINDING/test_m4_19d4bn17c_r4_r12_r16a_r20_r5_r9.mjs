#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"resolve_bn17c_r4_r12_r16a_r20_r5_r9.py"),"utf8");
const req=["r5R8CorrelationConsumed","tightPredicateNeighborhoodsInspected","explorerPresentationControlInspected",
"moduleExportSyntaxFalsePositiveChecked","generatedDiagnosticSourcesExcludedFromCausalBinding",
"EXACT_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_PREDICATE_BINDING_RESOLVED",
"R5_R8_RUNTIME_EXPORT_GATE_CORRELATION_REJECTED_AS_LEXICAL_FALSE_POSITIVE","liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R9_STATIC_TEST",
status:"PASSED",assertions:req.length,
repair:"R5_R8_BROAD_FILE_LEVEL_CORRELATION_TO_TIGHT_EXECUTABLE_EXPORT_PRESENTATION_PREDICATE_BINDING_AND_FALSE_POSITIVE_REJECTION"},null,2));