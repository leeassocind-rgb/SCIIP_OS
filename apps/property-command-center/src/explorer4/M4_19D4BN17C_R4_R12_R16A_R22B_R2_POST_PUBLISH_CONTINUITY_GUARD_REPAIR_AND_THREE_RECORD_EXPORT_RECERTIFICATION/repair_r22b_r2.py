#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys

M="M4_19D4BN17C_R4_R12_R16A_R22B_R2_POST_PUBLISH_CONTINUITY_GUARD_REPAIR_AND_THREE_RECORD_EXPORT_RECERTIFICATION"
R1="M4_19D4BN17C_R4_R12_R16A_R22B_R1_GUARDED_EXPORT_MICRO_COHORT_RESIDUAL_CAUSAL_DIAGNOSIS"
R22B="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"
TARGETS=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    p=ev/R1/"guarded_export_micro_cohort_residual_causal_diagnosis.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R22B_R1_EVIDENCE_REQUIRED"); return 4
    r1=loadj(p)
    if r1.get("classification")!="R22B_EXPORT_SUCCEEDED_REPORT_REVIEW_UNMOUNT_IS_INTENDED_POST_PUBLISH_BEHAVIOR":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: INTENDED_POST_PUBLISH_UNMOUNT_NOT_CERTIFIED"); return 5

    # This package repairs the CERTIFICATION CONTRACT only. It does not mutate application source.
    guard={
      "preExportRequired":["selected property certified","Assignments entry certified",
        "Report Review visible","exactly one visible enabled Download Client Listing Report",
        "live handler name equals exportReport"],
      "exportRequired":["exactly one export click","exactly one PDF download signal",
        "exactly one application/pdf object URL event","positive PDF size",
        "zero runtime errors","zero unhandled rejections"],
      "postPublishRequired":["Report Review unmounted/closed as source-defined publish behavior",
        "Explorer shell remains mounted","same SCIIP origin remains"],
      "postPublishForbidden":["Report Review continuity as a success requirement"]
    }

    # Persist repaired guard and preauthorization. Actual live recertification is delegated to the
    # existing R22B executor via a patched local copy created by the shell wrapper.
    outdir=ev/M; outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"post_publish_continuity_guard_repair.json"
    data={
      "framework":"SCIIP_EXPLORER_4_R22B_R2_POST_PUBLISH_CONTINUITY_GUARD_REPAIR",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R22B_R2_POST_PUBLISH_GUARD_REPAIRED_RECERTIFICATION_AUTHORIZED",
      "classification":"SOURCE_CERTIFIED_POST_PUBLISH_UNMOUNT_REPLACES_REPORT_REVIEW_CONTINUITY_REQUIREMENT",
      "targets":TARGETS,
      "guard":guard,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
        "networkAuthority":False,"pixelEvidence":False,
        "exportAuthority":"EXACTLY_ONE_GUARDED_EXPORT_CLICK_PER RECORD MAXIMUM"},
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE"
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")
    print("CLASSIFICATION:",data["classification"])
    print("TARGETS:",TARGETS)
    print("REPORT_REVIEW_CONTINUITY_REQUIREMENT: REMOVED")
    print("POST_PUBLISH_REPORT_REVIEW_UNMOUNT: REQUIRED")
    print("APPLICATION_SOURCE_MUTATION: OFF")
    print("STATUS: PASSED")
    print("STATE:",data["state"])
    print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
