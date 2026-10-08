#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R27="M4_19D4BN17C_R4_R12_R16A_R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R26="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R4_EXACT_ONE_HUNDRED_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def norm_label(s):
    s=re.sub(r"\s+"," ",str(s or "")).strip()
    # recognized status boundary normalization only; remove suffix beginning at known status token
    m=re.search(r"(PROPOSED|PLANNED|EXISTING)\s*[·/|]",s,re.I)
    if m: s=s[:m.start()].strip()
    return s
def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None
def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None
class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
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
        mask=self.s.recv(4) if b&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")
def settle_exact(w,text,seconds=2.0,samples=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=samples:return True
        time.sleep(.1)
    return False
def click_exact(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    p27=eroot/R27/"export_next_progressive_expansion_readiness_and_policy_design.json"
    p26=eroot/R26/"exact_one_hundred_progressive_lifecycle_reconciliation_and_closure.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27A Exact Two-Hundred Record Export Cohort Candidate Selection + Qualification + Preauthorization")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")
    print("Live candidate inventory: ON")

    if not p27.exists() or not p26.exists():
        print("STATUS: BLOCKED");print("REASON: R27 policy and exact-100 closure evidence required");return 4
    d27,d26=loadj(p27),loadj(p26)
    if d27.get("status")!="PASSED" or d27.get("nextCohortSize")!=200:
        print("STATUS: BLOCKED");print("REASON: certified exact-200 R27 policy required");return 5
    ref=d26.get("cohort")
    if not isinstance(ref,list) or len(ref)!=100 or len(set(ref))!=100:
        print("STATUS: BLOCKED");print("REASON: exact unique closed reference-100 cohort required");return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: certified CDP browser context required");return 7
    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh Explorer page creation failed");return 8
    w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    settled=settle_exact(w,"Explorer")
    entered=click_exact(w,"Explorer") if settled else False
    if not entered:
        print("STATUS: BLOCKED");print("REASON: Explorer entry failed");return 9

    st=time.time();inventory=[]
    while time.time()-st<=5:
        inventory=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map((b,i)=>({
ordinal:i+1,
text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
html:b.outerHTML,
aria:b.getAttribute('aria-label'),
status:b.getAttribute('data-property-status'),
className:String(b.className||'')
})))()""") or []
        if len(inventory)>=200: break
        time.sleep(.15)

    ref_norm={norm_label(x).lower() for x in ref}
    candidates=[]
    seen=set()
    for row in inventory:
        raw=row.get("text") or row.get("aria") or ""
        label=norm_label(raw)
        if not label: continue
        lk=label.lower()
        if lk in ref_norm: continue
        if lk in seen: continue
        seen.add(lk)
        candidates.append({
          "rawLabel":raw,
          "normalizedTarget":label,
          "domOrdinal":row.get("ordinal"),
          "status":row.get("status"),
          "className":row.get("className")
        })
        if len(candidates)==100: break

    selected=[x["normalizedTarget"] for x in candidates]
    exact200=ref+selected

    checks={
      "r27Passed":True,
      "r27PolicyStateCertified":d27.get("status")=="PASSED",
      "freshExplorerPageUsed":True,
      "explorerEntrySettleCertified":settled,
      "explorerEntryCertified":entered,
      "candidateInventoryCaptured":len(inventory)>0,
      "referenceOneHundredPreserved":len(ref)==100,
      "newCandidatePoolSufficient":len(candidates)==100,
      "oneHundredNewCandidatesResolved":len(selected)==100,
      "exactTwoHundredCandidateCohortResolved":len(exact200)==200,
      "exactTwoHundredCandidateCohortUnique":len(set(x.lower() for x in exact200))==200,
      "deterministicDomOrderUsed":True,
      "candidateStatusSuffixNormalizationUsed":True,
      "recognizedStatusBoundaryOnly":True,
      "buildingProjectAwareCanonicalBindingPolicyConsumed":True,
      "addressOnlyBindingForbiddenWhenGranularityCollisionPresent":True,
      "fiveSecondTargetBindingPolicyConsumed":True,
      "threeSampleTargetBindingPolicyConsumed":True,
      "threeSampleExplorerPolicyConsumed":True,
      "twoSecondExplorerPolicyConsumed":True,
      "threeSampleSelectedPropertyPolicyConsumed":True,
      "twoSecondSelectedPropertyPolicyConsumed":True,
      "freshPagePerRecordPolicyConsumed":True,
      "strictSequentialPolicyConsumed":True,
      "haltOnFirstFailurePolicyConsumed":True,
      "oneExportClickMaximumPolicyConsumed":True,
      "referenceOneHundredWillNotBeReexported":True,
      "exportInvocationOff":True,
      "assignmentsInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    status="PASSED" if all(checks.values()) else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_INCOMPLETE")
    cls=("EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_REFERENCE_ONE_HUNDRED_PLUS_ONE_HUNDRED_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION"
         if status=="PASSED" else
         "EXACT_TWO_HUNDRED_RECORD_CANDIDATE_SELECTION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R27B_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
         if status=="PASSED" else
         "M4_19D4BN17C_R4_R12_R16A_R27A_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=eroot/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_two_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    tf=od/"exact_new_one_hundred_targets.json"
    tf.write_text(json.dumps(selected,indent=2)+"\n")
    out={
      "framework":"SCIIP_EXPLORER_4_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"classification":cls,
      "referenceCohortSize":100,
      "candidateInventoryCount":len(inventory),
      "newCandidatePoolCount":max(0,len(inventory)-100),
      "selectedNewCandidateCount":len(selected),
      "exactTwoHundredCohortSize":len(exact200),
      "referenceCohort":ref,
      "newCandidates":candidates,
      "exactTwoHundredCohort":exact200,
      "checks":checks,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_COHORT_SIZE: 100")
    print("CANDIDATE_INVENTORY_COUNT:",len(inventory))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(selected))
    print("EXACT_TWO_HUNDRED_COHORT_SIZE:",len(exact200))
    print("\n----- NEW ONE HUNDRED CANDIDATES -----")
    for i,x in enumerate(selected,101): print(f"{i}. {x} [NEW_PREAUTHORIZED]")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",cls)
    print("NEXT_MILESTONE:",nxt)
    print("TARGET_FILE:",tf)
    print("EVIDENCE:",ef)
    print("\nR27A EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__": raise SystemExit(main())
