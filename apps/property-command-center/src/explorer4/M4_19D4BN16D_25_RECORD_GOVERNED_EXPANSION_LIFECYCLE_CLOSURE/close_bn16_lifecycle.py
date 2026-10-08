#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"
def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]
def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    paths={
      "bn16":ev/"M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS"/"post_end_to_end_recertification_bounded_cohort_expansion_readiness.json",
      "bn16aR3":ev/"M4_19D4BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION"/"tolerant_evidence_decoder_and_25_record_governed_cohort_preauthorization.json",
      "bn16b":ev/"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"/"twenty_five_record_governed_explorer_contract_parity_certification.json",
      "bn16cR1":ev/"M4_19D4BN16C_R1_EXPANDED_COHORT_LIVE_SEARCH_SELECTION_EXPLAIN_CAUSAL_DIAGNOSIS"/"expanded_cohort_live_search_selection_explain_causal_diagnosis.json",
      "bn16cR2":ev/"M4_19D4BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION"/"live_searchable_property_identity_cohort_requalification_and_25_record_reauthorization.json",
      "bn16cR3":ev/"M4_19D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"/"twenty_five_record_live_governed_explorer_workflow_recertification.json"
    }
    missing=[k for k,p in paths.items() if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EXPANSION_EVIDENCE_MISSING");print("MISSING:",", ".join(missing));return 4
    d={k:first_json(p) for k,p in paths.items()}
    r3=d["bn16cR3"]; r2=d["bn16cR2"]
    cohort=(r3.get("cohort") or {}).get("properties") or []
    checks={
      "bn16Passed":d["bn16"].get("status")=="PASSED",
      "bn16StateCertified":d["bn16"].get("state")=="M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED",
      "bn16aR3Passed":d["bn16aR3"].get("status")=="PASSED",
      "bn16aR3StateCertified":d["bn16aR3"].get("state")=="M419D4BN16A_R3_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED",
      "bn16bPassed":d["bn16b"].get("status")=="PASSED",
      "bn16bStateCertified":d["bn16b"].get("state")=="M419D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
      "bn16cR1Passed":d["bn16cR1"].get("status")=="PASSED",
      "bn16cR1StateCertified":d["bn16cR1"].get("state")=="M419D4BN16C_R1_EXPANDED_COHORT_RESIDUAL_CAUSALLY_BOUNDED",
      "bn16cR2Passed":r2.get("status")=="PASSED",
      "bn16cR2StateCertified":r2.get("state")=="M419D4BN16C_R2_25_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_REAUTHORIZED",
      "bn16cR3Passed":r3.get("status")=="PASSED",
      "bn16cR3StateCertified":r3.get("state")=="M419D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
      "bn16cR3DiagnosisCertified":r3.get("diagnosis")=="EXACT_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED",
      "exactTwentyFiveCount":len(cohort)==25,
      "recertifiedCountTwentyFive":r3.get("recertifiedCount")==25,
      "allTwentyFiveUnique":len(set(cohort))==25,
      "reauthorizedCohortMatchesLiveCohort":((r2.get("reauthorizedCohort") or {}).get("properties") or [])==cohort,
      "allLiveOutcomesCertified":len(r3.get("outcomes") or [])==25 and all(x.get("outcome")=="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" for x in (r3.get("outcomes") or [])),
      "applicationMutationOff":(r3.get("authority") or {}).get("applicationSourceMutation") is False,
      "governedMutationOff":(r3.get("authority") or {}).get("governedDataMutation") is False,
      "networkAuthorityOff":(r3.get("authority") or {}).get("networkAuthority") is False,
      "pixelEvidenceOff":(r3.get("authority") or {}).get("pixelEvidence") is False
    }
    passed=all(checks.values())
    print("="*104)
    print("SCIIP Explorer 4.0 — BN16D 25-Record Governed Expansion Lifecycle Closure")
    print("="*104)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF\n")
    print("----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- EXACT-25 CLOSED COHORT -----")
    for i,p in enumerate(cohort,1):print(f"{i:02d}. {p} -> CERTIFIED")
    result={
      "framework":"SCIIP_EXPLORER_4_BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSED" if passed else "M419D4BN16D_EXPANSION_LIFECYCLE_CLOSURE_INCOMPLETE",
      "diagnosis":"EXACT_25_RECORD_GOVERNED_EXPLORER_EXPANSION_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE_PRECONDITION_FAILED",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "closureChecks":checks,
      "closedCohort":{"count":len(cohort),"properties":cohort},
      "next":"BN16_25_RECORD_EXPANSION_CLOSED_NEXT_PHASE_READINESS_READY" if passed else "BN16D_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN" if passed else None,
      "sourceEvidence":{k:{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for k,p in paths.items()}
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"twenty_five_record_governed_expansion_lifecycle_closure.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\nSTATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
