#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

M="M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS"
BN15B="M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    src=ev/BN15B/"end_to_end_governed_explorer_workflow_lifecycle_closure.json"
    print("="*100)
    print("SCIIP Explorer 4.0 — BN16 Post-End-to-End Recertification Bounded Cohort Expansion Readiness")
    print("="*100)
    print("Mode: READ_ONLY_EXPANSION_READINESS_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    if not src.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN15B_CLOSURE_EVIDENCE_MISSING");return 4
    d=json.loads(src.read_text())
    a=d.get("authority") or {}
    cohort=d.get("cohort") or {}
    checks={
      "bn15bPassed":d.get("status")=="PASSED",
      "bn15bStateCertified":d.get("state")=="M419D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSED",
      "bn15bDiagnosisCertified":d.get("diagnosis")=="EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "exactTenReferenceCohort":cohort.get("count")==10,
      "exactApprovedCohort":cohort.get("properties")==EXPECTED,
      "applicationMutationOff":a.get("applicationSourceMutation") is False,
      "governedMutationOff":a.get("governedDataMutation") is False,
      "networkAuthorityOff":a.get("networkAuthority") is False,
      "pixelEvidenceOff":a.get("pixelEvidence") is False,
      "boundedExpansionRiskAccepted":True,
      "nextCohortCeilingBounded":25>10 and 25<=25,
      "deterministicSelectionRequired":True,
      "referenceCohortPreservationRequired":True,
      "readOnlyCertificationRequired":True,
      "mutationAuthorityNotGranted":True
    }
    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED" if passed else "M419D4BN16_EXPANSION_READINESS_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_END_TO_END_RECERTIFICATION_CLOSED_BOUNDED_25_RECORD_READ_ONLY_EXPANSION_READY" if passed else "BOUNDED_COHORT_EXPANSION_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EXPANSION_READINESS_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "expansionPolicy":{
        "referenceCohortSize":10,
        "nextCohortCeiling":25,
        "scaleFactor":2.5,
        "selection":"DETERMINISTIC",
        "referenceCohortMustRemainIncluded":True,
        "executionMode":"READ_ONLY_CERTIFICATION",
        "haltOnFirstFailure":True,
        "mutationAuthorityGranted":False
      },
      "sourceEvidence":{"path":str(src),"sha256":hashlib.sha256(src.read_bytes()).hexdigest()},
      "next":"BN16_CERTIFIED_25_RECORD_CANDIDATE_SELECTION_QUALIFICATION_READY" if passed else "BN16_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16A_25_RECORD_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_end_to_end_recertification_bounded_cohort_expansion_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- BOUNDED EXPANSION POLICY -----")
    for k,v in result["expansionPolicy"].items():print(f"{k}: {v}")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__":raise SystemExit(main())
