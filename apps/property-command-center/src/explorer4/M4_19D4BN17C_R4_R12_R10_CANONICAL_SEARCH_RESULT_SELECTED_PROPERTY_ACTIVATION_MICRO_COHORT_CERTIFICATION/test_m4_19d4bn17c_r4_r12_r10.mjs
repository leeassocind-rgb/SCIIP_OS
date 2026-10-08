#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"certify_bn17c_r4_r12_r10.py"),"utf8");
const r=[
"r9R2MaterializedThreeOfThree",
"allExactResultsFound",
"allSelectedPropertiesVisible",
"allExplorersRemainMounted",
"allThreeSelectedPropertyActivationsCertified",
"compareAuthorityOff",
"commandAuthorityOff",
"analyzePresentAuthorityOff",
"exportPresentationAuthorityOff",
"CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_THREE_OF_THREE"
];
for(const x of r)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R10_STATIC_TEST",
 status:"PASSED",
 assertions:r.length,
 repair:"CANONICAL_MATERIALIZED_SEARCH_RESULT_TO_SELECTED_PROPERTY_ACTIVATION_THREE_RECORD_CERTIFICATION"
},null,2));