#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,time,urllib.request,subprocess,importlib.util,traceback

R28A3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28A4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_SUCCESSOR_SIX_TARGETED_LIVE_INVENTORY_DIAGNOSIS"

def get(url,timeout=1):
    try:
        with urllib.request.urlopen(url,timeout=timeout) as r:return r.status,r.read()
    except Exception as e:return None,repr(e).encode()
def loadj(p):
    try:return json.loads(Path(p).read_text())
    except:return None
def norm(s):return " ".join(str(s or "").lower().split())
def key(x):
    if not isinstance(x,dict):return ""
    k=norm(x.get("selectionKey") or x.get("label") or x.get("rawIdentitySurface"))
    return k[7:] if k.startswith("select ") else k
def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"; er=pcc/"evidence/explorer4"
    prior=loadj(er/R28A3/"exact_new_two_hundred_candidates.json")
    new=loadj(er/R28A4/"exact_new_two_hundred_candidates_prefix_normalized.json")
    selector=pcc/"src/explorer4"/R29A/"select_r29a.py"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True);ep=out/"successor_six_targeted_live_inventory_diagnosis.json"
    print("="*120);print("SCIIP Explorer 4.0 — R29A R1-R5 Successor-Six Targeted Live Inventory Diagnosis");print("="*120)
    print("Application source mutation: OFF\nGoverned data mutation: OFF\nProperty click: OFF\nAssignments invocation: OFF\nGenerate invocation: OFF\nExport invocation: OFF")
    status,_=get("http://127.0.0.1:5173/",1)
    started=False; log="/tmp/sciip-r29a-r1-r5-vite.log"
    if status!=200:
        started=True
        subprocess.Popen(["npm","run","dev","--","--host","127.0.0.1","--port","5173"],cwd=pcc,stdout=open(log,"w"),stderr=subprocess.STDOUT,start_new_session=True)
        for _ in range(60):
            status,_=get("http://127.0.0.1:5173/",1)
            if status==200:break
            time.sleep(.25)
    print("SCIIP_APP_BOOTSTRAPPED:",started);print("SCIIP_APP_HTTP_STATUS:",status)
    cdp,_=get("http://127.0.0.1:9333/json/version",1);print("CDP_HTTP_STATUS:",cdp)
    if status!=200 or cdp!=200:
        print("STATUS: BLOCKED\nREASON: runtime or CDP unavailable");return 4

    spec=importlib.util.spec_from_file_location("r29a_live",selector);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    raw=[];origin=None;err=None
    # Fresh-page bootstrap is deliberately separate from selector mutation.
    try:
        targets=json.loads(urllib.request.urlopen("http://127.0.0.1:9333/json",timeout=1).read())
        app=[x for x in targets if x.get("type")=="page" and str(x.get("url","")).startswith("http://127.0.0.1:5173")]
        if not app:
            urllib.request.urlopen("http://127.0.0.1:9333/json/new?http://127.0.0.1:5173/",timeout=2).read()
        time.sleep(1.0)
        raw,origin=mod.live_inventory()
    except Exception as e:
        err={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}
    print("LIVE_INVENTORY_ERROR:",json.dumps(err))
    print("LIVE_INVENTORY_COUNT:",len(raw))
    print("LIVE_INVENTORY_ORIGIN:",origin)

    # The live inventory is the authoritative ordered candidate surface. Use its
    # returned order rather than assuming historical domOrdinal continuity.
    rows=[]
    for i,x in enumerate(raw,1):
        y=mod.marker_identity(x)
        rows.append({"liveOrdinal":i,"key":key(y) or key(x),"record":y})
    print("LIVE_ORDINALS_185_415:")
    for r in rows:
        if 185<=r["liveOrdinal"]<=415:print(json.dumps(r,default=str))

    pkeys={key(x) for x in prior or []}; nkeys={key(x) for x in new or []}
    overlap=pkeys&nkeys
    new194=nkeys-overlap
    # Find first six live records not in prior and not already in the 194 valid new members,
    # preserving live authoritative order.
    succ=[]
    for r in rows:
        if not r["key"] or r["key"] in pkeys or r["key"] in new194:continue
        succ.append(r)
        if len(succ)==6:break
    corrected=new194|{x["key"] for x in succ}
    print("OVERLAP_COUNT:",len(overlap))
    print("VALID_NEW194_COUNT:",len(new194))
    print("SUCCESSOR_SIX:",json.dumps(succ,indent=2,default=str))
    print("SUCCESSOR_SIX_COUNT:",len(succ))
    print("CORRECTED_NEW_COUNT:",len(corrected))
    print("CORRECTED_REFERENCE_UNION_COUNT:",len(pkeys|corrected))
    resolved=len(succ)==6 and len(corrected)==200 and not(corrected&pkeys) and len(pkeys|corrected)==400
    classification=("SUCCESSOR_SIX_CANONICALLY_RESOLVED_FROM_FRESH_LIVE_EXPLORER_ORDER_REFERENCE400_RECONSTRUCTABLE"
                    if resolved else "SUCCESSOR_SIX_TARGETED_LIVE_RESOLUTION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R6_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION"
         if resolved else "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R1_LIVE_INVENTORY_SETTLE_RESIDUAL_DIAGNOSIS")
    ev={"framework":"SCIIP_EXPLORER_4_R29A_R1_R5_SUCCESSOR_SIX_TARGETED_LIVE_INVENTORY_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if raw else "DIAGNOSTIC_COMPLETE","runtimeHttpStatus":status,"cdpHttpStatus":cdp,"liveError":err,
        "liveInventoryCount":len(raw),"overlapCount":len(overlap),"validNew194Count":len(new194),"successorSix":succ,
        "correctedNewCount":len(corrected),"correctedReferenceUnionCount":len(pkeys|corrected),
        "classification":classification,"nextMilestone":nxt,
        "safety":{"applicationMutation":False,"governedMutation":False,"propertyClick":False,"assignments":False,"generate":False,"export":False}}
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")
    print("CLASSIFICATION:",classification);print("STATUS:",ev["status"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep)
    print("R29A R1-R5 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__":raise SystemExit(main())
