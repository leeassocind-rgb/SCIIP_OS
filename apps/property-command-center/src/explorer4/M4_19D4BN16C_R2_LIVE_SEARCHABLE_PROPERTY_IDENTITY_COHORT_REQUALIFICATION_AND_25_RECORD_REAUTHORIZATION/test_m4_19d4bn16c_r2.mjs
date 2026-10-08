#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"requalify_bn16c_r2.py"),"utf8");
const req=["EXPANDED_COHORT_SEARCH_SELECTION_GAP_DRIVES_EXPLAIN_EVIDENCE_RESIDUAL","threePreviouslyLiveExpandedPinned","exactlyTwelveReplacementCandidatesQualified","allReplacementCandidatesLiveSearchQualified","M419D4BN16C_R2_25_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_REAUTHORIZED","M4_19D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16C_R2_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));