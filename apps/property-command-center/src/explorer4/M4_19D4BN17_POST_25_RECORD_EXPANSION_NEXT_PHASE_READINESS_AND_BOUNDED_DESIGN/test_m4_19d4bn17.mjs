#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"design_bn17.py"),"utf8");
const req=["M419D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSED","EXACT_25_RECORD_GOVERNED_EXPLORER_EXPANSION_LIFECYCLE_CERTIFIED_AND_CLOSED","EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION","referenceCohortSize\":25","nextCohortCeiling\":50","scaleFactor\":2.0","DETERMINISTIC","READ_ONLY_CERTIFICATION","haltOnFirstFailure\":True","mutationAuthorityGranted\":False","M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED","M4_19D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN17_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));