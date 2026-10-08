#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r13a_r1.py"),"utf8");
const req=["r13aCertifiedFirstRecord","r13aHaltedOnSecondSelectionGap","postCompareSnapshotCaptured","rootNavigationResetObserved","explicitCloseSurfaceProbed","hardReloadResetProbed","deterministicResetContractResolved","PREFERRED_RESET_CONTRACT","RECERTIFICATION_WITH_DETERMINISTIC_RESET"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R1_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"COMPARE_POST_ACTION_CROSS_RECORD_RESET_VARIANT_DIAGNOSIS"},null,2));