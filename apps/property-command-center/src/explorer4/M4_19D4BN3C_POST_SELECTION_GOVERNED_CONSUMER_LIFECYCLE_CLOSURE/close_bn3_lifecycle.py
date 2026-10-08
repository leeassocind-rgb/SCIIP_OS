#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: close_bn3_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn3a=ev/"M4_19D4BN3A_EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_post_selection_parity_certification.json"
    bn3b=ev/"M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION"/"exact_ten_live_post_selection_governed_consumer_observation.json"

    print("============================================================")
    print("SCIIP Explorer 4.0 — BN3C Post-Selection Lifecycle Closure")
    print("============================================================")
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")

    missing=[str(p) for p in (bn3a,bn3b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    a=load(bn3a); b=load(bn3b)
    records=b.get("records") or []
    queries=[r.get("query") for r in records]

    checks={
      "bn3aPassed":a.get("status")=="PASSED",
      "bn3aStateCertified":a.get("state")=="M419D4BN3A_EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_PARITY_CERTIFIED",
      "bn3aDiagnosisCertified":a.get("diagnosis")=="EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_CONTRACT_PARITY_CERTIFIED",
      "bn3bPassed":b.get("status")=="PASSED",
      "bn3bStateCertified":b.get("state")=="M419D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
      "bn3bDiagnosisCertified":b.get("diagnosis")=="EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED",
      "exactTenCount":len(records)==10,
      "exactApprovedCohort":queries==EXPECTED,
      "observedCountTen":b.get("observedCount")==10,
      "allObservedOutcome":all(r.get("outcome")=="POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED" for r in records),
      "allControlledValueMatch":all(r.get("controlledValueMatch") is True for r in records),
      "allExplorerMounted":all((r.get("beforeDrawer") or {}).get("explorer") is True for r in records),
      "allPostSelectionVisible":all((r.get("beforeDrawer") or {}).get("bodyHasQuery") is True for r in records),
      "allPropertyControlsClicked":all(r.get("propertyControlClicked") is True for r in records),
      "allDrawersVisible":all((r.get("afterDrawer") or {}).get("drawerVisible") is True for r in records),
      "allMapsVisible":all((r.get("afterDrawer") or {}).get("mapVisible") is True for r in records),
      "allIntelligenceObserved":all(((r.get("afterDrawer") or {}).get("intelligenceNodeCount") or 0)>0 for r in records),
    }

    aauth=a.get("authority") or {}
    bauth=b.get("authority") or {}
    checks["bn3aApplicationMutationOff"]=aauth.get("applicationSourceMutation") is False
    checks["bn3aGovernedMutationOff"]=aauth.get("governedDataMutation") is False
    checks["bn3bApplicationMutationOff"]=bauth.get("applicationSourceMutation") is False
    checks["bn3bGovernedMutationOff"]=bauth.get("governedDataMutation") is False
    checks["bn3bPixelEvidenceOff"]=bauth.get("pixelEvidence") is False

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN3C_POST_SELECTION_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False
      },
      "evidence":{
        "bn3a":{"path":str(bn3a),"sha256":sha(bn3a)},
        "bn3b":{"path":str(bn3b),"sha256":sha(bn3b)}
      },
      "checks":checks,
      "cohort":{"count":len(records),"queries":queries},
      "closure":{
        "postSelectionGovernedConsumerLifecycleClosed":passed,
        "sourceContractParityCertified":passed,
        "liveExactTenObserved":passed,
        "propertyDrawerConsumptionCertified":passed,
        "mapVisibilityCertified":passed,
        "propertyIntelligenceConsumerObservationCertified":passed
      },
      "nextBoundary":{
        "state":"BN3_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN3_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to the next bounded Explorer 4.0 post-selection phase; do not reopen BN3 without contradictory evidence." if passed else "Resolve failed closure preconditions before advancing."
      }
    }

    outfile=out/"post_selection_governed_consumer_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- EXACT-TEN OUTCOMES -----")
    for i,r in enumerate(records,1):
        print(f"{i:02d}. {r.get('query')} -> {r.get('outcome')}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
