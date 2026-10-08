#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

PREV="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXTENDED_BOUNDED_TARGET_BINDING_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
PREV_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    src=evid/PREV/"extended_bounded_target_binding_settle_and_ten_record_export_recertification.json"

    print("="*112)
    print("SCIIP Explorer 4.0 — R23E Exact Ten-Record Export Artifact + Runtime Verification")
    print("="*112)
    print("Mode: READ_ONLY_EVIDENCE_VERIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Export retry: OFF")

    if not src.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23D_R3_R3_R3_EVIDENCE_REQUIRED")
        return 4

    d=loadj(src)
    outcomes=d.get("outcomes") or []
    cohort=d.get("cohort") or []
    checks0=d.get("checks") or {}

    predecessor_ok=(
        d.get("status")=="PASSED" and
        d.get("state")==PREV_STATE and
        d.get("classification")=="EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_FIVE_SECOND_TARGET_BINDING_SETTLE" and
        checks0.get("allTenExportsCertified") is True
    )
    exact_ten=len(cohort)==10 and len(outcomes)==10
    unique_targets=len(set(cohort))==10 and [x.get("target") for x in outcomes]==cohort

    rows=[]
    for i,o in enumerate(outcomes,1):
        a=o.get("artifact") or {}
        row={
            "ordinal":i,
            "target":o.get("target"),
            "recordCertified":o.get("certified") is True,
            "freshPageCertified":o.get("freshTargetCreated") is True,
            "explorerSettleCertified":(o.get("explorerSettleReadback") or {}).get("certified") is True,
            "targetBindingSettleCertified":(o.get("targetBindingSettleReadback") or {}).get("certified") is True,
            "selectionCertified":o.get("selectedPropertyCertified") is True,
            "assignmentsCertified":o.get("assignmentsEntryCertified") is True,
            "reportReviewCertified":o.get("reportReviewEntryCertified") is True,
            "exportControlCertified":o.get("exportControlCertified") is True,
            "liveHandlerCertified":o.get("liveHandlerCertified") is True,
            "exportClickedExactlyOnce":a.get("pdfDownloadCount")==1,
            "pdfEventExactlyOnce":a.get("pdfEventCount")==1,
            "pdfFilename":a.get("filename"),
            "pdfFilenameCertified":str(a.get("filename") or "").lower().endswith(".pdf"),
            "pdfMimeType":a.get("mimeType"),
            "pdfMimeTypeCertified":a.get("mimeType")=="application/pdf",
            "pdfSizeBytes":a.get("sizeBytes"),
            "pdfPositiveSizeCertified":isinstance(a.get("sizeBytes"),int) and a.get("sizeBytes")>0,
            "runtimeErrorCount":o.get("runtimeErrorCount"),
            "runtimeErrorsZero":o.get("runtimeErrorCount")==0,
            "unhandledRejectionCount":o.get("unhandledRejectionCount"),
            "unhandledRejectionsZero":o.get("unhandledRejectionCount")==0,
            "postPublishReportReviewUnmountCertified":o.get("postPublishReportReviewUnmountCertified") is True,
            "explorerContinuityCertified":o.get("explorerContinuity") is True,
            "sameOriginCertified":o.get("sameOrigin") is True,
        }
        row["artifactAndRuntimeCertified"]=all([
            row["recordCertified"],row["freshPageCertified"],row["explorerSettleCertified"],
            row["targetBindingSettleCertified"],row["selectionCertified"],row["assignmentsCertified"],
            row["reportReviewCertified"],row["exportControlCertified"],row["liveHandlerCertified"],
            row["exportClickedExactlyOnce"],row["pdfEventExactlyOnce"],row["pdfFilenameCertified"],
            row["pdfMimeTypeCertified"],row["pdfPositiveSizeCertified"],row["runtimeErrorsZero"],
            row["unhandledRejectionsZero"],row["postPublishReportReviewUnmountCertified"],
            row["explorerContinuityCertified"],row["sameOriginCertified"]
        ])
        rows.append(row)

    all_rows=exact_ten and all(r["artifactAndRuntimeCertified"] for r in rows)
    filenames=[r["pdfFilename"] for r in rows]
    sizes=[r["pdfSizeBytes"] for r in rows]

    checks={
        "r23dR3R3R3Passed":predecessor_ok,
        "exactTenCohortConsumed":exact_ten,
        "exactTenUniqueTargetsVerified":unique_targets,
        "allTenRecordCertificationsVerified":len(rows)==10 and all(r["recordCertified"] for r in rows),
        "allTenFreshPagesVerified":len(rows)==10 and all(r["freshPageCertified"] for r in rows),
        "allTenExplorerSettlesVerified":len(rows)==10 and all(r["explorerSettleCertified"] for r in rows),
        "allTenTargetBindingSettlesVerified":len(rows)==10 and all(r["targetBindingSettleCertified"] for r in rows),
        "allTenSelectionsVerified":len(rows)==10 and all(r["selectionCertified"] for r in rows),
        "allTenAssignmentsVerified":len(rows)==10 and all(r["assignmentsCertified"] for r in rows),
        "allTenReportReviewsVerified":len(rows)==10 and all(r["reportReviewCertified"] for r in rows),
        "allTenExportControlsVerified":len(rows)==10 and all(r["exportControlCertified"] for r in rows),
        "allTenLiveHandlersVerified":len(rows)==10 and all(r["liveHandlerCertified"] for r in rows),
        "allTenSinglePdfDownloadsVerified":len(rows)==10 and all(r["exportClickedExactlyOnce"] for r in rows),
        "allTenSinglePdfEventsVerified":len(rows)==10 and all(r["pdfEventExactlyOnce"] for r in rows),
        "allTenPdfFilenamesVerified":len(rows)==10 and all(r["pdfFilenameCertified"] for r in rows),
        "allTenPdfMimeTypesVerified":len(rows)==10 and all(r["pdfMimeTypeCertified"] for r in rows),
        "allTenPositivePdfSizesVerified":len(rows)==10 and all(r["pdfPositiveSizeCertified"] for r in rows),
        "allTenRuntimeErrorCountsZero":len(rows)==10 and all(r["runtimeErrorsZero"] for r in rows),
        "allTenUnhandledRejectionCountsZero":len(rows)==10 and all(r["unhandledRejectionsZero"] for r in rows),
        "allTenPostPublishUnmountsVerified":len(rows)==10 and all(r["postPublishReportReviewUnmountCertified"] for r in rows),
        "allTenExplorerContinuityVerified":len(rows)==10 and all(r["explorerContinuityCertified"] for r in rows),
        "allTenSameOriginVerified":len(rows)==10 and all(r["sameOriginCertified"] for r in rows),
        "allTenArtifactAndRuntimeVerificationsCertified":all_rows,
        "noRetryPerformed":True,
        "liveUiInteractionOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True,
    }

    passed=predecessor_ok and unique_targets and all_rows
    state=("M419D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_INCOMPLETE")
    classification=("EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED"
                    if passed else
                    "EXACT_TEN_RECORD_EXPORT_ARTIFACT_OR_RUNTIME_EVIDENCE_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23E_R1_EXPORT_ARTIFACT_AND_RUNTIME_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "sourceEvidence":str(src),
        "sourceEvidenceSha256":hashlib.sha256(src.read_bytes()).hexdigest(),
        "cohort":cohort,
        "recordVerifications":rows,
        "aggregate":{
            "recordCount":len(rows),
            "certifiedCount":sum(1 for r in rows if r["artifactAndRuntimeCertified"]),
            "pdfFilenames":filenames,
            "pdfSizeBytes":sizes,
            "runtimeErrorTotal":sum((r["runtimeErrorCount"] or 0) for r in rows),
            "unhandledRejectionTotal":sum((r["unhandledRejectionCount"] or 0) for r in rows)
        },
        "checks":checks,
        "authority":{
            "liveUiInteraction":False,
            "exportInvocation":False,
            "retry":False,
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False
        },
        "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_ten_record_export_artifact_and_runtime_verification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("----- RECORD VERIFICATION -----")
    for r in rows:
        print(f"[{r['ordinal']}/10] {r['target']}")
        print("artifactAndRuntimeCertified:",r["artifactAndRuntimeCertified"])
        print("pdfFilename:",r["pdfFilename"])
        print("pdfMimeType:",r["pdfMimeType"])
        print("pdfSizeBytes:",r["pdfSizeBytes"])
        print("runtimeErrorCount:",r["runtimeErrorCount"])
        print("unhandledRejectionCount:",r["unhandledRejectionCount"])
        print("postPublishReportReviewUnmountCertified:",r["postPublishReportReviewUnmountCertified"])
        print("explorerContinuityCertified:",r["explorerContinuityCertified"])
        print("sameOriginCertified:",r["sameOriginCertified"])
        print()

    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
