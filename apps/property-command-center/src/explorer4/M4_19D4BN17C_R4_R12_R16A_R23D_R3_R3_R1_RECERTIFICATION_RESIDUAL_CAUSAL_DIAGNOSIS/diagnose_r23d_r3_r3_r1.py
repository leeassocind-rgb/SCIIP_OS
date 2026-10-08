#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_BOUNDED_EXPLORER_ENTRY_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
R_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFICATION_INCOMPLETE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R/"bounded_explorer_entry_settle_and_ten_record_export_recertification.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R3_R3_EVIDENCE_REQUIRED"); return 4

    r=loadj(p)
    if r.get("state")!=R_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R3_R3_INCOMPLETE_STATE_REQUIRED"); return 5

    outcomes=r.get("outcomes") or []
    if len(outcomes)<2:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: SECOND_RECORD_OUTCOME_REQUIRED"); return 6

    first=outcomes[0]
    second=outcomes[1]
    target=second.get("target")
    explorer_settle=second.get("explorerSettleReadback") or {}
    target_settle=second.get("targetBindingSettleReadback") or {}
    samples=target_settle.get("samples") or []

    exact_counts=[s.get("exactCount") for s in samples]
    contains_counts=[s.get("containsCount") for s in samples]
    valid_flags=[bool(s.get("certified")) for s in samples]

    max_exact=max([x for x in exact_counts if isinstance(x,int)] or [0])
    max_contains=max([x for x in contains_counts if isinstance(x,int)] or [0])
    ever_exact_unique=any(x==1 for x in exact_counts)
    ever_contains_unique=any((e==0 and c==1) for e,c in zip(exact_counts,contains_counts) if isinstance(e,int) and isinstance(c,int))
    ever_valid=any(valid_flags)
    valid_count=sum(1 for x in valid_flags if x)
    max_consecutive=0
    run=0
    for x in valid_flags:
        if x:
            run+=1; max_consecutive=max(max_consecutive,run)
        else:
            run=0

    if not explorer_settle.get("certified"):
        classification="SECOND_RECORD_EXPLORER_SETTLE_UNEXPECTEDLY_NOT_CERTIFIED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_EXPLORER_SETTLE_PARITY_DIAGNOSIS"
    elif not samples:
        classification="SECOND_RECORD_TARGET_BINDING_SETTLE_EVIDENCE_EMPTY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_LIVE_DIAGNOSIS"
    elif not ever_valid and max_exact==0 and max_contains==0:
        classification="SECOND_RECORD_TARGET_NEVER_MATERIALIZED_WITHIN_TWO_SECOND_BINDING_WINDOW"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_MATERIALIZATION_TIMING_DIAGNOSIS"
    elif not ever_valid and max_contains>1:
        classification="SECOND_RECORD_TARGET_BINDING_AMBIGUOUS_THROUGHOUT_WINDOW"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_DISAMBIGUATION_DIAGNOSIS"
    elif ever_valid and max_consecutive<3:
        classification="SECOND_RECORD_TARGET_BINDING_TRANSIENT_OR_OSCILLATING_VALIDITY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSIS"
    elif ever_exact_unique or ever_contains_unique:
        classification="SECOND_RECORD_TARGET_BINDING_VALIDITY_PRESENT_BUT_SETTLE_CONTRACT_NOT_SATISFIED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_SETTLE_CONTRACT_DIAGNOSIS"
    else:
        classification="SECOND_RECORD_TARGET_BINDING_RESIDUAL_REQUIRES_DEEPER_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_DEEP_DIAGNOSIS"

    checks={
      "r23dR3R3IncompleteStateConsumed":True,
      "firstRecordCertified":first.get("certified") is True,
      "secondRecordResolved":target is not None,
      "secondExplorerSettleCertified":explorer_settle.get("certified") is True,
      "secondTargetBindingSettleFailed":target_settle.get("certified") is False,
      "targetBindingSamplesCaptured":bool(samples),
      "exactCountsInspected":True,
      "containsCountsInspected":True,
      "validitySequenceInspected":True,
      "maxConsecutiveValidityComputed":True,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "firstRecordCertified":first.get("certified"),
      "secondRecord":{
        "target":target,
        "freshTargetCreated":second.get("freshTargetCreated"),
        "explorerSettleReadback":explorer_settle,
        "explorerEntry":second.get("explorerEntry"),
        "targetBindingSettleReadback":target_settle,
        "selection":second.get("selection"),
        "failure":second.get("failure")
      },
      "derived":{
        "sampleCount":len(samples),
        "maxExactCount":max_exact,
        "maxContainsCount":max_contains,
        "everExactUnique":ever_exact_unique,
        "everUniqueContains":ever_contains_unique,
        "everValidBinding":ever_valid,
        "validSampleCount":valid_count,
        "maxConsecutiveValidSamples":max_consecutive
      },
      "checks":checks,
      "authority":{
        "liveUiInteraction":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"recertification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3-R3-R1 Recertification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_DIAGNOSIS")
    print("FIRST_RECORD_CERTIFIED:",first.get("certified"))
    print("SECOND_TARGET:",target)
    print("SECOND_FAILURE:",second.get("failure"))
    print("EXPLORER_SETTLE_CERTIFIED:",explorer_settle.get("certified"))
    print("EXPLORER_SETTLE_SAMPLE_COUNT:",len(explorer_settle.get("samples") or []))
    print("TARGET_BINDING_SETTLE_CERTIFIED:",target_settle.get("certified"))
    print("TARGET_BINDING_SAMPLE_COUNT:",len(samples))
    print("MAX_EXACT_COUNT:",max_exact)
    print("MAX_CONTAINS_COUNT:",max_contains)
    print("EVER_EXACT_UNIQUE:",ever_exact_unique)
    print("EVER_UNIQUE_CONTAINS:",ever_contains_unique)
    print("EVER_VALID_BINDING:",ever_valid)
    print("VALID_SAMPLE_COUNT:",valid_count)
    print("MAX_CONSECUTIVE_VALID_SAMPLES:",max_consecutive)
    print()
    print("----- TARGET BINDING SAMPLES -----")
    for s in samples:
        print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
