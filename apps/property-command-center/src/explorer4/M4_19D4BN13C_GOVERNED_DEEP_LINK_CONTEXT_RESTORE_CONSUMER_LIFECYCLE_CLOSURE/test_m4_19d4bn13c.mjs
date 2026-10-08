#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"close_bn13_lifecycle.py"),"utf8");
const req=[
"M419D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFIED",
"M419D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED",
"allDeepLinkSearchObserved","allUrlsRestored","allPostRestorePropertiesVisible",
"allPostRestoreExplorersMounted","allMapsVisibleAfterRestore","allOutcomesCertified",
"EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN13_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY",
"READ_ONLY_EVIDENCE_CLOSURE","noMutationAuthority"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN13C_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
