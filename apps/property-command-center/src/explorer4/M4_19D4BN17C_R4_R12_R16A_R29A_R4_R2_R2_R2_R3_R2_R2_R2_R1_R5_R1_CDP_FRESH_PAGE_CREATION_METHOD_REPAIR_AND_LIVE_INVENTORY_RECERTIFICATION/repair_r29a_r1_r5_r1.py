#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,time,urllib.request,urllib.error,subprocess,importlib.util,traceback

R28A3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28A4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R1_CDP_FRESH_PAGE_CREATION_METHOD_REPAIR_AND_LIVE_INVENTORY_RECERTIFICATION"

def req(url,method="GET",timeout=2):
    r=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(r,timeout=timeout) as x:
        return x.status,x.read()

def safe(url,method="GET",timeout=2):
    try:return req(url,method,timeout)
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
    out=er/OUT;out.mkdir(parents=True,exist_ok=True);ep=out/"cdp_fresh_page_creation_method_repair_and_live_inventory_recertification.json"
    prior=loadj(er/R28A3/"exact_new_two_hundred_candidates.json")
    new=loadj(er/R28A4/"exact_new_two_hundred_candidates_prefix_normalized.json")
    selector=pcc/"src/explorer4"/R29A/"select_r29a.py"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A R1-R5-R1 CDP Fresh-Page Creation Method Repair + Live Inventory Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    app_status,_=safe("http://127.0.0.1:5173/",timeout=1)
    started=False; log="/tmp/sciip-r29a-r1-r5-r1-vite.log"
    if app_status!=200:
        started=True
        lf=open(log,"w")
        subprocess.Popen(["npm","run","dev","--","--host","127.0.0.1","--port","5173"],cwd=pcc,
                         stdout=lf,stderr=subprocess.STDOUT,start_new_session=True)
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
        return 4

    new_url="http://127.0.0.1:9333/json/new?http://127.0.0.1:5173/"
    get_status=None; get_error=None
    try:
        get_status,_=req(new_url,"GET",2)
    except urllib.error.HTTPError as e:
        get_status=e.code; get_error=str(e)
    except Exception as e:
        get_error=repr(e)
    print("CDP_JSON_NEW_GET_STATUS:",get_status)
    print("CDP_JSON_NEW_GET_ERROR:",get_error)

    put_status=None; put_body=None; put_error=None
    try:
        put_status,b=req(new_url,"PUT",2)
        put_body=json.loads(b)
    except Exception as e:
        put_error=repr(e)
    print("CDP_JSON_NEW_PUT_STATUS:",put_status)
    print("CDP_JSON_NEW_PUT_CREATED:",isinstance(put_body,dict) and bool(put_body.get("webSocketDebuggerUrl")))
    print("CDP_JSON_NEW_PUT_ERROR:",put_error)

    time.sleep(1.0)
    spec=importlib.util.spec_from_file_location("r29a_live_r5r1",selector)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    raw=[];origin=None;live_error=None
    try:
        raw,origin=mod.live_inventory()
    except Exception as e:
        live_error={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

    print("LIVE_INVENTORY_ERROR:",json.dumps(live_error))
    print("LIVE_INVENTORY_COUNT:",len(raw))
    print("LIVE_INVENTORY_ORIGIN:",origin)

    rows=[]
    for i,x in enumerate(raw,1):
        y=mod.marker_identity(x)
        rows.append({"liveOrdinal":i,"key":key(y) or key(x),"record":y})
    print("LIVE_BOUNDARY_ORDINALS_185_415:")
    for r in rows:
        if 185<=r["liveOrdinal"]<=415:
            print(json.dumps(r,default=str))

    pkeys={key(x) for x in prior or [] if key(x)}
    nkeys={key(x) for x in new or [] if key(x)}
    overlap=pkeys & nkeys
    valid194=nkeys-overlap

    successors=[]
    for r in rows:
        if not r["key"] or r["key"] in pkeys or r["key"] in valid194:continue
        successors.append(r)
        if len(successors)==6:break

    corrected=valid194|{r["key"] for r in successors}
    successor_resolved=(len(successors)==6 and len(corrected)==200 and not(corrected&pkeys) and len(pkeys|corrected)==400)

    print("OVERLAP_COUNT:",len(overlap))
    print("VALID_NEW194_COUNT:",len(valid194))
    print("SUCCESSOR_SIX:",json.dumps(successors,indent=2,default=str))
    print("SUCCESSOR_SIX_COUNT:",len(successors))
    print("CORRECTED_NEW_COUNT:",len(corrected))
    print("CORRECTED_REFERENCE_UNION_COUNT:",len(pkeys|corrected))
    print("SUCCESSOR_SIX_RESOLVED:",successor_resolved)

    if successor_resolved:
        classification="CDP_NEW_PAGE_GET_405_REPAIRED_WITH_PUT_SUCCESSOR_SIX_RESOLVED_REFERENCE400_RECONSTRUCTABLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R6_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION"
        status="PASSED"
    elif live_error:
        classification="CDP_NEW_PAGE_METHOD_REPAIRED_BUT_LIVE_INVENTORY_SETTLE_RESIDUAL_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R2_LIVE_INVENTORY_SETTLE_DEEP_DIAGNOSIS"
        status="DIAGNOSTIC_COMPLETE"
    else:
        classification="LIVE_INVENTORY_RESOLVED_BUT_SUCCESSOR_SIX_SELECTION_CONTRACT_NOT_YET_MET"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R2_SUCCESSOR_SIX_SELECTION_CONTRACT_DEEP_DIAGNOSIS"
        status="DIAGNOSTIC_COMPLETE"

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R1_R5_R1_CDP_FRESH_PAGE_CREATION_METHOD_REPAIR_AND_LIVE_INVENTORY_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "classification":classification,
      "runtime":{"appBootstrapped":started,"appHttpStatus":app_status,"cdpHttpStatus":cdp_status},
      "cdpNewPage":{"getStatus":get_status,"getError":get_error,"putStatus":put_status,
                    "putCreated":isinstance(put_body,dict) and bool(put_body.get("webSocketDebuggerUrl")),
                    "putError":put_error},
      "live":{"error":live_error,"origin":origin,"count":len(raw)},
      "cohort":{"overlapCount":len(overlap),"validNew194Count":len(valid194),"successorSix":successors,
                "correctedNewCount":len(corrected),"correctedReferenceUnionCount":len(pkeys|corrected),
                "successorSixResolved":successor_resolved},
      "safety":{"applicationSourceMutation":False,"governedDataMutation":False,"propertyClick":False,
                "assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False},
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")
    print("CLASSIFICATION:",classification)
    print("STATUS:",status)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("R29A R1-R5-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
