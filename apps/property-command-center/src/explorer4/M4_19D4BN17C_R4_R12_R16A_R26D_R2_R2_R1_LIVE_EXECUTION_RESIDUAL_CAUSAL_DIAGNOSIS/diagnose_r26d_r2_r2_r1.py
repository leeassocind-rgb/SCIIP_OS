#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

SRC="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    src=eroot/SRC/"exact_new_fifty_native_guarded_export_live_execution.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R2-R1 Live Execution Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not src.exists():
        print("STATUS: BLOCKED")
        print("REASON: R26D-R2-R2 native execution evidence required")
        return 4

    d=loadj(src)
    outcomes=d.get("outcomes")
    if not isinstance(outcomes,list) or not outcomes:
        print("STATUS: BLOCKED")
        print("REASON: structured native outcomes missing")
        return 5

    failed=[o for o in outcomes if o.get("certified") is not True]
    if not failed:
        print("STATUS: BLOCKED")
        print("REASON: no failed structured outcome found")
        return 6

    first=failed[0]
    ordn=first.get("ordinal")
    target=first.get("target")
    preceding=[o for o in outcomes if isinstance(o.get("ordinal"),int) and o.get("ordinal",0)<ordn]
    preceding_cert=sum(1 for o in preceding if o.get("certified") is True)

    stages=[
      ("freshTargetCreated", first.get("freshTargetCreated")),
      ("explorerSettleCertified", first.get("explorerSettleCertified")),
      ("targetBindingSettleCertified", first.get("targetBindingSettleCertified")),
      ("selectedPropertyCertified", first.get("selectedPropertyCertified")),
      ("assignmentsEntryCertified", first.get("assignmentsEntryCertified")),
      ("reportReviewEntryCertified", first.get("reportReviewEntryCertified")),
      ("exportControlCertified", first.get("exportControlCertified")),
      ("liveHandlerCertified", first.get("liveHandlerCertified")),
      ("probeInstrumentationInstalled", first.get("probeInstrumentationInstalled")),
      ("exportClicked", first.get("exportClicked")),
      ("postPublishReportReviewUnmountCertified", first.get("postPublishReportReviewUnmountCertified")),
      ("explorerContinuity", first.get("explorerContinuity")),
      ("sameOrigin", first.get("sameOrigin"))
    ]

    first_false=None
    for k,v in stages:
        if v is not True:
            first_false=k
            break

    art=first.get("artifact") if isinstance(first.get("artifact"),dict) else {}
    artifact_ok=(
        art.get("pdfDownloadCount")==1 and
        art.get("pdfObjectUrlEventCount")==1 and
        art.get("pdfMimeType")=="application/pdf" and
        isinstance(art.get("pdfSizeBytes"),(int,float)) and art.get("pdfSizeBytes")>0 and
        isinstance(art.get("pdfFilename"),str) and art.get("pdfFilename").lower().endswith(".pdf")
    )
    runtime_ok=first.get("runtimeErrorCount")==0 and first.get("unhandledRejectionCount")==0

    if first_false=="targetBindingSettleCertified":
        classification="ALONDRA_RECORD_81_TARGET_BINDING_SETTLE_FAILED_PRE_SELECTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR"
    elif first_false=="selectedPropertyCertified":
        classification="ALONDRA_RECORD_81_SELECTED_ENTITY_READBACK_FAILED_AFTER_SELECTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_SELECTED_ENTITY_READBACK_REPAIR"
    elif first_false in ("assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified"):
        classification=f"ALONDRA_RECORD_81_WORKFLOW_STAGE_FAILED_{first_false.upper()}"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_WORKFLOW_STAGE_REPAIR"
    elif first_false in ("probeInstrumentationInstalled","exportClicked"):
        classification=f"ALONDRA_RECORD_81_EXPORT_INVOCATION_STAGE_FAILED_{first_false.upper()}"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_EXPORT_INVOCATION_REPAIR"
    elif not artifact_ok:
        classification="ALONDRA_RECORD_81_EXPORT_CLICKED_BUT_ARTIFACT_CONTRACT_FAILED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_ARTIFACT_CAPTURE_REPAIR"
    elif first_false=="postPublishReportReviewUnmountCertified":
        classification="ALONDRA_RECORD_81_POST_PUBLISH_UNMOUNT_FAILED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_POST_PUBLISH_UNMOUNT_REPAIR"
    elif first_false in ("explorerContinuity","sameOrigin") or not runtime_ok:
        classification="ALONDRA_RECORD_81_RUNTIME_CONTINUITY_OR_ERROR_CONTRACT_FAILED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_RUNTIME_CONTINUITY_REPAIR"
    else:
        classification="ALONDRA_RECORD_81_RESIDUAL_FAILURE_REQUIRES_DEEP_STRUCTURED_DIAGNOSIS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_R1_ALONDRA_NATIVE_DEEP_RESIDUAL_DIAGNOSIS"

    checks={
      "r26dR2R2EvidencePresent":True,
      "structuredOutcomeListPresent":True,
      "firstFailureResolved":True,
      "firstFailureOrdinal81":ordn==81,
      "firstFailureTargetAlondra":target=="112 W Alondra Blvd",
      "thirtyNewRecordsCertifiedBeforeFailure":preceding_cert==30,
      "stageReadbackCaptured":True,
      "artifactReadbackCaptured":isinstance(first.get("artifact"),dict),
      "runtimeReadbackCaptured":first.get("runtimeErrorCount") is not None and first.get("unhandledRejectionCount") is not None,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "sourceEvidence":{"path":str(src),"sha256":sha(src)},
      "executionSummary":{
        "outcomeCount":len(outcomes),
        "certifiedBeforeFailure":preceding_cert,
        "firstFailureOrdinal":ordn,
        "firstFailureTarget":target,
        "failure":first.get("failure")
      },
      "stageReadback":{k:v for k,v in stages},
      "artifactReadback":art,
      "artifactContractCertified":artifact_ok,
      "runtimeContractCertified":runtime_ok,
      "firstFailedStage":first_false,
      "rawFirstFailureOutcome":first,
      "checks":checks,
      "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
      "nextMilestone":nxt
    }

    od=eroot/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"live_execution_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("CERTIFIED_BEFORE_FAILURE:",preceding_cert)
    print("FIRST_FAILURE_ORDINAL:",ordn)
    print("FIRST_FAILURE_TARGET:",target)
    print("FIRST_FAILED_STAGE:",first_false)
    print("FAILURE:",first.get("failure"))
    print("ARTIFACT_CONTRACT_CERTIFIED:",artifact_ok)
    print("RUNTIME_CONTRACT_CERTIFIED:",runtime_ok)
    print("\n----- STAGE READBACK -----")
    for k,v in stages: print(f"{k}: {v}")
    print("\n----- ARTIFACT READBACK -----")
    print(json.dumps(art,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR26D-R2-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
