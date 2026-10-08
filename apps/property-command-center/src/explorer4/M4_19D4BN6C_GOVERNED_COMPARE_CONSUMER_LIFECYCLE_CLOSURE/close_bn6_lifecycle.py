#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE"
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
        print("usage: close_bn6_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    a=ev/"M4_19D4BN6A_R1_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_RECONCILIATION"/"governed_compare_selected_property_binding_reconciliation.json"
    b=ev/"M4_19D4BN6B_R2_EXACT_TEN_LIVE_COMPARE_ACTIVATION_PATH_RECERTIFICATION"/"exact_ten_live_compare_activation_path_recertification.json"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN6C Governed Compare Consumer Lifecycle Closure")
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
      "bn6aR1Passed":ar.get("status")=="PASSED",
      "bn6aR1StateCertified":ar.get("state")=="M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED",
      "bn6aR1DiagnosisCertified":ar.get("diagnosis")=="BN6A_BINDING_PROBE_IDENTIFIER_MISMATCH_RECONCILED_COMPARE_CONTRACT_CERTIFIED",

      "bn6bR2Passed":br.get("status")=="PASSED",
      "bn6bR2StateCertified":br.get("state")=="M419D4BN6B_R2_EXACT_TEN_LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED",
      "bn6bR2DiagnosisCertified":br.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED",

      "exactTenCount":len(records)==10,
      "exactApprovedCohort":queries==EXPECTED,
      "certifiedCountTen":br.get("certifiedCount")==10,

      "allControlledValueMatch":
        all(x.get("controlledValueMatch") is True for x in records),

      "allCommandSurfacesOpened":
        all(x.get("commandSurfaceOpened") is True for x in records),

      "allCompareActionsClicked":
        all((x.get("compareAction") or {}).get("clicked") is True for x in records),

      "allCompareConsumersVisible":
        all(((x.get("post") or {}).get("compareVisibleCount") or 0)>0 for x in records),

      "allMapsVisibleBeforeCompare":
        all((x.get("pre") or {}).get("mapVisible") is True for x in records),

      "allMapsVisibleAfterCompare":
        all((x.get("post") or {}).get("mapVisible") is True for x in records),

      "allOutcomesCertified":
        all(x.get("outcome")=="LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED" for x in records),
    }

    aauth=ar.get("authority") or {}
    bauth=br.get("authority") or {}
    checks["bn6aR1ApplicationMutationOff"]=aauth.get("applicationSourceMutation") is False
    checks["bn6aR1GovernedMutationOff"]=aauth.get("governedDataMutation") is False
    checks["bn6bR2ApplicationMutationOff"]=bauth.get("applicationSourceMutation") is False
    checks["bn6bR2GovernedMutationOff"]=bauth.get("governedDataMutation") is False
    checks["bn6bR2PixelEvidenceOff"]=bauth.get("pixelEvidence") is False

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN6C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_COMPARE_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
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
        "bn6aR1":{"path":str(a),"sha256":sha(a)},
        "bn6bR2":{"path":str(b),"sha256":sha(b)}
      },
      "checks":checks,
      "cohort":{"count":len(records),"queries":queries},
      "closure":{
        "governedCompareConsumerLifecycleClosed":passed,
        "selectedPropertyBindingCertified":passed,
        "liveActivationPathCertified":passed,
        "compareConsumerVisibilityCertified":passed,
        "mapContinuityAfterCompareCertified":passed
      },
      "nextBoundary":{
        "state":"BN6_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN6_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to the next bounded Explorer 4.0 downstream consumer phase; do not reopen BN2-BN6 without contradictory evidence." if passed else "Resolve failed BN6 closure preconditions before advancing."
      }
    }

    outfile=out/"governed_compare_consumer_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN COMPARE OUTCOMES -----")
    for i,x in enumerate(records,1):
        ok=x.get("outcome")=="LIVE_GOVERNED_COMPARE_ACTIVATION_PATH_CERTIFIED"
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
