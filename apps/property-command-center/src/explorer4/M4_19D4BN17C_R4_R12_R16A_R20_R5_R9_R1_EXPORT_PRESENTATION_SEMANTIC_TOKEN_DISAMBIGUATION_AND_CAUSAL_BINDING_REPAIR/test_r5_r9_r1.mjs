#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"resolve_r5_r9_r1.py"),"utf8");
const req=["bareModuleExportExcluded","presentationIdentifiersExcluded","semanticControlPatternsApplied","priorExactBindingsReclassified",
"ES_MODULE_EXPORT_DECLARATION_NOT_UI_EXPORT_GATE","PRESENTATION_IDENTIFIER_OR_NON_CONTROL_SEMANTIC_NOT_UI_GATE",
"R5_R9_EXACT_BINDING_REJECTED_AS_LEXICAL_FALSE_POSITIVE_NO_RUNTIME_FIELD_BOUND_TO_SEMANTIC_EXPORT_PRESENTATION_CONTROL",
"liveWorkflowActionAuthorityOff"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R5_R9_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));