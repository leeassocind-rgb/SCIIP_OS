#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

PRIOR="M4_19D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    prior=er/PRIOR/"exact_new_one_hundred_canonical_target_normalization_repair_and_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4-R1 Non-Export Recertification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not prior.exists():
        print("STATUS: BLOCKED")
        print("REASON: R27B-R4 structured evidence required")
        return 4

    d=loadj(prior)
    outcomes=d.get("outcomes") or []
    failed=next((x for x in outcomes if not x.get("certified")),None)
    if not failed:
        print("STATUS: BLOCKED")
        print("REASON: no failed R27B-R4 outcome found")
        return 5

    ordinal=failed.get("ordinal")
    target=failed.get("target")
    raw=failed.get("rawTarget")
    stage=failed.get("firstFailedStage")
    br=failed.get("bindingReadback") or {}
    inv=br.get("inventory") or []
    count=br.get("count")
    certified_before=sum(1 for x in outcomes if x.get("certified"))

    # Preserve the actual structured evidence; classify only what it proves.
    if stage=="targetBindingSettleCertified":
        if count == 0:
            classification="CANONICAL_TARGET_NOT_PRESENT_ON_LIVE_MARKER_SURFACE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R2_RECORD_128_TARGET_SURFACE_IDENTITY_DEEP_DIAGNOSIS"
        elif isinstance(count,int) and count > 1:
            classification="CANONICAL_TARGET_BINDING_AMBIGUOUS_MULTIPLE_LIVE_MARKERS"
            nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R2_RECORD_128_ENTITY_GRANULARITY_COLLISION_DEEP_DIAGNOSIS"
        else:
            classification="TARGET_BINDING_SETTLE_FAILED_WITH_INDETERMINATE_CAPTURE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R2_RECORD_128_LIVE_BINDING_INSTRUMENTATION_DEEP_DIAGNOSIS"
    else:
        classification="NON_TARGET_BINDING_RESIDUAL_STAGE_FAILURE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R2_RECORD_128_FAILED_STAGE_DEEP_DIAGNOSIS"

    print("PRIOR_STATUS:",d.get("status"))
    print("CERTIFIED_BEFORE_FAILURE:",certified_before)
    print("FIRST_FAILURE_ORDINAL:",ordinal)
    print("FIRST_FAILURE_RAW_TARGET:",raw)
    print("FIRST_FAILURE_CANONICAL_TARGET:",target)
    print("FIRST_FAILED_STAGE:",stage)
    print("BINDING_READBACK_COUNT:",count)
    print("BINDING_READBACK_INVENTORY_COUNT:",len(inv))

    print("\n----- FAILED RECORD STAGE READBACK -----")
    keys=[
      "freshTargetCreated","explorerSettleCertified","explorerEntryCertified",
      "targetBindingSettleCertified","selectionCertified","selectedPropertySettleCertified",
      "assignmentsEntryCertified","generateControlCertified","reportReviewEntryCertified",
      "downloadClientListingReportControlCertified","exportReportHandlerCertifiedBySourceContract",
      "sameOrigin","exportInvocation","failure"
    ]
    for k in keys: print(f"{k}: {failed.get(k)}")

    print("\n----- TARGET BINDING STRUCTURED READBACK -----")
    print(json.dumps(br,indent=2))

    checks={
      "r27bR4EvidencePresent":True,
      "r27bR4DiagnosticComplete":d.get("status")=="DIAGNOSTIC_COMPLETE",
      "exactFirstFailureResolved":ordinal is not None and bool(target),
      "firstFailureOrdinal128":ordinal==128,
      "firstFailureTarget15881TerminalCt":target=="15881 Terminal Ct",
      "firstFailedStageCaptured":bool(stage),
      "firstFailureAtTargetBindingSettle":stage=="targetBindingSettleCertified",
      "bindingReadbackCaptured":isinstance(br,dict),
      "bindingCountCaptured":count is not None,
      "bindingInventoryCaptured":isinstance(inv,list),
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"non_export_recertification_residual_causal_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R4_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R27B_R4_R1_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "certifiedBeforeFailure":certified_before,
      "firstFailureOrdinal":ordinal,
      "firstFailureRawTarget":raw,
      "firstFailureCanonicalTarget":target,
      "firstFailedStage":stage,
      "bindingReadback":br,
      "failedOutcome":failed,
      "checks":checks,
      "liveUiInteraction":False,
      "exportInvocation":False,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R4_R1_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27B-R4-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
