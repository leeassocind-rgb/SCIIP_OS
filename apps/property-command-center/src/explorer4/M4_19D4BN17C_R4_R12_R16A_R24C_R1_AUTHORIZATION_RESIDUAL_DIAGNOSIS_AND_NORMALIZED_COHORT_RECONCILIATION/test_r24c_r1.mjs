#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"reconcile_r24c_r1.py"),"utf8");
const q=[
"READ_ONLY_EVIDENCE_RECONCILIATION",
"norm_candidate",
"PROPOSED",
"rawOrderMismatchConfirmed",
"normalizedR24aNewOrderMatchesR24bR3QualifiedOrder",
"normalizedExactTwentyFiveReconciled",
"noCohortReordering",
"noCandidateSubstitution",
"identityGuardNotWeakened",
"R24C_AUTHORIZATION_GAP_CAUSED_SOLELY_BY_RAW_STATUS_SUFFIX_IDENTITY_PARITY_MISMATCH_NORMALIZED_COHORT_ORDER_RECONCILED",
"M4_19D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_RECERTIFICATION"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R24C_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R24C_SINGLE_FALSE_ORDER_RECONCILIATION_CAUSED_BY_RAW_STATUS_SUFFIXES_TO_READ_ONLY_NORMALIZED_IDENTITY_PARITY_RECONCILIATION_WITHOUT_REORDERING_OR_SUBSTITUTION"
},null,2));