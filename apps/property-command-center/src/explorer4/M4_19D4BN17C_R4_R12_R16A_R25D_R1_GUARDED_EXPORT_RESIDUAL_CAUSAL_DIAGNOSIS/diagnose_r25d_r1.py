#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

R25D="M4_19D4BN17C_R4_R12_R16A_R25D_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION"
R25D_STATE="M419D4BN17C_R4_R12_R16A_R25D_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_INCOMPLETE"
M="M4_19D4BN17C_R4_R12_R16A_R25D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R25D/"exact_fifty_record_guarded_export_execution.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25D-R1 Guarded Export Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("R25D retry: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25D_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="DIAGNOSTIC_COMPLETE" or d.get("state")!=R25D_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25D_INCOMPLETE_STATE_REQUIRED");return 5

    outcomes=d.get("outcomes") or []
    if len(outcomes)<3:
        print("STATUS: BLOCKED");print("DIAGNOSIS: THREE_EXECUTED_OUTCOMES_REQUIRED");return 6

    first_two=outcomes[:2]
    third=outcomes[2]
    target=third.get("target")
    first_two_certified=all(x.get("certified") is True for x in first_two)
    third_failed=third.get("certified") is False
    explorer_settle=third.get("explorerSettleCertified")
    target_settle=third.get("targetBindingSettleCertified")
    selection=third.get("selectedPropertyCertified")
    export_clicked=third.get("exportClicked")

    if first_two_certified and third_failed and explorer_settle is False:
        classification="THIRD_RECORD_FRESH_PAGE_CREATED_BUT_EXPLORER_CONTROL_DID_NOT_SETTLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
    elif first_two_certified and third_failed and explorer_settle is True and target_settle is False:
        classification="THIRD_RECORD_EXPLORER_SETTLED_TARGET_BINDING_DID_NOT_SETTLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_TARGET_BINDING_TIMING_DIAGNOSIS"
    else:
        classification="THIRD_RECORD_FAILURE_STAGE_REQUIRES_DEEPER_STAGE_DIAGNOSIS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_DEEP_STAGE_DIAGNOSIS"

    checks={
      "r25dIncompleteStateConsumed":True,
      "firstTwoRecordsCertified":first_two_certified,
      "thirdRecordOutcomeResolved":third_failed,
      "thirdRecordTargetResolved":bool(target),
      "freshPageCreationReadbackCaptured":"freshTargetCreated" in third,
      "explorerSettleReadbackCaptured":"explorerSettleCertified" in third,
      "targetBindingSettleReadbackCaptured":"targetBindingSettleCertified" in third,
      "selectionReadbackCaptured":"selectedPropertyCertified" in third,
      "exportClickReadbackCaptured":"exportClicked" in third,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    state="M419D4BN17C_R4_R12_R16A_R25D_R1_GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED"
    out={
      "framework":"SCIIP_EXPLORER_4_R25D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":state,
      "classification":classification,
      "firstTwoCertified":first_two_certified,
      "thirdTarget":target,
      "thirdOutcome":third,
      "checks":checks,
      "authority":{
        "liveUiInteraction":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "sourceEvidence":{"r25dPath":str(p),"r25dSha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"guarded_export_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("FIRST_TWO_CERTIFIED:",first_two_certified)
    print("THIRD_TARGET:",target)
    print("THIRD_FRESH_PAGE_CREATED:",third.get("freshTargetCreated"))
    print("THIRD_EXPLORER_SETTLE_CERTIFIED:",explorer_settle)
    print("THIRD_TARGET_BINDING_SETTLE_CERTIFIED:",target_settle)
    print("THIRD_SELECTED_PROPERTY_CERTIFIED:",selection)
    print("THIRD_EXPORT_CLICKED:",export_clicked)
    print("THIRD_FAILURE:",third.get("failure"))
    print()
    print("----- THIRD OUTCOME -----")
    print(json.dumps(third,indent=2,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
