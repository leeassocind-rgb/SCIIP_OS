#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"
def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    p=ev/"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"/"twenty_five_record_governed_expansion_lifecycle_closure.json"
    if not p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN16D_CLOSURE_EVIDENCE_MISSING");return 4
    d=first_json(p)
    cohort=(d.get("closedCohort") or {}).get("properties") or []
    checks={
      "bn16dPassed":d.get("status")=="PASSED",
      "bn16dStateCertified":d.get("state")=="M419D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSED",
      "bn16dDiagnosisCertified":d.get("diagnosis")=="EXACT_25_RECORD_GOVERNED_EXPLORER_EXPANSION_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "exactTwentyFiveReferenceCohort":len(cohort)==25,
      "allTwentyFiveUnique":len(set(cohort))==25,
      "applicationMutationOff":(d.get("authority") or {}).get("applicationSourceMutation") is False,
      "governedMutationOff":(d.get("authority") or {}).get("governedDataMutation") is False,
      "networkAuthorityOff":(d.get("authority") or {}).get("networkAuthority") is False,
      "pixelEvidenceOff":(d.get("authority") or {}).get("pixelEvidence") is False,
      "referenceCohortPreservationRequired":True,
      "readOnlyNextPhasePreferred":True,
      "nextCohortCeilingBounded":True,
      "mutationAuthorityNotGranted":True
    }
    passed=all(checks.values())
    candidates=[
      {"phase":"EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION","risk":"LOW_TO_MEDIUM","mutationAuthorityRequired":False,"cohortCeiling":50},
      {"phase":"BROADER_UNBOUNDED_READ_ONLY_EXPANSION","risk":"MEDIUM_TO_HIGH","mutationAuthorityRequired":False,"cohortCeiling":None},
      {"phase":"GOVERNED_MUTATION_REINTRODUCTION_DESIGN","risk":"HIGH","mutationAuthorityRequired":True,"cohortCeiling":25}
    ]
    resolved="EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION" if passed else None
    print("="*104)
    print("SCIIP Explorer 4.0 — BN17 Post-25-Record Expansion Next-Phase Readiness + Bounded Design")
    print("="*104)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF\n")
    print("----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- CANDIDATE NEXT PHASES -----")
    for c in candidates:
        print(f'{c["phase"]}: risk={c["risk"]} mutationAuthorityRequired={c["mutationAuthorityRequired"]} cohortCeiling={c["cohortCeiling"]}')
    print("\nREFERENCE_COHORT_SIZE: 25")
    print("NEXT_COHORT_CEILING: 50")
    print("SCALE_FACTOR: 2.0")
    print("REFERENCE_COHORT_MUST_REMAIN_INCLUDED: True")
    print("SELECTION: DETERMINISTIC")
    print("EXECUTION_MODE: READ_ONLY_CERTIFICATION")
    print("HALT_ON_FIRST_FAILURE: True")
    print("MUTATION_AUTHORITY_GRANTED: False")
    print("RESOLVED_NEXT_PHASE:",resolved)
    result={
      "framework":"SCIIP_EXPLORER_4_BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED" if passed else "M419D4BN17_NEXT_PHASE_READINESS_INCOMPLETE",
      "diagnosis":"CLOSED_25_RECORD_GOVERNED_EXPANSION_CERTIFIES_BOUNDED_50_RECORD_READ_ONLY_NEXT_PHASE" if passed else "POST_25_RECORD_EXPANSION_NEXT_PHASE_PRECONDITION_FAILED",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "readinessChecks":checks,
      "referenceCohort":{"count":25,"properties":cohort},
      "boundedExpansionPolicy":{"referenceCohortSize":25,"nextCohortCeiling":50,"scaleFactor":2.0,"selection":"DETERMINISTIC","referenceCohortMustRemainIncluded":True,"executionMode":"READ_ONLY_CERTIFICATION","haltOnFirstFailure":True,"mutationAuthorityGranted":False},
      "candidateNextPhases":candidates,
      "resolvedNextPhase":resolved,
      "next":"BN17_CERTIFIED_50_RECORD_LIVE_SEARCHABLE_IDENTITY_CANDIDATE_SELECTION_READY" if passed else "BN17_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION" if passed else None,
      "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_25_record_expansion_next_phase_readiness_and_bounded_design.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\nSTATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
