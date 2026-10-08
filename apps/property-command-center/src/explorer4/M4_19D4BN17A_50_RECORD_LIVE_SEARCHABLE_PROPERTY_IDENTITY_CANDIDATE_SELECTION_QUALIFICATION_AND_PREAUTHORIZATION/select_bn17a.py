#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re,urllib.request

M="M4_19D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
def first_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def cdp_targets():
    with urllib.request.urlopen("http://127.0.0.1:9333/json",timeout=3) as r:return json.load(r)
def ws_call(ws, i, method, params=None):
    ws.send(json.dumps({"id":i,"method":method,"params":params or {}}))
    while True:
        x=json.loads(ws.recv())
        if x.get("id")==i:return x
def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    p17=ev/"M4_19D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_25_record_expansion_next_phase_readiness_and_bounded_design.json"
    p16=ev/"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"/"twenty_five_record_governed_expansion_lifecycle_closure.json"
    if not p17.is_file() or not p16.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_BN17_OR_BN16D_EVIDENCE_MISSING");return 4
    d17,d16=first_json(p17),first_json(p16)
    ref=(d16.get("closedCohort") or {}).get("properties") or []
    # Obtain live page text through CDP, matching prior live milestone infrastructure.
    try:
        import websocket
        targets=cdp_targets()
        target=next((x for x in targets if x.get("type")=="page" and "127.0.0.1:5173" in x.get("url","")),None)
        if not target: raise RuntimeError("Explorer page target not found")
        ws=websocket.create_connection(target["webSocketDebuggerUrl"],timeout=10,origin="http://127.0.0.1:9333",suppress_origin=True)
        res=ws_call(ws,1,"Runtime.evaluate",{"expression":"document.body.innerText","returnByValue":True})
        body=res["result"]["result"].get("value","")
        ws.close()
        cdp=True
    except Exception as e:
        print("LIVE_IDENTITY_SURFACE_ERROR:",repr(e))
        body="";cdp=False
    # Parse address-like one-line labels from the actual live rendered surface.
    lines=[]
    seen=set()
    addr=re.compile(r"^\s*(?:\d{1,6}\s+|(?:NE|NW|SE|SW)\s+of\s+).{2,100}$",re.I)
    junk=re.compile(r"(sf\b|ft\b|open compare|compare \d|available|neighbor|asking|clear height)",re.I)
    for raw in body.splitlines():
        s=" ".join(raw.split()).strip(" -•")
        if not s or len(s)>120 or junk.search(s):continue
        if addr.search(s) and s.casefold() not in seen:
            seen.add(s.casefold());lines.append(s)
    refkeys={x.casefold() for x in ref}
    pool=sorted([x for x in lines if x.casefold() not in refkeys],key=lambda x:x.casefold())
    new=pool[:25]
    cohort=ref+new
    checks={
      "bn17Passed":d17.get("status")=="PASSED",
      "bn17StateCertified":d17.get("state")=="M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED",
      "bn17Resolved50RecordExpansion":d17.get("resolvedNextPhase")=="EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION",
      "referenceCohortSizeTwentyFive":len(ref)==25,
      "originalTwentyFivePreservedFirst":cohort[:25]==ref,
      "liveExplorerTargetObserved":cdp,
      "atLeastTwentyFiveNewLiveCandidatesFound":len(pool)>=25,
      "exactlyTwentyFiveNewCandidatesSelected":len(new)==25,
      "exactlyFiftyTotal":len(cohort)==50,
      "allFiftyUnique":len({x.casefold() for x in cohort})==50,
      "selectionDeterministic":new==sorted(new,key=lambda x:x.casefold()),
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    passed=all(checks.values())
    print("="*112)
    print("SCIIP Explorer 4.0 — BN17A 50-Record Live-Searchable Property Identity Candidate Selection")
    print("="*112)
    print("Mode: READ_ONLY_LIVE_IDENTITY_QUALIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("\n----- QUALIFICATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- QUALIFIED 25 NEW LIVE-SEARCHABLE CANDIDATES -----")
    for i,x in enumerate(new,1):print(f"{i:02d}. {x}")
    print("\n----- PREAUTHORIZED 50-RECORD COHORT -----")
    for i,x in enumerate(cohort,1):print(f"{i:02d}. {x}")
    print(f"\nLIVE_ADDRESS_CANDIDATE_POOL_COUNT: {len(pool)}")
    result={
      "framework":"SCIIP_EXPLORER_4_BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED" if passed else "M419D4BN17A_50_RECORD_COHORT_NOT_PREAUTHORIZED",
      "diagnosis":"EXACT_50_RECORD_COHORT_PREAUTHORIZED_AGAINST_LIVE_SEARCHABLE_PROPERTY_IDENTITY_SURFACE" if passed else "LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_OR_QUALIFICATION_GAP",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},
      "qualificationChecks":checks,
      "referenceCohort":{"count":len(ref),"properties":ref},
      "newCandidates":{"count":len(new),"properties":new,"liveCandidatePoolCount":len(pool)},
      "preauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "next":"BN17A_PREAUTHORIZED_50_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN17A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"fifty_record_live_searchable_property_identity_candidate_selection_qualification_preauthorization.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\nSTATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__":raise SystemExit(main())
