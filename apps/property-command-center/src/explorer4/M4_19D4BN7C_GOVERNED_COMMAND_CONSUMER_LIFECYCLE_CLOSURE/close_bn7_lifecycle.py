#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: close_bn7_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    a=ev/"M4_19D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_command_consumer_parity_certification.json"
    b=ev/"M4_19D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVATION"/"exact_ten_live_governed_command_consumer_observation.json"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN7C Governed Command Consumer Lifecycle Closure")
    print("="*72)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (a,b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    ar=load(a); br=load(b)
    records=br.get("records") or []
    queries=[x.get("query") for x in records]

    checks={
      "bn7aPassed":ar.get("status")=="PASSED",
      "bn7aStateCertified":ar.get("state")=="M419D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFIED",
      "bn7aDiagnosisCertified":ar.get("diagnosis")=="EXACT_TEN_GOVERNED_COMMAND_CONSUMER_CONTRACT_PARITY_CERTIFIED",

      "bn7bPassed":br.get("status")=="PASSED",
      "bn7bStateCertified":br.get("state")=="M419D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED",
      "bn7bDiagnosisCertified":br.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED",

      "exactTenCount":len(records)==10,
      "exactApprovedCohort":queries==EXPECTED,
      "observedCountTen":br.get("observedCount")==10,

      "allControlledValueMatch":all(x.get("controlledValueMatch") is True for x in records),
      "allCommandSurfacesOpened":all(x.get("commandSurfaceOpened") is True for x in records),
      "allCommandRoutesObserved":all(x.get("allCommandRoutesObserved") is True for x in records),
      "allMapsVisibleBeforeCommand":all((x.get("pre") or {}).get("mapVisible") is True for x in records),
      "allMapsVisibleWithCommand":all((x.get("post") or {}).get("mapVisible") is True for x in records),

      "allPropertyRoutesObserved":all((x.get("post") or {}).get("propertyAction") is True for x in records),
      "allMarketRoutesObserved":all((x.get("post") or {}).get("marketAction") is True for x in records),
      "allNeighborsRoutesObserved":all((x.get("post") or {}).get("neighborsAction") is True for x in records),
      "allCompareRoutesObserved":all((x.get("post") or {}).get("compareAction") is True for x in records),
      "allExplainRoutesObserved":all((x.get("post") or {}).get("explainAction") is True for x in records),

      "allOutcomesCertified":all(x.get("outcome")=="LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED" for x in records),
    }

    aauth=ar.get("authority") or {}
    bauth=br.get("authority") or {}
    checks["bn7aApplicationMutationOff"]=aauth.get("applicationSourceMutation") is False
    checks["bn7aGovernedMutationOff"]=aauth.get("governedDataMutation") is False
    checks["bn7bApplicationMutationOff"]=bauth.get("applicationSourceMutation") is False
    checks["bn7bGovernedMutationOff"]=bauth.get("governedDataMutation") is False
    checks["bn7bPixelEvidenceOff"]=bauth.get("pixelEvidence") is False

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN7C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_COMMAND_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False,
        "pixelEvidence":False
      },
      "evidence":{
        "bn7a":{"path":str(a),"sha256":sha(a)},
        "bn7b":{"path":str(b),"sha256":sha(b)}
      },
      "checks":checks,
      "cohort":{"count":len(records),"queries":queries},
      "closure":{
        "governedCommandConsumerLifecycleClosed":passed,
        "sourceContractParityCertified":passed,
        "liveCommandConsumerCertified":passed,
        "allFiveCommandRoutesCertified":passed,
        "mapContinuityWithCommandCertified":passed
      },
      "nextBoundary":{
        "state":"BN7_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN7_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to the next bounded Explorer 4.0 downstream consumer phase; do not reopen BN2-BN7 without contradictory evidence." if passed else "Resolve failed BN7 closure preconditions before advancing."
      }
    }

    outfile=out/"governed_command_consumer_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN COMMAND OUTCOMES -----")
    for i,x in enumerate(records,1):
        ok=x.get("outcome")=="LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED"
        print(f"{i:02d}. {x.get('query')} -> {'CERTIFIED' if ok else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
