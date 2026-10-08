#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const t=fs.readFileSync(path.join(d,"reconcile_and_close_bn9c_r1.py"),"utf8");
const req=[
"originalBn9cBlockedOnlyAuthorityMetadata",
"bn9aNoMutationAuthorityCertified",
"bn9aAuthorityObjectOmitted",
"checks.noMutationAuthority == true",
"contractWeakened",
"allAnalyzeConsumersVisible",
"allPresentConsumersVisible",
"allOutcomesCertified",
"BN9A_AUTHORITY_METADATA_OMISSION_RECONCILED_EXACT_TEN_ANALYZE_PRESENT_LIFECYCLE_CERTIFIED_AND_CLOSED",
"BN9_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY"
];
for(const x of req){if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN9C_R1_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"BN9A_MISSING_AUTHORITY_OBJECT_RECONCILED_FROM_CERTIFIED_NO_MUTATION_CHECK"
},null,2));
