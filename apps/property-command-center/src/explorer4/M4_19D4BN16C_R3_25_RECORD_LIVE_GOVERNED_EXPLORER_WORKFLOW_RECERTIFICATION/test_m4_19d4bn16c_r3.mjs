#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),t=fs.readFileSync(path.join(d,"recertify_bn16c_r3.py"),"utf8");
const req=[
"M419D4BN16C_R2_25_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_REAUTHORIZED",
"EXACT_25_RECORD_COHORT_REQUALIFIED_AGAINST_LIVE_SEARCHABLE_PROPERTY_IDENTITY_SURFACE",
"01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","03_MAP_VISIBLE","04_PROPERTY_CONSUMER",
"05_MARKET_NEIGHBORS","06_COMPARE","07_COMMAND","08_PROPERTY_INTELLIGENCE",
"09_ANALYZE_PRESENT","10_EXPLAIN_EVIDENCE","11_EXPORT_PRESENTATION","12_GRAPH_RELATIONSHIP",
"LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"M419D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"EXACT_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE",
"sameSessionHardPrerequisite","inheritedCertification"
];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
if(t.includes("Origin: http://127.0.0.1")){console.error("FAIL synthetic Origin present");process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_BN16C_R3_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));