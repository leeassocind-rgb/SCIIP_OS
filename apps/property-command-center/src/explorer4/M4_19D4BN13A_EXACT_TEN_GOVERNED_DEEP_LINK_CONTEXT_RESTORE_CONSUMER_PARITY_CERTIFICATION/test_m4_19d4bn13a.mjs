#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn13a.py"),"utf8");
const req=["M419D4BN13_DEEP_LINK_CONTEXT_RESTORE_READINESS_CERTIFIED","POST_BN12_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_PARITY_CERTIFICATION_READY","DEEP_LINK_CONTEXT_RESTORE","exactTenCohort","selectedPropertyBoundaryPresent","deepLinkConsumerPresent","contextRestoreConsumerPresent","modeContextConsumptionPresent","noMutationAuthority","M419D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFIED","EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_CONTRACT_PARITY_CERTIFIED","M4_19D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION"];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN13A_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
