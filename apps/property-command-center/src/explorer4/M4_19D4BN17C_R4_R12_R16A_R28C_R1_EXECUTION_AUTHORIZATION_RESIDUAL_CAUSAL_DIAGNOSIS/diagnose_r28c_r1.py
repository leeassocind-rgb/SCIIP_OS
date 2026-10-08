#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys

R28="M4_19D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"
R28C="M4_19D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R28C_R1_EXECUTION_AUTHORIZATION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def summarize_dict(d, depth=0):
    if not isinstance(d,dict): return {"type":type(d).__name__}
    out={}
    for k,v in d.items():
        if isinstance(v,dict):
            out[k]={"type":"dict","keys":list(v.keys())[:80]}
        elif isinstance(v,list):
            out[k]={"type":"list","count":len(v)}
        else:
            out[k]=v
    return out

def find_values(obj, wanted, path="$"):
    hits=[]
    if isinstance(obj,dict):
        for k,v in obj.items():
            p=f"{path}.{k}"
            if k in wanted:
                hits.append({"path":p,"key":k,"value":v})
            hits.extend(find_values(v,wanted,p))
    elif isinstance(obj,list):
        for i,v in enumerate(obj[:1000]):
            hits.extend(find_values(v,wanted,f"{path}[{i}]"))
    return hits

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p28=er/R28/"exact_four_hundred_progressive_export_policy_and_guarded_execution_readiness.json"
    p28c=er/R28C/"exact_four_hundred_guarded_export_execution_readiness_and_authorization.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28C-R1 Execution Authorization Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_SHAPE_AND_POLICY_FIELD_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p28.exists() or not p28c.exists():
        print("STATUS: BLOCKED")
        print("REASON: required R28 or R28C evidence missing")
        return 4

    j28=loadj(p28); j28c=loadj(p28c)
    if not isinstance(j28,dict) or not isinstance(j28c,dict):
        print("STATUS: BLOCKED")
        print("REASON: evidence root shape not object")
        return 5

    wanted={
      "status","state","referenceCohortSize","nextCohortSize","scaleFactor",
      "newLiveExpansionRecordsRequired","executionStrategy","referenceReexportRequired",
      "referenceTwoHundredReexportRequired","policyContract","eligibilityContract",
      "exactCombinedCohortSize","exactCertifiedCount"
    }
    hits=find_values(j28,wanted)

    vals={}
    for h in hits:
        vals.setdefault(h["key"],[]).append({"path":h["path"],"value":h["value"]})

    def first_scalar(key):
        for x in vals.get(key,[]):
            if not isinstance(x["value"],(dict,list)):
                return x["value"],x["path"]
        return None,None

    ref,refp=first_scalar("referenceCohortSize")
    nxt,nxtp=first_scalar("nextCohortSize")
    scale,scalep=first_scalar("scaleFactor")
    newreq,newreqp=first_scalar("newLiveExpansionRecordsRequired")
    strategy,stratp=first_scalar("executionStrategy")
    reexport,reexportp=first_scalar("referenceReexportRequired")
    if reexport is None:
        reexport,reexportp=first_scalar("referenceTwoHundredReexportRequired")

    status=j28.get("status")
    state=j28.get("state")
    state_closed=("R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS_CERTIFIED" in str(state))
    semantic_policy_pass=(
        status=="PASSED" and
        ref==200 and nxt==400 and
        scale==2.0 and newreq==200 and
        strategy=="PROGRESSIVE_DELTA_TWO_HUNDRED" and
        reexport is False
    )

    prior_false=(j28c.get("checks") or {}).get("r28PolicyPassed") is False
    prior_exact_false=(j28c.get("checks") or {}).get("r28ExactFourHundredPolicyCertified") is False

    classification = (
      "R28_POLICY_SEMANTICALLY_CERTIFIED_R28C_READER_FIELD_LOCATION_OR_SHAPE_MISMATCH_CONFIRMED"
      if semantic_policy_pass and prior_false and prior_exact_false
      else
      "R28_POLICY_SEMANTIC_CERTIFICATION_NOT_YET_PROVEN"
    )
    nextm = (
      "M4_19D4BN17C_R4_R12_R16A_R28C_R2_SHAPE_SAFE_R28_POLICY_BINDING_REPAIR_AND_EXECUTION_AUTHORIZATION_RECERTIFICATION"
      if semantic_policy_pass
      else
      "M4_19D4BN17C_R4_R12_R16A_R28C_R1_R1_R28_POLICY_EVIDENCE_DEEP_DIAGNOSIS"
    )

    checks={
      "r28EvidencePresent":True,
      "r28cFailedEvidencePresent":True,
      "r28cPriorStatusFailed":j28c.get("status")=="FAILED",
      "r28cPriorR28PolicyPassedFalse":prior_false,
      "r28cPriorR28ExactPolicyFalse":prior_exact_false,
      "r28StatusPassed":status=="PASSED",
      "r28CertifiedStateObserved":state_closed,
      "referenceCohortSize200Resolved":ref==200,
      "nextCohortSize400Resolved":nxt==400,
      "scaleFactor2Resolved":scale==2.0,
      "newLiveExpansionRecords200Resolved":newreq==200,
      "progressiveDeltaTwoHundredResolved":strategy=="PROGRESSIVE_DELTA_TWO_HUNDRED",
      "referenceReexportFalseResolved":reexport is False,
      "semanticR28PolicyCertified":semantic_policy_pass,
      "fieldPathsCaptured":all(x is not None for x in [refp,nxtp,scalep,newreqp,stratp,reexportp]),
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"execution_authorization_residual_causal_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28C_R1_EXECUTION_AUTHORIZATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if all(checks.values()) else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R12_R16A_R28C_R1_EXECUTION_AUTHORIZATION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "r28TopLevel":summarize_dict(j28),
      "resolvedPolicy":{
        "status":status,"state":state,
        "referenceCohortSize":{"value":ref,"path":refp},
        "nextCohortSize":{"value":nxt,"path":nxtp},
        "scaleFactor":{"value":scale,"path":scalep},
        "newLiveExpansionRecordsRequired":{"value":newreq,"path":newreqp},
        "executionStrategy":{"value":strategy,"path":stratp},
        "referenceReexportRequired":{"value":reexport,"path":reexportp},
        "semanticPolicyCertified":semantic_policy_pass
      },
      "fieldHits":hits,
      "checks":checks,
      "nextMilestone":nextm
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R28_STATUS:",status)
    print("R28_STATE:",state)
    print("REFERENCE_COHORT_SIZE:",ref,"PATH:",refp)
    print("NEXT_COHORT_SIZE:",nxt,"PATH:",nxtp)
    print("SCALE_FACTOR:",scale,"PATH:",scalep)
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",newreq,"PATH:",newreqp)
    print("EXECUTION_STRATEGY:",strategy,"PATH:",stratp)
    print("REFERENCE_REEXPORT_REQUIRED:",reexport,"PATH:",reexportp)
    print("SEMANTIC_R28_POLICY_CERTIFIED:",semantic_policy_pass)

    print("\n----- R28 TOP-LEVEL SHAPE -----")
    print(json.dumps(summarize_dict(j28),indent=2))
    print("\n----- RELEVANT FIELD HITS -----")
    for h in hits:
        v=h["value"]
        if isinstance(v,(dict,list)):
            v=f"<{type(v).__name__}>"
        print(f"{h['path']} = {v}")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",out["status"])
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    print("\nR28C-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
