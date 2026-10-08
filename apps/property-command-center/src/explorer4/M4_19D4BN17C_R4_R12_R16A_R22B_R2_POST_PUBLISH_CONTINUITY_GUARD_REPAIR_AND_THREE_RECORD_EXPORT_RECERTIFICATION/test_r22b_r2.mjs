#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";
const d=path.dirname(fileURLToPath(import.meta.url));
const a=fs.readFileSync(path.join(d,"repair_r22b_r2.py"),"utf8");
const b=fs.readFileSync(path.join(d,"patch_r22b_executor_guard.py"),"utf8");
const q=["INTENDED_POST_PUBLISH_UNMOUNT_NOT_CERTIFIED","REPORT_REVIEW_CONTINUITY_REQUIREMENT: REMOVED",
"POST_PUBLISH_REPORT_REVIEW_UNMOUNT: REQUIRED","applicationSourceMutation", "EXACTLY_ONE_GUARDED_EXPORT_CLICK_PER RECORD MAXIMUM"];
for(const x of q)if(!a.includes(x)){console.error("FAIL",x);process.exit(1)}
if(!b.includes("CERTIFICATION_EXECUTOR_COPY_ONLY"))process.exit(1);
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R22B_R2_STATIC_TEST",status:"PASSED",assertions:6,
repair:"R22B_R1_CERTIFIED_INTENDED_POST_PUBLISH_UNMOUNT_TO_CERTIFICATION_GUARD_REPAIR_AND_EXACT_THREE_RECORD_EXPORT_RECERTIFICATION"},null,2));