#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys

R333="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_RECORD_233_SAME_ORIGIN_RECERTIFICATION_AND_RESUME_FROM_233"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p=er/R333/"record_233_same_origin_recertification_and_resume_from_233.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R3-R3-R1 Resume Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Resume retry: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("REASON: R28B-R3-R3 evidence missing"); return 4

    j=loadj(p)
    outs=j.get("outcomes") or []
    if not isinstance(j,dict) or not isinstance(outs,list) or not outs:
        print("STATUS: BLOCKED"); print("REASON: structured residual evidence missing"); return 5

    failed=next((x for x in outs if isinstance(x,dict) and not x.get("certified")),None)
    if not failed:
        print("STATUS: BLOCKED"); print("REASON: failed outcome not resolved"); return 6

    ordinal=failed.get("ordinal")
    target=failed.get("target")
    failure=failed.get("failure")
    previous=j.get("previousCertifiedCount")
    residual_cert=j.get("residualCertifiedCount")
    total=j.get("exactNewTwoHundredCertifiedCount")

    stage_order=[
      "freshTargetCreated","explorerSettleCertified","explorerEntryCertified",
      "targetBindingSettleCertified","selectionCertified","selectedPropertySettleCertified",
      "assignmentsEntryCertified","generateControlCertified","generateClicked",
      "reportReviewEntryCertified","downloadClientListingReportControlCertified",
      "exportReportHandlerCertifiedBySourceContract","sameOriginStableCertified"
    ]
    failed_stage=next((k for k in stage_order if failed.get(k) is False),None)
    fresh_ok=failed.get("freshTargetCreated") is True
    downstream_untouched=all(failed.get(k) is False for k in [
      "explorerEntryCertified","targetBindingSettleCertified","selectionCertified",
      "selectedPropertySettleCertified","assignmentsEntryCertified","generateControlCertified",
      "generateClicked","reportReviewEntryCertified","downloadClientListingReportControlCertified",
      "sameOriginStableCertified"
    ])
    export_off=failed.get("exportInvocation") is False

    if fresh_ok and failed_stage=="explorerSettleCertified" and failure=="EXPLORER_SETTLE_FAILED":
        classification="RECORD_233_FRESH_PAGE_CREATED_BUT_EXPLORER_SETTLE_NOT_CERTIFIED_BEFORE_ANY_INTERACTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS"
    else:
        classification="RECORD_233_RESIDUAL_STAGE_REQUIRES_DEEP_DIAGNOSIS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_RECORD_233_FAILED_STAGE_DEEP_DIAGNOSIS"

    checks={
      "r28bR3R3EvidencePresent":True,
      "r28bR3R3DiagnosticCompleteStateConsumed":j.get("status")=="DIAGNOSTIC_COMPLETE",
      "previousCertifiedCountExactly32":previous==32,
      "residualCertifiedCountZero":residual_cert==0,
      "exactNewTwoHundredCertifiedCountStill32":total==32,
      "structuredResidualOutcomePresent":True,
      "firstFailureOrdinal233":ordinal==233,
      "firstFailureTarget13310ValleyBlvd":target=="13310 Valley Blvd",
      "failureExplorerSettleFailed":failure=="EXPLORER_SETTLE_FAILED",
      "failedStageExplorerSettleCertified":failed_stage=="explorerSettleCertified",
      "freshPageCreated":fresh_ok,
      "downstreamWorkflowUntouched":downstream_untouched,
      "priorThirtyTwoPreserved":previous==32,
      "noReplayPerformed":True,
      "noRetryPerformed":True,
      "exportInvocationRemainedOff":export_off,
      "liveUiInteractionOff":True,
      "explorerClickOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"resume_residual_causal_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28B_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if all(checks.values()) else "FAILED",
      "state":"M419D4BN17C_R4_R12_R16A_R28B_R3_R3_R1_RESUME_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "previousCertifiedCount":previous,
      "residualCertifiedCount":residual_cert,
      "exactNewTwoHundredCertifiedCount":total,
      "firstFailureOrdinal":ordinal,
      "firstFailureTarget":target,
      "firstFailedStage":failed_stage,
      "failure":failure,
      "stageReadback":{k:failed.get(k) for k in stage_order},
      "exportInvocation":failed.get("exportInvocation"),
      "checks":checks,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("PREVIOUS_CERTIFIED_COUNT:",previous)
    print("RESIDUAL_CERTIFIED_COUNT:",residual_cert)
    print("EXACT_NEW_TWO_HUNDRED_CERTIFIED_COUNT:",total)
    print("FIRST_FAILURE_ORDINAL:",ordinal)
    print("FIRST_FAILURE_TARGET:",target)
    print("FIRST_FAILED_STAGE:",failed_stage)
    print("FAILURE:",failure)
    print("FRESH_PAGE_CREATED:",fresh_ok)
    print("DOWNSTREAM_WORKFLOW_UNTOUCHED:",downstream_untouched)
    print("EXPORT_INVOCATION:",failed.get("exportInvocation"))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",out["status"])
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR28B-R3-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if out["status"]=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
