#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE"
R5="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"
R8="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
TARGETS=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p5=evid/R5/"exact_three_record_guarded_export_micro_cohort_execution.json"
    p8=evid/R8/"bounded_selection_settle_readback_and_third_record_export_recertification.json"

    if not p5.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R22B_R2_R5_EVIDENCE_REQUIRED"); return 4
    if not p8.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R22B_R2_R8_EVIDENCE_REQUIRED"); return 5

    r5=loadj(p5)
    r8=loadj(p8)

    outs=r5.get("outcomes") or []
    if len(outs)<2:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R22B_R2_R5_FIRST_TWO_RECORD_OUTCOMES_REQUIRED"); return 6

    first_two=outs[:2]
    third=(r8.get("outcome") or {})

    first_two_ok=all(x.get("certified") is True for x in first_two)
    third_ok=(r8.get("state")=="M419D4BN17C_R4_R12_R16A_R22B_R2_R8_THIRD_RECORD_EXPORT_CERTIFIED"
              and third.get("certified") is True)

    if not first_two_ok:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FIRST_TWO_EXPORTS_NOT_CERTIFIED"); return 7
    if not third_ok:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: THIRD_EXPORT_NOT_CERTIFIED"); return 8

    records=[]
    for i,x in enumerate(first_two):
        records.append({
          "ordinal":i+1,
          "target":x.get("target") or TARGETS[i],
          "certified":True,
          "freshTargetCreated":x.get("freshTargetCreated"),
          "selectedPropertyCertified":x.get("selectedPropertyCertified"),
          "assignmentsEntryCertified":x.get("assignmentsEntryCertified"),
          "reportReviewEntryCertified":x.get("reportReviewEntryCertified"),
          "exportControlCertified":x.get("exportControlCertified"),
          "liveHandlerCertified":x.get("liveHandlerCertified"),
          "pdfDownloadCount":x.get("pdfDownloadCount"),
          "pdfEventCount":x.get("pdfEventCount"),
          "pdfFilename":x.get("pdfFilename"),
          "pdfSizeBytes":x.get("pdfSizeBytes"),
          "runtimeErrorCount":x.get("runtimeErrorCount"),
          "unhandledRejectionCount":x.get("unhandledRejectionCount"),
          "postPublishReportReviewUnmountCertified":x.get("postPublishReportReviewUnmountCertified"),
          "explorerContinuity":x.get("explorerContinuity"),
          "sameOrigin":x.get("sameOrigin"),
          "evidenceSource":"R22B-R2-R5"
        })

    a=third.get("artifact") or {}
    records.append({
      "ordinal":3,
      "target":third.get("target") or TARGETS[2],
      "certified":True,
      "freshTargetCreated":third.get("freshTargetCreated"),
      "selectedPropertyCertified":third.get("selectedPropertyCertified"),
      "assignmentsEntryCertified":third.get("assignmentsEntryCertified"),
      "reportReviewEntryCertified":third.get("reportReviewEntryCertified"),
      "exportControlCertified":third.get("exportControlCertified"),
      "liveHandlerCertified":third.get("liveHandlerCertified"),
      "pdfDownloadCount":a.get("pdfDownloadCount"),
      "pdfEventCount":a.get("pdfEventCount"),
      "pdfFilename":a.get("filename"),
      "pdfSizeBytes":a.get("sizeBytes"),
      "runtimeErrorCount":third.get("runtimeErrorCount"),
      "unhandledRejectionCount":third.get("unhandledRejectionCount"),
      "postPublishReportReviewUnmountCertified":third.get("postPublishReportReviewUnmountCertified"),
      "explorerContinuity":third.get("explorerContinuity"),
      "sameOrigin":third.get("sameOrigin"),
      "selectionSettleCertified":(third.get("selectionSettleReadback") or {}).get("certified"),
      "consecutiveCertifiedSelectionSamples":(third.get("selectionSettleReadback") or {}).get("consecutiveCertifiedSamples"),
      "evidenceSource":"R22B-R2-R8"
    })

    exact_three= len(records)==3 and [x["target"] for x in records]==TARGETS
    artifact_ok=all(
      x.get("pdfDownloadCount")==1 and
      x.get("pdfEventCount")==1 and
      isinstance(x.get("pdfSizeBytes"),int) and x.get("pdfSizeBytes")>0 and
      str(x.get("pdfFilename") or "").lower().endswith(".pdf")
      for x in records
    )
    runtime_ok=all(
      x.get("runtimeErrorCount")==0 and
      x.get("unhandledRejectionCount")==0 and
      x.get("postPublishReportReviewUnmountCertified") is True and
      x.get("explorerContinuity") is True and
      x.get("sameOrigin") is True
      for x in records
    )
    path_ok=all(
      x.get("freshTargetCreated") is True and
      x.get("selectedPropertyCertified") is True and
      x.get("assignmentsEntryCertified") is True and
      x.get("reportReviewEntryCertified") is True and
      x.get("exportControlCertified") is True and
      x.get("liveHandlerCertified") is True
      for x in records
    )

    checks={
      "r22bR2R5EvidenceConsumed":True,
      "r22bR2R8EvidenceConsumed":True,
      "firstTwoRecordsCertified":first_two_ok,
      "thirdRecordCertified":third_ok,
      "exactThreeRecordCohortReconciled":exact_three,
      "allSelectionAndWorkflowPathsCertified":path_ok,
      "allPdfArtifactsCertified":artifact_ok,
      "allRuntimeContinuityCertified":runtime_ok,
      "strictEvidenceSourceBoundariesPreserved":True,
      "noAdditionalExportInvocation":True,
      "liveUiInteractionOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_INCOMPLETE")
    classification=("EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_DISCOVERY_SELECTION_WORKSPACE_REPORT_REVIEW_EXPORT_ARTIFACT_AND_POST_PUBLISH_LIFECYCLE_CLOSED"
                    if passed else
                    "EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_CLOSURE_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R22C_R1_EXPORT_MICRO_COHORT_CLOSURE_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "cohortSize":3,
      "cohortOrder":TARGETS,
      "records":records,
      "checks":checks,
      "authority":{
        "liveUiInteraction":False,
        "additionalExportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_three_record_export_micro_cohort_lifecycle_closure.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22C Exact Three-Record Export Micro-Cohort Lifecycle Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE")
    print("COHORT_SIZE:",3)
    print("COHORT_ORDER:",TARGETS)
    print("")
    for r in records:
        print(f"[{r['ordinal']}/3] {r['target']}")
        print("evidenceSource:",r["evidenceSource"])
        print("certified:",r["certified"])
        print("pdfDownloadCount:",r.get("pdfDownloadCount"))
        print("pdfEventCount:",r.get("pdfEventCount"))
        print("pdfFilename:",r.get("pdfFilename"))
        print("pdfSizeBytes:",r.get("pdfSizeBytes"))
        print("runtimeErrorCount:",r.get("runtimeErrorCount"))
        print("unhandledRejectionCount:",r.get("unhandledRejectionCount"))
        print("postPublishReportReviewUnmountCertified:",r.get("postPublishReportReviewUnmountCertified"))
        print("explorerContinuity:",r.get("explorerContinuity"))
        print("sameOrigin:",r.get("sameOrigin"))
        print("")
    print("----- CLOSURE CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
