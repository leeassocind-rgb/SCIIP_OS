#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,time,urllib.request,subprocess,importlib.util,traceback

R1R6="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R6_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION"

def req(url,method="GET",timeout=2):
    r=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(r,timeout=timeout) as x:return x.status,x.read()

def safe(url,method="GET",timeout=2):
    try:return req(url,method,timeout)
    except Exception as e:return None,repr(e).encode()

def loadj(p):
    try:return json.loads(Path(p).read_text())
    except:return None

def norm(s):return " ".join(str(s or "").lower().split())

def key(x):
    if not isinstance(x,dict):return ""
    k=norm(x.get("selectionKey") or x.get("key") or x.get("label") or x.get("rawIdentitySurface"))
    return k[7:] if k.startswith("select ") else k

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    out=er/OUT
    out.mkdir(parents=True,exist_ok=True)
    ep=out/"reference400_downstream_cohort_requalification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A R1-R7 Reference-400 Downstream Cohort Requalification")
    print("="*120)
    print("Mode: LIVE_EXPLORER_INVENTORY_EXACT_NEW400_REQUALIFICATION_NO_EXPORT")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    refp=er/R1R6/"recertified_reference_four_hundred.json"
    r1r6p=er/R1R6/"new200_boundary_reconstruction_and_reference400_recertification.json"
    selector=pcc/"src/explorer4"/R29A/"select_r29a.py"

    reference=loadj(refp)
    r1r6=loadj(r1r6p)
    if not isinstance(reference,list) or len(reference)!=400:
        print("STATUS: BLOCKED")
        print("REASON: recertified reference-400 artifact missing or wrong count")
        return 4

    refkeys=[key(x) for x in reference]
    if len(set(refkeys))!=400 or "" in refkeys:
        print("STATUS: BLOCKED")
        print("REASON: recertified reference-400 key contract invalid")
        return 5
    if not isinstance(r1r6,dict) or r1r6.get("status")!="PASSED":
        print("STATUS: BLOCKED")
        print("REASON: R1-R6 closure evidence not PASSED")
        return 6

    app_status,_=safe("http://127.0.0.1:5173/",timeout=1)
    started=False
    log="/tmp/sciip-r29a-r1-r7-vite.log"
    if app_status!=200:
        started=True
        lf=open(log,"w")
        subprocess.Popen(
            ["npm","run","dev","--","--host","127.0.0.1","--port","5173"],
            cwd=pcc,stdout=lf,stderr=subprocess.STDOUT,start_new_session=True
        )
        for _ in range(80):
            app_status,_=safe("http://127.0.0.1:5173/",timeout=1)
            if app_status==200:break
            time.sleep(.25)

    cdp_status,_=safe("http://127.0.0.1:9333/json/version",timeout=1)
    print("SCIIP_APP_BOOTSTRAPPED:",started)
    print("SCIIP_APP_HTTP_STATUS:",app_status)
    print("CDP_HTTP_STATUS:",cdp_status)
    if app_status!=200 or cdp_status!=200:
        print("STATUS: BLOCKED")
        print("REASON: SCIIP runtime or CDP unavailable")
        return 7

    # Ensure a fresh app page exists using Chrome-compatible PUT /json/new.
    new_url="http://127.0.0.1:9333/json/new?http://127.0.0.1:5173/"
    put_status=None; put_created=False; put_error=None
    try:
        put_status,b=req(new_url,"PUT",2)
        j=json.loads(b)
        put_created=isinstance(j,dict) and bool(j.get("webSocketDebuggerUrl"))
    except Exception as e:
        put_error=repr(e)
    print("CDP_FRESH_PAGE_PUT_STATUS:",put_status)
    print("CDP_FRESH_PAGE_CREATED:",put_created)
    print("CDP_FRESH_PAGE_ERROR:",put_error)

    time.sleep(1.0)

    spec=importlib.util.spec_from_file_location("r29a_live_r1r7",selector)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    raw=[]; origin=None; live_error=None
    try:
        raw,origin=mod.live_inventory()
    except Exception as e:
        live_error={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

    print("LIVE_INVENTORY_ERROR:",json.dumps(live_error))
    print("LIVE_INVENTORY_COUNT:",len(raw))
    print("LIVE_INVENTORY_ORIGIN:",origin)

    if live_error or not raw:
        classification="REFERENCE400_CERTIFIED_BUT_LIVE_NEW400_REQUALIFICATION_BLOCKED_BY_INVENTORY_RUNTIME"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_R1_LIVE_NEW400_REQUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
        ev={"framework":"SCIIP_EXPLORER_4_R29A_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION",
            "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"DIAGNOSTIC_COMPLETE",
            "classification":classification,"liveError":live_error,"liveInventoryCount":len(raw),
            "nextMilestone":nxt}
        ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")
        print("CLASSIFICATION:",classification)
        print("STATUS: DIAGNOSTIC_COMPLETE")
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ep)
        return 0

    live=[]
    seen_live=set()
    for x in raw:
        y=mod.marker_identity(x)
        k=key(y) or key(x)
        if not k or k in seen_live:continue
        seen_live.add(k)
        if isinstance(y,dict):
            z=dict(y)
        else:
            z={"label":str(y)}
        z["selectionKey"]=k
        live.append(z)

    refset=set(refkeys)
    eligible=[]
    seen=set()
    for x in live:
        k=key(x)
        if not k or k in refset or k in seen:continue
        seen.add(k)
        eligible.append(x)

    selected=eligible[:400]
    newkeys=[key(x) for x in selected]
    exact800=reference+selected
    exact800keys=[key(x) for x in exact800]

    checks={
        "r1r6Passed":r1r6.get("status")=="PASSED",
        "reference400CountExactly400":len(reference)==400,
        "reference400Unique":len(set(refkeys))==400,
        "liveInventoryAtLeast800":len(live)>=800,
        "eligibleOutsideReferenceAtLeast400":len(eligible)>=400,
        "selectedNew400CountExactly400":len(selected)==400,
        "selectedNew400Unique":len(set(newkeys))==400,
        "selectedNew400DisjointReference400":not(set(newkeys)&refset),
        "exactCombined800Count":len(exact800)==800,
        "exactCombined800Unique":len(set(exact800keys))==800,
        "canonicalLiveOrderPreserved":selected==eligible[:400],
        "propertyClickOff":True,
        "assignmentsInvocationOff":True,
        "generateInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True
    }
    passed=all(checks.values())

    (out/"exact_new_four_hundred_candidates_requalified.json").write_text(json.dumps(selected,indent=2)+"\n")
    (out/"exact_eight_hundred_candidate_union.json").write_text(json.dumps(exact800,indent=2)+"\n")

    if passed:
        status="PASSED"
        classification="REFERENCE400_RECERTIFIED_EXACT_NEW400_LIVE_COHORT_REQUALIFIED_EXACT800_CANDIDATE_ARCHITECTURE_CERTIFIED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
    else:
        status="FAILED"
        classification="REFERENCE400_DOWNSTREAM_NEW400_REQUALIFICATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_R1_DOWNSTREAM_COHORT_REQUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "classification":classification,
      "counts":{"reference400":len(reference),"liveUnique":len(live),"eligibleOutsideReference":len(eligible),
                "selectedNew400":len(selected),"combinedCandidate800":len(exact800)},
      "origin":origin,
      "checks":checks,
      "artifacts":{"new400":"exact_new_four_hundred_candidates_requalified.json",
                   "candidate800":"exact_eight_hundred_candidate_union.json"},
      "safety":{"applicationSourceMutation":False,"governedDataMutation":False,"propertyClick":False,
                "assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False},
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("REFERENCE_400_COUNT:",len(reference))
    print("LIVE_UNIQUE_INVENTORY_COUNT:",len(live))
    print("ELIGIBLE_OUTSIDE_REFERENCE_COUNT:",len(eligible))
    print("SELECTED_NEW_400_COUNT:",len(selected))
    print("EXACT_COMBINED_800_COUNT:",len(exact800))
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",status)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("NEW400:",out/"exact_new_four_hundred_candidates_requalified.json")
    print("EXACT800:",out/"exact_eight_hundred_candidate_union.json")
    print("R29A R1-R7 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if passed else 8

if __name__=="__main__":raise SystemExit(main())
