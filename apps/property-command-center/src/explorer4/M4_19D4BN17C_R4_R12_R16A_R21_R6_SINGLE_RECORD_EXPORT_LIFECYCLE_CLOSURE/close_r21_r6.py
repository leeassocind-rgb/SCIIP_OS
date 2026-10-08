#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSURE"
R3="M4_19D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN"
R4="M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"
R5="M4_19D4BN17C_R4_R12_R16A_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p3=evid/R3/"export_control_non_invocative_event_binding_and_post_click_guard_design.json"
    p4=evid/R4/"single_record_guarded_export_invocation_certification.json"
    p5=evid/R5/"export_artifact_and_post_action_state_verification.json"

    missing=[str(p) for p in (p3,p4,p5) if not p.exists()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EXPORT_LIFECYCLE_EVIDENCE_MISSING")
        for x in missing: print("MISSING:",x)
        return 4

    r3=loadj(p3); r4=loadj(p4); r5=loadj(p5)

    artifact=(r5.get("artifact") or {})
    post=(r5.get("postAction") or {})
    r4checks=r4.get("checks") or {}
    r5checks=r5.get("checks") or {}

    checks={
        "r21R3Passed":r3.get("status")=="PASSED",
        "r21R3StateCertified":r3.get("state")=="M419D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_EVENT_BINDING_AND_GUARD_DESIGN_CERTIFIED",
        "r21R4Passed":r4.get("status")=="PASSED",
        "r21R4StateCertified":r4.get("state")=="M419D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED",
        "r21R5Passed":r5.get("status")=="PASSED",
        "r21R5StateVerified":r5.get("state")=="M419D4BN17C_R4_R12_R16A_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFIED",
        "exactSourceLiveBindingCertified":r3.get("classification")=="EXACT_EXPORT_CONTROL_SOURCE_AND_LIVE_EVENT_BINDING_RESOLVED_GUARDED_INVOCATION_DESIGN_CERTIFIED",
        "singleGuardedExportCertified":r4.get("classification")=="SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED",
        "artifactVerificationCertified":r5.get("classification")=="EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFIED_SINGLE_RECORD_LIFECYCLE_READY_FOR_CLOSURE",
        "exactOnePdfDownloadObserved":r5checks.get("exactOnePdfDownloadObserved") is True,
        "exactOnePdfObjectUrlObserved":r5checks.get("exactOnePdfObjectUrlObserved") is True,
        "pdfMimeTypeCertified":r5checks.get("pdfMimeTypeCertified") is True,
        "pdfSizePositive":r5checks.get("pdfSizePositive") is True,
        "filenameContractCertified":r5checks.get("filenameContractCertified") is True,
        "blobDownloadHrefObserved":r5checks.get("blobDownloadHrefObserved") is True,
        "noRuntimeErrorsObserved":r5checks.get("noRuntimeErrorsObserved") is True,
        "reportReviewContinuityPreserved":r5checks.get("reportReviewContinuityPreserved") is True,
        "sameOriginPreserved":r5checks.get("sameOriginPreserved") is True,
        "singleExactExportClickOnly":r4checks.get("singleExactExportClickOnly") is True,
        "additionalExportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True,
        "liveUiInteractionOff":True
    }

    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSED"
        cls="SINGLE_RECORD_EXPORT_DISCOVERY_MATERIALIZATION_BINDING_INVOCATION_ARTIFACT_VERIFICATION_LIFECYCLE_CLOSED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R16A_R21_R6_EXPORT_LIFECYCLE_CLOSURE_INCOMPLETE"
        cls="SINGLE_RECORD_EXPORT_LIFECYCLE_EVIDENCE_RECONCILIATION_INCOMPLETE"
        nxt=None

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"single_record_export_lifecycle_closure.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSURE",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":state,
        "classification":cls,
        "closedLifecycle":{
            "binding":{
                "status":r3.get("status"),
                "classification":r3.get("classification"),
                "sourceBindingResolved":r3.get("sourceBindingResolved"),
                "liveHandlerBound":r3.get("liveHandlerBound")
            },
            "invocation":{
                "status":r4.get("status"),
                "classification":r4.get("classification"),
                "outputSignalObserved":r4.get("outputSignalObserved")
            },
            "artifact":{
                "status":r5.get("status"),
                "classification":r5.get("classification"),
                "filename":artifact.get("filename"),
                "mimeType":artifact.get("mimeType"),
                "sizeBytes":artifact.get("sizeBytes"),
                "blobHrefObserved":bool(artifact.get("blobHref"))
            },
            "postAction":{
                "reportReviewVisible":post.get("reportReviewVisible"),
                "explorerMounted":post.get("explorerMounted"),
                "sameOrigin":post.get("sameOrigin"),
                "runtimeErrorCount":len(post.get("runtimeErrors") or []),
                "unhandledRejectionCount":len(post.get("unhandledRejections") or [])
            }
        },
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "liveUiInteraction":False,
            "additionalExportInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R6 Single-Record Export Lifecycle Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE")
    print("R21_R3_STATUS:",r3.get("status"))
    print("R21_R4_STATUS:",r4.get("status"))
    print("R21_R5_STATUS:",r5.get("status"))
    print("EXPORT_FILENAME:",artifact.get("filename"))
    print("EXPORT_MIME_TYPE:",artifact.get("mimeType"))
    print("EXPORT_SIZE_BYTES:",artifact.get("sizeBytes"))
    print("REPORT_REVIEW_CONTINUITY:",post.get("reportReviewVisible"))
    print("EXPLORER_CONTINUITY:",post.get("explorerMounted"))
    print("SAME_ORIGIN:",post.get("sameOrigin"))
    print("CLASSIFICATION:",cls)

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
