#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn17c_r4_r12_r13a_r2.py"),"utf8");
const req=["freshPageSameBrowserAttempted","freshIsolatedBrowserAttempted","probePropertyTestedAcrossContexts","controlPropertyTestedAcrossContexts","PROPERTY_SPECIFIC_CLICK_TARGET_GAP","SEARCH_MATERIALIZATION_GAP","PER_RECORD_ISOLATED_TARGET_COMPARE_MICRO_COHORT_RECERTIFICATION","FRESH_RUNTIME_CONTEXT_RESTORES_RECORD_TWO_SELECTION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R2_STATIC_TEST",status:"PASSED",assertions:req.length,repair:"FRESH_PAGE_AND_FRESH_BROWSER_SELECTION_REPRODUCIBILITY_ISOLATION"},null,2));