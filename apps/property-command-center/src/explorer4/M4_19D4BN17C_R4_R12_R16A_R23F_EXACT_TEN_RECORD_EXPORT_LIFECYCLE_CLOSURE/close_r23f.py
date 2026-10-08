#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R23D="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXTENDED_BOUNDED_TARGET_BINDING_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
R23D_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED"
R23E="M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
R23E_STATE="M419D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p23d=evid/R23D/"extended_bounded_target_binding_settle_and_ten_record_export_recertification.json"
    p23e=evid/R23E/"exact_ten_record_export_artifact_and_runtime_verification.json"

    print("="*112)
    print("SCIIP Explorer 4.0 — R23F Exact Ten-Record Export Lifecycle Closure")
    print("="*112)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Export retry: OFF")

    if not p23d.exists() or not p23e.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23D_R3_R3_R3_AND_R23E_EVIDENCE_REQUIRED")
        return 4

    d=loadj(p23d)
    e=loadj(p23e)

    d_ok=(
        d.get("status")=="PASSED" and
        d.get("state")==R23D_STATE and
        d.get("classification")=="EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_FIVE_SECOND_TARGET_BINDING_SETTLE" and
        (d.get("checks") or {}).get("allTenExportsCertified") is True
    )
    e_ok=(
        e.get("status")=="PASSED" and
        e.get("state")==R23E_STATE and
        e.get("classification")=="EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED" and
        (e.get("checks") or {}).get("allTenArtifactAndRuntimeVerificationsCertified") is True
    )

    cohort_d=d.get("cohort") or []
    cohort_e=e.get("cohort") or []
    rows=e.get("recordVerifications") or []

    cohort_exact_ten=len(cohort_d)==10 and len(cohort_e)==10 and len(rows)==10
    cohort_order_match=cohort_d==cohort_e==[r.get("target") for r in rows]
    unique_targets=len(set(cohort_d))==10

    artifact_all=all([
        r.get("artifactAndRuntimeCertified") is True and
        r.get("pdfFilenameCertified") is True and
        r.get("pdfMimeTypeCertified") is True and
        r.get("pdfPositiveSizeCertified") is True and
        r.get("runtimeErrorsZero") is True and
        r.get("unhandledRejectionsZero") is True and
        r.get("postPublishReportReviewUnmountCertified") is True and
        r.get("explorerContinuityCertified") is True and
        r.get("sameOriginCertified") is True
        for r in rows
    ]) if len(rows)==10 else False

    execution_all=all([
        o.get("certified") is True and
        (o.get("explorerSettleReadback") or {}).get("certified") is True and
        (o.get("targetBindingSettleReadback") or {}).get("certified") is True and
        o.get("selectedPropertyCertified") is True and
        o.get("assignmentsEntryCertified") is True and
        o.get("reportReviewEntryCertified") is True and
        o.get("exportControlCertified") is True and
        o.get("liveHandlerCertified") is True
        for o in (d.get("outcomes") or [])
    ]) if len(d.get("outcomes") or [])==10 else False

    checks={
        "r23dR3R3R3Passed":d_ok,
        "r23ePassed":e_ok,
        "exactTenCohortReconciled":cohort_exact_ten,
        "exactTenCohortOrderPreserved":cohort_order_match,
        "exactTenUniqueTargetsPreserved":unique_targets,
        "allExecutionPathsCertified":execution_all,
        "allArtifactAndRuntimeEvidenceCertified":artifact_all,
        "fiveSecondTargetBindingGuardPreserved":(d.get("entryPolicy") or {}).get("targetBindingMaximumSettleSeconds")==5.0,
        "threeConsecutiveTargetBindingSamplesPreserved":(d.get("entryPolicy") or {}).get("targetBindingConsecutiveCertifiedSamples")==3,
        "threeConsecutiveExplorerSamplesPreserved":(d.get("entryPolicy") or {}).get("explorerConsecutiveCertifiedSamples")==3,
        "exactThenUniqueContainsBindingPreserved":(d.get("selectionBindingPolicy") or {}).get("exactMatchPreferred") is True and (d.get("selectionBindingPolicy") or {}).get("uniqueContainsFallbackAllowed") is True,
        "ambiguousContainsBindingForbidden":(d.get("selectionBindingPolicy") or {}).get("ambiguousContainsMatchAllowed") is False,
        "singleExportMaximumPerRecordPreserved":(d.get("authority") or {}).get("maximumExportClicksPerRecord")==1,
        "allTenPdfArtifactsCertified":artifact_all,
        "allTenRuntimeContinuityCertified":artifact_all,
        "noAdditionalExportInvocation":True,
        "noRetryPerformed":True,
        "liveUiInteractionOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True,
    }

    passed=all(checks.values())

    state=("M419D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_INCOMPLETE")
    classification=("EXACT_TEN_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED"
                    if passed else
                    "EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23F_R1_EXPORT_LIFECYCLE_CLOSURE_RESIDUAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "sourceEvidence":{
            "r23d":{
                "path":str(p23d),
                "sha256":hashlib.sha256(p23d.read_bytes()).hexdigest()
            },
            "r23e":{
                "path":str(p23e),
                "sha256":hashlib.sha256(p23e.read_bytes()).hexdigest()
            }
        },
        "cohort":cohort_d,
        "closureSummary":{
            "cohortSize":len(cohort_d),
            "executionCertifiedCount":sum(1 for o in (d.get("outcomes") or []) if o.get("certified") is True),
            "artifactRuntimeCertifiedCount":sum(1 for r in rows if r.get("artifactAndRuntimeCertified") is True),
            "runtimeErrorTotal":sum((r.get("runtimeErrorCount") or 0) for r in rows),
            "unhandledRejectionTotal":sum((r.get("unhandledRejectionCount") or 0) for r in rows),
            "targetBindingMaximumSettleSeconds":(d.get("entryPolicy") or {}).get("targetBindingMaximumSettleSeconds"),
            "targetBindingConsecutiveCertifiedSamples":(d.get("entryPolicy") or {}).get("targetBindingConsecutiveCertifiedSamples"),
            "explorerConsecutiveCertifiedSamples":(d.get("entryPolicy") or {}).get("explorerConsecutiveCertifiedSamples"),
            "maximumExportClicksPerRecord":(d.get("authority") or {}).get("maximumExportClicksPerRecord")
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
    ef=od/"exact_ten_record_export_lifecycle_closure.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("COHORT_SIZE:",len(cohort_d))
    print("EXECUTION_CERTIFIED_COUNT:",out["closureSummary"]["executionCertifiedCount"])
    print("ARTIFACT_RUNTIME_CERTIFIED_COUNT:",out["closureSummary"]["artifactRuntimeCertifiedCount"])
    print("RUNTIME_ERROR_TOTAL:",out["closureSummary"]["runtimeErrorTotal"])
    print("UNHANDLED_REJECTION_TOTAL:",out["closureSummary"]["unhandledRejectionTotal"])
    print("TARGET_BINDING_MAXIMUM_SETTLE_SECONDS:",out["closureSummary"]["targetBindingMaximumSettleSeconds"])
    print("TARGET_BINDING_CONSECUTIVE_CERTIFIED_SAMPLES:",out["closureSummary"]["targetBindingConsecutiveCertifiedSamples"])
    print("EXPLORER_CONSECUTIVE_CERTIFIED_SAMPLES:",out["closureSummary"]["explorerConsecutiveCertifiedSamples"])
    print("MAXIMUM_EXPORT_CLICKS_PER_RECORD:",out["closureSummary"]["maximumExportClicksPerRecord"])

    print()
    print("----- COHORT -----")
    for i,t in enumerate(cohort_d,1):
        print(f"{i}. {t}")

    print()
    print("----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
