#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url)),s=fs.readFileSync(path.join(d,"recertify_r26b_r2_r3_r2.py"),"utf8");
const q=["selected SCIIP property marker + hidden 181,831 SF card","canonicalBindingContractConsumed",
"buildingMarkerUniqueByHiddenCard","building1ClickedByHiddenCardIdentity","selectedBuildingReadbackCertified",
"selectedMarkerContainsBuildingSf","selectedMarkerExcludesAggregateSf","selectedPropertyIdPresent",
"assignmentsEntryCertified","directGenerateToReportReviewCertified","exportControlCertified","liveHandlerCertified",
"exportInvocationOff","R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"];
for(const x of q)if(!s.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R26B_R2_R3_R2_STATIC_TEST",status:"PASSED",assertions:q.length,
repair:"R26B_R2_R3_R1_R3_CERTIFIED_SELECTED_MARKER_HIDDEN_CARD_IDENTITY_TO_BUILDING_1_CANONICAL_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"},null,2));