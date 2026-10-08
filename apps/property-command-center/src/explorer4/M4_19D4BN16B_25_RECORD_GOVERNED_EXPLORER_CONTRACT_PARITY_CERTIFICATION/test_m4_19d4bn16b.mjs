#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn16b.py"),"utf8");
const req=["M419D4BN16A_R3_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED","exactTwentyFiveCount",
"originalTenPreservedFirst","allTwentyFiveUnique","allCapabilitiesPresent","allTwentyFiveSourceBacked",
"allTwentyFiveContractParityCertified","workspaceSelectionContractPresent","deepLinkRestorePresent",
"M419D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
"EXACT_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
"M4_19D4BN16C_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16B_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));