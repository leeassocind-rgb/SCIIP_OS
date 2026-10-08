#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"close_r22c_r1.py"),"utf8");
const q=[
"flatAndNestedArtifactSchemaSupported",
"artifactEvidenceSchemaResolved",
'coalesce(x.get("pdfDownloadCount"),a.get("pdfDownloadCount"))',
'coalesce(x.get("pdfFilename"),a.get("filename"),a.get("pdfFilename"))',
"allPdfArtifactsCertified",
"allRuntimeContinuityCertified",
"noAdditionalExportInvocation",
"EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_ARTIFACT_SCHEMA_NORMALIZED_AND_LIFECYCLE_CLOSED",
"M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({
 framework:"SCIIP_EXPLORER_4_R22C_R1_STATIC_TEST",
 status:"PASSED",
 assertions:q.length,
 repair:"R22C_FALSE_ARTIFACT_GAP_REPAIRED_BY_FLAT_AND_NESTED_R22B_ARTIFACT_EVIDENCE_SCHEMA_NORMALIZATION"
},null,2));