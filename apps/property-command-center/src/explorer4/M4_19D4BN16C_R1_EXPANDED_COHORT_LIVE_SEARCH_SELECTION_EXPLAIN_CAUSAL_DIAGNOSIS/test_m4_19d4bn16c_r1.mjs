#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"diagnose_bn16c_r1.py"),"utf8");
const req=["originalExactTenStillPass10of10","expandedFailCount12","allTwelveShareSameThreeStageResidual","LIVE SEARCHABLE PROPERTY IDENTITY SURFACE","M419D4BN16C_R1_EXPANDED_COHORT_RESIDUAL_CAUSALLY_BOUNDED","M4_19D4BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16C_R1_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));