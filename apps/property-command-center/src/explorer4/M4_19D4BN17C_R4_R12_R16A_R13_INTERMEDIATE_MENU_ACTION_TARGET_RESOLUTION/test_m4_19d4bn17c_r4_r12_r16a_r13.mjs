#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,'resolve_bn17c_r4_r12_r16a_r13.py'),'utf8');
const req=['r16aR12Passed','r12PriorHandlerClassifiedAsShellFalsePositive','applicationOwnedHandlerInstancesEnumerated','elementRoleAndAncestorContextCaptured','siblingControlContextCaptured','shellNavigationPenaltyApplied','roleSpecificSemanticScoringApplied','ROLE_SPECIFIC_APPLICATION_OWNED_EXPORT_PRESENTATION_TARGETS_RESOLVED','NO_SAFE_EXPORT_PRESENTATION_TARGET_RESOLVED_PRIOR_ONCLICK_WAS_SHELL_OR_MODE_HANDLER','exportPresentationRuntimeInvocationOff'];
for(const x of req)if(!t.includes(x)){console.error('FAIL',x);process.exit(1)}
console.log(JSON.stringify({framework:'SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R13_STATIC_TEST',status:'PASSED',assertions:req.length,repair:'R12_SHELL_MODE_FALSE_POSITIVE_RECONCILIATION_AND_ROLE_SPECIFIC_REACT_HANDLER_INSTANCE_DISAMBIGUATION'},null,2));
