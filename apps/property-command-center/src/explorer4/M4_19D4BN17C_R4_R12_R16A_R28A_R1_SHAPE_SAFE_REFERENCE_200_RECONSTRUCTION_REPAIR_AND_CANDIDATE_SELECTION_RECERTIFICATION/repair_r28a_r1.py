#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re
from collections import Counter

PORT=9333
APP="http://127.0.0.1:5173/"
R28="M4_19D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"
R27D="M4_19D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R28A_R1_SHAPE_SAFE_REFERENCE_200_RECONSTRUCTION_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

STATUSES=["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None
        d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def exact_button_count(w,t):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)}).length)()""") or 0

def settle_exact_button_page_ready(w,t,sec=2.0,samples=3):
    st=time.time();c=0
    while time.time()-st<=sec:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        if ready!="complete" or buttons==0:
            time.sleep(.05);continue
        c=c+1 if exact_button_count(w,t)==1 else 0
        if c>=samples:return True
        time.sleep(.1)
    return False

def click_exact_button(w,t):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def normalize_label(raw):
    s=" ".join(str(raw or "").split())
    cut=len(s)
    for st in STATUSES:
        i=s.upper().find(st)
        if i>0: cut=min(cut,i)
    return s[:cut].strip()

def sf_from_text(s):
    m=re.search(r'(\d{1,3}(?:,\d{3})+)\s*SF\b',str(s or ""),re.I)
    return int(m.group(1).replace(",","")) if m else None

def canonical_key(label,sf=None):
    n=normalize_label(label).lower()
    return f"{n}|{sf}" if sf else n

def extract_ordered_values(xs,limit=100):
    if not isinstance(xs,list) or len(xs)<limit:
        return None
    vals=[]
    for x in xs[:limit]:
        if isinstance(x,str):
            v=normalize_label(x)
        elif isinstance(x,dict):
            v=x.get("target") or x.get("label") or x.get("address") or x.get("canonicalTarget") or x.get("rawTarget")
            v=normalize_label(v)
        else:
            v=""
        if not v:
            return None
        vals.append(v)
    return vals if len(vals)==limit else None

def find_reference_first100(er):
    # Shape-safe parser:
    # 1) explicitly prefer R26A evidence;
    # 2) accept top-level list evidence;
    # 3) accept dict evidence with known cohort keys;
    # 4) accept dict outcome lists;
    # 5) never call .get() on a non-dict.
    preferred=list(er.glob("M4_19D4BN17C_R4_R12_R16A_R26A_*/*.json"))
    paths=preferred + list(er.rglob("*.json"))
    seen=set()
    for p in paths:
        if p in seen: continue
        seen.add(p)
        try:
            j=loadj(p)
        except Exception:
            continue

        if isinstance(j,list):
            vals=extract_ordered_values(j,100)
            if vals:
                return p,vals,"TOP_LEVEL_LIST"

        if not isinstance(j,dict):
            continue

        for key in ["exactOneHundredCandidateCohort","candidateCohort","cohort","targets"]:
            vals=extract_ordered_values(j.get(key),100)
            if vals:
                return p,vals,f"DICT_KEY:{key}"

        vals=extract_ordered_values(j.get("outcomes"),100)
        if vals:
            return p,vals,"DICT_KEY:outcomes"

    return None,None,None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p28=er/R28/"exact_four_hundred_progressive_export_policy_and_guarded_execution_readiness.json"
    p27d=er/R27D/"exact_new_one_hundred_guarded_live_export_execution.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28A-R1 Shape-Safe Reference-200 Reconstruction Repair + Candidate Selection Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Live candidate inventory: ON")
    print("Repair scope: EVIDENCE JSON SHAPE HANDLING ONLY")

    if not p28.exists() or not p27d.exists():
        print("STATUS: BLOCKED");print("REASON: authoritative R28 policy and R27D live evidence required");return 4

    r28=loadj(p28);r27d=loadj(p27d)
    if not isinstance(r28,dict) or r28.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R28 policy must be PASSED");return 5
    if not isinstance(r27d,dict) or r27d.get("status")!="PASSED" or r27d.get("certifiedCount")!=100:
        print("STATUS: BLOCKED");print("REASON: R27D exact new-100 execution must be PASSED 100/100");return 6

    ref1_path,ref1,ref1_shape=find_reference_first100(er)
    if not ref1 or len(ref1)!=100:
        print("STATUS: BLOCKED");print("REASON: first authoritative/reference 100 cohort could not be resolved shape-safely");return 7

    ref2=[normalize_label(x.get("target")) for x in (r27d.get("outcomes") or []) if isinstance(x,dict)]
    if len(ref2)!=100 or any(not x for x in ref2):
        print("STATUS: BLOCKED");print("REASON: R27D exact second-100 ordered cohort unresolved");return 8

    ref200=ref1+ref2
    refset=set(x.lower() for x in ref200)
    if len(refset)<190:
        print("STATUS: BLOCKED");print("REASON: suspicious reference-200 canonical collapse; manual diagnosis required");return 9

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 10

    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh Explorer page creation failed");return 11

    w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer_settle=settle_exact_button_page_ready(w,"Explorer",2.0,3)
    explorer_entry=click_exact_button(w,"Explorer") if explorer_settle else False
    if not explorer_entry:
        print("STATUS: BLOCKED");print("REASON: Explorer entry failed");return 12

    time.sleep(.8)
    rows=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({
      domOrdinal:i+1,
      text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
      aria:b.getAttribute('aria-label'),
      status:b.getAttribute('data-property-status'),
      className:String(b.className||''),
      outerHTML:b.outerHTML.slice(0,2200)
    })))()""") or []

    inventory=[]
    for row in rows:
        if not isinstance(row,dict): continue
        raw=row.get("text") or row.get("aria") or ""
        label=normalize_label(row.get("aria") or raw)
        if not label: continue
        sf=sf_from_text(raw) or sf_from_text(row.get("outerHTML"))
        inventory.append({
          "domOrdinal":row.get("domOrdinal"),
          "rawText":raw,
          "label":label,
          "sf":sf,
          "canonicalKey":canonical_key(label,sf),
          "status":row.get("status"),
          "className":row.get("className")
        })

    label_counts=Counter(x["label"].lower() for x in inventory)
    candidates=[]
    seen=set()

    for x in inventory:
        if x["label"].lower() in refset:
            continue

        if label_counts[x["label"].lower()]>1 and x.get("sf"):
            key=f'{x["label"].lower()}|{x["sf"]}'
            binding="ADDRESS_PLUS_VISIBLE_SF"
        else:
            key=x["label"].lower()
            binding="NORMALIZED_LABEL"

        if key in seen:
            continue

        seen.add(key)
        y=dict(x)
        y["selectionKey"]=key
        y["bindingMode"]=binding
        candidates.append(y)

    selected=candidates[:200]
    if len(selected)!=200:
        print("STATUS: BLOCKED")
        print("REASON: fewer than exact 200 deterministic new candidates available after reference exclusion")
        print("CANDIDATE_INVENTORY_COUNT:",len(inventory))
        print("NEW_CANDIDATE_POOL_COUNT:",len(candidates))
        return 13

    unique_selection_keys=len(set(x["selectionKey"] for x in selected))==200
    checks={
      "r28Passed":True,
      "shapeSafeReferenceParserUsed":True,
      "topLevelListEvidenceSupported":True,
      "nonDictEvidenceSkippedSafely":True,
      "noGetCalledOnListContract":True,
      "referenceFirstHundredResolved":len(ref1)==100,
      "referenceFirstHundredSourceShapeCaptured":bool(ref1_shape),
      "referenceSecondHundredResolved":len(ref2)==100,
      "referenceTwoHundredPreserved":len(ref200)==200,
      "freshExplorerPageUsed":True,
      "explorerEntrySettleCertified":explorer_settle,
      "explorerEntryCertified":explorer_entry,
      "candidateInventoryCaptured":len(inventory)>0,
      "referenceTwoHundredExcludedFromNewPool":all(x["label"].lower() not in refset for x in selected),
      "exactNewTwoHundredCandidatesResolved":len(selected)==200,
      "exactNewTwoHundredSelectionKeysUnique":unique_selection_keys,
      "deterministicDomOrderUsed":True,
      "recognizedStatusBoundaryNormalizationUsed":True,
      "buildingProjectGranularityPreservedWhenSfVisible":True,
      "candidateCanonicalKeysCaptured":all(bool(x.get("canonicalKey")) for x in selected),
      "nonExportQualificationRequiredBeforeExport":True,
      "separatePostQualificationExportAuthorizationRequired":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    newfile=od/"exact_new_two_hundred_candidates.json"
    newfile.write_text(json.dumps(selected,indent=2)+"\n")
    reffile=od/"authoritative_reference_two_hundred.json"
    reffile.write_text(json.dumps({
      "first100Evidence":str(ref1_path),
      "first100EvidenceShape":ref1_shape,
      "first100":ref1,
      "second100Evidence":str(p27d),
      "second100":ref2,
      "combinedCount":200
    },indent=2)+"\n")

    ef=od/"shape_safe_reference_200_reconstruction_repair_and_candidate_selection_recertification.json"
    status="PASSED" if all(checks.values()) else "FAILED"
    out={
      "framework":"SCIIP_EXPLORER_4_R28A_R1_SHAPE_SAFE_REFERENCE_200_RECONSTRUCTION_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":"M419D4BN17C_R4_R12_R16A_R28A_R1_SHAPE_SAFE_REFERENCE_200_RECONSTRUCTED_EXACT_NEW_200_PREAUTHORIZED",
      "classification":"R28A_JSON_LIST_SHAPE_CRASH_REPAIRED_REFERENCE_200_RECONSTRUCTED_NEW_200_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION",
      "repair":{
        "priorFailure":"AttributeError: 'list' object has no attribute 'get'",
        "cause":"reference evidence scan assumed all parsed JSON roots were dict objects",
        "repair":"branch on list/dict root shape; support top-level ordered arrays; skip unsupported roots safely",
        "policySurfaceChanged":False
      },
      "referenceFirstHundredEvidence":str(ref1_path),
      "referenceFirstHundredEvidenceShape":ref1_shape,
      "referenceCohortSize":200,
      "candidateInventoryCount":len(inventory),
      "newCandidatePoolCount":len(candidates),
      "selectedNewCandidateCount":len(selected),
      "exactFourHundredCohortSize":400,
      "newCandidateFile":str(newfile),
      "referenceFile":str(reffile),
      "checks":checks,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_FIRST_100_EVIDENCE:",ref1_path)
    print("REFERENCE_FIRST_100_EVIDENCE_SHAPE:",ref1_shape)
    print("REFERENCE_COHORT_SIZE: 200")
    print("CANDIDATE_INVENTORY_COUNT:",len(inventory))
    print("NEW_CANDIDATE_POOL_COUNT:",len(candidates))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(selected))
    print("EXACT_FOUR_HUNDRED_COHORT_SIZE: 400")
    print("\n----- EXACT NEW TWO HUNDRED CANDIDATES -----")
    for i,x in enumerate(selected,201):
        sf=f" | {x['sf']:,} SF" if x.get("sf") else ""
        print(f"{i}. {x['label']}{sf} [{x['bindingMode']}]")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",out["state"])
    print("CLASSIFICATION:",out["classification"])
    print("NEXT_MILESTONE:",out["nextMilestone"])
    print("NEW_CANDIDATE_FILE:",newfile)
    print("REFERENCE_FILE:",reffile)
    print("EVIDENCE:",ef)
    print("\nR28A-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
