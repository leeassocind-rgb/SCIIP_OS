#!/usr/bin/env python3
from __future__ import annotations
import sys,json,hashlib
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE"
EXPECTED_QUERIES=[
"2 Musick",
"2701 Carrier Ave",
"8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave",
"1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St",
"927 E 9th St",
"13900 Carmenita Rd",
]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def load(p):
    with p.open("r",encoding="utf-8") as f:
        return json.load(f)

def main():
    if len(sys.argv)!=2:
        print("usage: close_live_search_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evroot=app/"evidence/explorer4"
    outdir=evroot/M
    outdir.mkdir(parents=True,exist_ok=True)

    causal=evroot/"M4_19D4BN2_R7E_R4_R2_R4_GLOBAL_SEARCH_RUNTIME_CAUSAL_CERTIFICATION"/"global_search_runtime_causal_certification.json"
    live=evroot/"M4_19D4BN2_R7E_R4_R5_R1_CDP_TARGET_BOOTSTRAP_AND_EXACT_TEN_LIVE_RECERTIFICATION"/"exact_ten_live_recertification.json"

    print("============================================================")
    print("SCIIP Explorer 4.0 — R7F-R1 Live Search Lifecycle Closure")
    print("============================================================")
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print()

    missing=[str(p) for p in [causal,live] if not p.is_file()]
    if missing:
        result={
          "status":"BLOCKED",
          "state":"M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_NOT_CLOSED",
          "diagnosis":"REQUIRED_EVIDENCE_MISSING",
          "missing":missing
        }
        (outdir/"live_search_lifecycle_closure.json").write_text(json.dumps(result,indent=2)+"\n")
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    c=load(causal)
    l=load(live)
    records=l.get("records") or []

    checks={}
    checks["causalStatusPassed"]=c.get("status")=="PASSED"
    checks["causalDiagnosisCertified"]=c.get("diagnosis")=="GLOBAL_SEARCH_RUNTIME_CAUSAL_CONTRACT_CERTIFIED"
    checks["liveStatusPassed"]=l.get("status")=="PASSED"
    checks["liveDiagnosisCertified"]=l.get("diagnosis")=="EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED"
    checks["recordCountExactlyTen"]=len(records)==10
    checks["exactApprovedCohort"]=[r.get("query") for r in records]==EXPECTED_QUERIES
    checks["allControlledValueMatch"]=all(r.get("controlledValueMatch") is True for r in records)
    checks["allExplorerMounted"]=all((r.get("snapshot") or {}).get("explorer") is True for r in records)
    checks["allAutoSelectedOrPostVisible"]=all(r.get("outcome")=="MATCH_AUTO_SELECTED_OR_POST_VISIBLE" for r in records)
    checks["liveCountExact"]=((l.get("counts") or {}).get("MATCH_AUTO_SELECTED_OR_POST_VISIBLE")==10 and len(l.get("counts") or {})==1)

    cauth=c.get("authority") or {}
    lauth=l.get("authority") or {}
    checks["causalApplicationMutationOff"]=cauth.get("applicationSourceMutation") is False
    checks["causalGovernedMutationOff"]=cauth.get("governedDataMutation") is False
    checks["liveApplicationMutationOff"]=lauth.get("applicationSourceMutation") is False
    checks["liveGovernedMutationOff"]=lauth.get("governedDataMutation") is False
    checks["pixelEvidenceOff"]=lauth.get("pixelEvidence") is False

    passed=all(checks.values())
    status="PASSED" if passed else "BLOCKED"
    state="M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED" if passed else "M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_NOT_CLOSED"
    diagnosis="EXACT_TEN_LIVE_SEARCH_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "LIVE_SEARCH_LIFECYCLE_CLOSURE_PRECONDITION_FAILED"

    result={
      "framework":"SCIIP_EXPLORER_4_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE",
      "version":"4.0-m4.19d4bn2-r7f-r1",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
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
        "causal":{"path":str(causal),"sha256":sha(causal)},
        "live":{"path":str(live),"sha256":sha(live)}
      },
      "cohort":{
        "expectedCount":10,
        "actualCount":len(records),
        "queries":[r.get("query") for r in records],
        "outcomes":[r.get("outcome") for r in records]
      },
      "checks":checks,
      "closure":{
        "bn2LiveSearchClosed":passed,
        "exactTenCertified":passed,
        "searchInputStateCertified":passed,
        "explorerMountCertified":passed,
        "resolverOutcomeCertified":passed,
        "selectionOrPostVisibilityCertified":passed,
        "pixelEvidenceRequired":False
      },
      "nextBoundary":{
        "state":"BN2_LIVE_SEARCH_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN2_LIVE_SEARCH_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to next governed Explorer 4.0 phase; do not reopen BN2 unless new contradictory evidence appears." if passed else "Resolve failed closure preconditions before advancing."
      }
    }

    outfile=outdir/"live_search_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")

    print("----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print()
    print("Exact-ten outcomes:")
    for i,r in enumerate(records,1):
        print(f"{i:02d}. {r.get('query')} -> {r.get('outcome')}")

    print()
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",result["nextBoundary"]["state"])
    print("EVIDENCE:",outfile)

    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
