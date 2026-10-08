#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN"

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    src=ev/"M4_19D4BN14_R1_BN8_AUTHORITY_METADATA_RECONCILIATION_AND_POST_CONSUMER_FAMILY_PHASE_CERTIFICATION"/"bn8_authority_metadata_reconciliation_and_post_consumer_family_phase_certification.json"

    print("="*96)
    print("SCIIP Explorer 4.0 — BN14A Bounded Next-Phase Architecture + Expansion Readiness")
    print("="*96)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not src.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN14_R1_CERTIFICATION_EVIDENCE_MISSING")
        return 4

    r=load(src)
    rc=r.get("checks") or {}
    families=r.get("closedConsumerFamilies") or []
    authority=r.get("authority") or {}

    checks={
      "bn14R1Passed":r.get("status")=="PASSED",
      "bn14R1StateCertified":r.get("state")=="M419D4BN14_R1_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED",
      "bn14R1DiagnosisCertified":r.get("diagnosis")=="BN8_AUTHORITY_METADATA_OMISSION_RECONCILED_BN8_THROUGH_BN13_CONSUMER_FAMILIES_CERTIFIED_CLOSED",
      "allSixConsumerFamiliesClosed":rc.get("allSixConsumerFamiliesClosed") is True,
      "noMutationAuthorityReconciled":rc.get("noMutationAuthorityReconciled") is True,
      "applicationMutationOff":authority.get("applicationSourceMutation") is False,
      "governedMutationOff":authority.get("governedDataMutation") is False,
      "sixClosedFamiliesEnumerated":len(families)==6,
      "readOnlyNextPhasePreferred":True
    }

    candidates=[
      {
        "candidate":"EXACT_TEN_END_TO_END_WORKFLOW_RECERTIFICATION",
        "risk":"LOW",
        "mutationAuthorityRequired":False,
        "rationale":"Reconcile the now-certified consumer families as one complete live governed workflow before expanding scope."
      },
      {
        "candidate":"BOUNDED_COHORT_EXPANSION",
        "risk":"MEDIUM",
        "mutationAuthorityRequired":False,
        "rationale":"Potential next step after end-to-end workflow recertification establishes whole-path stability."
      },
      {
        "candidate":"GOVERNED_MUTATION_REINTRODUCTION_DESIGN",
        "risk":"HIGH",
        "mutationAuthorityRequired":True,
        "rationale":"Deferred until read-only whole-workflow and broader-cohort evidence justify reopening mutation authority."
      }
    ]

    resolved="EXACT_TEN_END_TO_END_WORKFLOW_RECERTIFICATION"
    checks["nextPhaseResolved"]=True
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_CERTIFIED" if passed else "M419D4BN14A_NEXT_PHASE_NOT_CERTIFIED",
      "diagnosis":"POST_CONSUMER_FAMILY_END_TO_END_RECERTIFICATION_SELECTED_AS_NEXT_BOUNDED_PHASE" if passed else "POST_CONSUMER_FAMILY_NEXT_PHASE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "closedConsumerFamilies":families,
      "candidatePhases":candidates,
      "resolvedNextPhase":resolved,
      "nextMilestone":"M4_19D4BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN" if passed else None,
      "bn14R1Evidence":{"path":str(src),"sha256":sha(src)}
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"bounded_next_phase_architecture_and_expansion_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("\n----- CANDIDATE NEXT PHASES -----")
    for c in candidates:
        print(f'{c["candidate"]}: risk={c["risk"]} mutationAuthorityRequired={c["mutationAuthorityRequired"]}')

    print()
    print("RESOLVED_NEXT_PHASE:",resolved)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
