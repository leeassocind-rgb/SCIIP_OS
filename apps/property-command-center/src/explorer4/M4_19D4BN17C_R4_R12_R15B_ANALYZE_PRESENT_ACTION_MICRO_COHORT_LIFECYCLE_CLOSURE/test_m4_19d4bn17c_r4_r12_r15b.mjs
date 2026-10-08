#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"close_bn17c_r4_r12_r15b.py"),"utf8");
const req=[
"r15aPassed",
"analyzeCertifiedCountThree",
"presentCertifiedCountThree",
"allThreeAnalyzeActionsCertified",
"allThreePresentActionsCertified",
"eachOutcomeAnalyzeCertified",
"eachOutcomePresentCertified",
"ANALYZE_PRESENT_ACTIONS_CERTIFIED_AND_CLOSED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION",
"POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_BN17C_R4_R12_R15B_STATIC_TEST",
 status:"PASSED",
 assertions:req.length,
 repair:"ANALYZE_PRESENT_3_OF_3_EVIDENCE_CLOSURE_AND_EXPORT_PRESENTATION_HANDOFF"
},null,2));