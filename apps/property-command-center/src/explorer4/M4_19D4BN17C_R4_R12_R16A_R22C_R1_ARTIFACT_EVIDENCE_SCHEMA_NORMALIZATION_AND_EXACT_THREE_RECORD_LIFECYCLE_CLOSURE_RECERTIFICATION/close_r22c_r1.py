#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R22C_R1_ARTIFACT_EVIDENCE_SCHEMA_NORMALIZATION_AND_EXACT_THREE_RECORD_LIFECYCLE_CLOSURE_RECERTIFICATION"
R5="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"
R8="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
R22C="M4_19D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE"
TARGETS=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def coalesce(*xs):
    for x in xs:
        if x is not None:
            return x
    return None

def normalize_record(x,target,source):
    a=x.get("artifact") or {}
    # Support both R22B flat schema and later nested artifact schema.
    return {
      "target":target,
      "certified":x.get("certified"),
      "freshTargetCreated":x.get("freshTargetCreated"),
      "selectedPropertyCertified":x.get("selectedPropertyCertified"),
      "assignmentsEntryCertified":x.get("assignmentsEntryCertified"),
      "reportReviewEntryCertified":x.get("reportReviewEntryCertified"),
      "exportControlCertified":x.get("exportControlCertified"),
      "liveHandlerCertified":x.get("liveHandlerCertified"),
      "pdfDownloadCount":coalesce(x.get("pdfDownloadCount"),a.get("pdfDownloadCount")),
      "pdfEventCount":coalesce(x.get("pdfEventCount"),a.get("pdfEventCount")),
      "pdfFilename":coalesce(x.get("pdfFilename"),a.get("filename"),a.get("pdfFilename")),
      "pdfSizeBytes":coalesce(x.get("pdfSizeBytes"),a.get("sizeBytes"),a.get("pdfSizeBytes")),
      "runtimeErrorCount":x.get("runtimeErrorCount"),
      "unhandledRejectionCount":x.get("unhandledRejectionCount"),
      "postPublishReportReviewUnmountCertified":x.get("postPublishReportReviewUnmountCertified"),
      "explorerContinuity":x.get("explorerContinuity"),
      "sameOrigin":x.get("sameOrigin"),
      "evidenceSource":source,
      "artifactSchema":"nested" if a else "flat"
    }

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p5=evid/R5/"exact_three_record_guarded_export_micro_cohort_execution.json"
    p8=evid/R8/"bounded_selection_settle_readback_and_third_record_export_recertification.json"
    pc=evid/R22C/"exact_three_record_export_micro_cohort_lifecycle_closure.json"

    for p,label in [(p5,"R22B_R2_R5"),(p8,"R22B_R2_R8"),(pc,"R22C")]:
        if not p.exists():
            print("STATUS: BLOCKED")
            print("DIAGNOSIS:",f"{label}_EVIDENCE_REQUIRED")
            return 4

    r5=loadj(p5); r8=loadj(p8); prior=loadj(pc)

    if prior.get("state")!="M419D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_INCOMPLETE":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: PRIOR_R22C_INCOMPLETE_STATE_REQUIRED"); return 5
    if (prior.get("checks") or {}).get("allPdfArtifactsCertified") is not False:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: PRIOR_R22C_ARTIFACT_ONLY_GAP_REQUIRED"); return 6

    outs=r5.get("outcomes") or []
    if len(outs)<3:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R22B_OUTCOME_SCHEMA_INCOMPLETE"); return 7

    rec1=normalize_record(outs[0],TARGETS[0],"R22B-R2-R5")
    rec2=normalize_record(outs[1],TARGETS[1],"R22B-R2-R5")
    rec3=normalize_record(r8.get("outcome") or {},TARGETS[2],"R22B-R2-R8")
    records=[rec1,rec2,rec3]

    artifact_schema_resolved=all(
      x.get("pdfDownloadCount") is not None and
      x.get("pdfEventCount") is not None and
      x.get("pdfFilename") is not None and
      x.get("pdfSizeBytes") is not None
      for x in records
    )

    artifact_ok=all(
      x.get("pdfDownloadCount")==1 and
      x.get("pdfEventCount")==1 and
      isinstance(x.get("pdfSizeBytes"),int) and x.get("pdfSizeBytes")>0 and
      str(x.get("pdfFilename") or "").lower().endswith(".pdf")
      for x in records
    )

    path_ok=all(
      x.get("certified") is True and
      x.get("freshTargetCreated") is True and
      x.get("selectedPropertyCertified") is True and
      x.get("assignmentsEntryCertified") is True and
      x.get("reportReviewEntryCertified") is True and
      x.get("exportControlCertified") is True and
      x.get("liveHandlerCertified") is True
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

    exact_three=[x["target"] for x in records]==TARGETS

    checks={
      "priorR22CIncompleteArtifactGapConsumed":True,
      "r22bR2R5EvidenceConsumed":True,
      "r22bR2R8EvidenceConsumed":True,
      "flatAndNestedArtifactSchemaSupported":True,
      "artifactEvidenceSchemaResolved":artifact_schema_resolved,
      "exactThreeRecordCohortReconciled":exact_three,
      "allSelectionAndWorkflowPathsCertified":path_ok,
      "allPdfArtifactsCertified":artifact_ok,
      "allRuntimeContinuityCertified":runtime_ok,
      "noAdditionalExportInvocation":True,
      "liveUiInteractionOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R22C_R1_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R22C_R1_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_INCOMPLETE")
    classification=("EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_ARTIFACT_SCHEMA_NORMALIZED_AND_LIFECYCLE_CLOSED"
                    if passed else
                    "EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_ARTIFACT_SCHEMA_NORMALIZATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R22C_R2_EXPORT_ARTIFACT_EVIDENCE_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R22C_R1_ARTIFACT_EVIDENCE_SCHEMA_NORMALIZATION_AND_LIFECYCLE_CLOSURE_RECERTIFICATION",
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

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"artifact_evidence_schema_normalization_and_lifecycle_closure_recertification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22C-R1 Artifact Evidence Schema Normalization + Lifecycle Closure Recertification")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_SCHEMA_NORMALIZATION_AND_CLOSURE")
    print("COHORT_SIZE:",3)
    print("COHORT_ORDER:",TARGETS)
    print()
    for i,r in enumerate(records,1):
        print(f"[{i}/3] {r['target']}")
        print("evidenceSource:",r["evidenceSource"])
        print("artifactSchema:",r["artifactSchema"])
        print("certified:",r["certified"])
        print("pdfDownloadCount:",r["pdfDownloadCount"])
        print("pdfEventCount:",r["pdfEventCount"])
        print("pdfFilename:",r["pdfFilename"])
        print("pdfSizeBytes:",r["pdfSizeBytes"])
        print("runtimeErrorCount:",r["runtimeErrorCount"])
        print("unhandledRejectionCount:",r["unhandledRejectionCount"])
        print("postPublishReportReviewUnmountCertified:",r["postPublishReportReviewUnmountCertified"])
        print("explorerContinuity:",r["explorerContinuity"])
        print("sameOrigin:",r["sameOrigin"])
        print()
    print("----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
