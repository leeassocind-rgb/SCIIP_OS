import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"reconcile_bn14.py"),"utf8");
const r=["BN8","BN9","BN10","BN11","BN12","BN13","allSixConsumerFamiliesClosed","noMutationAuthority","READ_ONLY_PHASE_RECONCILIATION","POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED","BN8_THROUGH_BN13_GOVERNED_DOWNSTREAM_CONSUMER_FAMILIES_CERTIFIED_CLOSED_AND_NEXT_PHASE_READY","M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN"];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN14_STATIC_TEST",status:"PASSED",assertions:r.length},null,2));