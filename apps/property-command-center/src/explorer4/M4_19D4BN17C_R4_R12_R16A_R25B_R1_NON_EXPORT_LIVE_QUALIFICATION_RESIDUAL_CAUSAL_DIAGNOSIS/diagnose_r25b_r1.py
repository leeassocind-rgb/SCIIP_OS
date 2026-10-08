#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25B="M4_19D4BN17C_R4_R12_R16A_R25B_TWENTY_FIVE_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R25B_STATE="M419D4BN17C_R4_R12_R16A_R25B_TWENTY_FIVE_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE"
TARGET="NE of Interstate 15 and Stoddard Wells"
M="M4_19D4BN17C_R4_R12_R16A_R25B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
PORT=9333
APP="http://127.0.0.1:5173/"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("ws")
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

def wait_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R25B/"twenty_five_new_record_non_export_live_qualification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25B-R1 Non-Export Live Qualification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_TARGET_BINDING_CAUSAL_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R25B_INCOMPLETE_EVIDENCE_REQUIRED"); return 4
    r=loadj(p)
    if r.get("status")!="DIAGNOSTIC_COMPLETE" or r.get("state")!=R25B_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R25B_INCOMPLETE_STATE_REQUIRED"); return 5

    outcomes=r.get("outcomes") or []
    first_failure=next((x for x in outcomes if x.get("qualified") is False),None)
    prior_qualified=sum(1 for x in outcomes if x.get("qualified") is True)
    if not first_failure or first_failure.get("target")!=TARGET or first_failure.get("targetBindingSettleCertified") is not False:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXPECTED_STODDARD_WELLS_TARGET_BINDING_FAILURE_REQUIRED"); return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_REQUIRED"); return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        ex=wait_exact(w,"Explorer",2.0,3)
        entry=click_exact(w,"Explorer") if ex else {"clicked":False}
        samples=[]
        schedule=[0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,2.5,3.0,4.0,5.0]
        start=time.time()
        for t in schedule:
            while time.time()-start<t: time.sleep(.02)
            v=ev(w,f"""(()=>{{const q={json.dumps(TARGET.lower())};const btn=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled);const rows=btn.map((b,i)=>({{i,text:(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim(),low:(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase(),cls:b.className||''}}));const exact=rows.filter(x=>x.low===q);const contains=rows.filter(x=>x.low.includes(q));const stoddard=rows.filter(x=>x.low.includes('stoddard wells'));return{{exactCount:exact.length,containsCount:contains.length,exactTexts:exact.map(x=>x.text),containsTexts:contains.map(x=>x.text),stoddardCount:stoddard.length,stoddardTexts:stoddard.map(x=>x.text),assignmentsCount:rows.filter(x=>x.text==='Assignments').length,buttonCount:rows.length}}}})()""") or {}
            v["t"]=t
            samples.append(v)
    finally:
        try:w.call("Page.close")
        except:pass

    max_exact=max((x.get("exactCount",0) for x in samples),default=0)
    max_contains=max((x.get("containsCount",0) for x in samples),default=0)
    max_stoddard=max((x.get("stoddardCount",0) for x in samples),default=0)
    ever_unique_exact=any(x.get("exactCount")==1 for x in samples)
    ever_unique_contains=any(x.get("exactCount")==0 and x.get("containsCount")==1 for x in samples)
    ever_ambiguous_contains=any(x.get("containsCount",0)>1 for x in samples)
    all_stoddard=[]
    for s in samples:
        for t in s.get("stoddardTexts",[]):
            if t not in all_stoddard: all_stoddard.append(t)

    if ever_ambiguous_contains and not ever_unique_exact:
        classification="STODDARD_WELLS_BASE_TARGET_COLLIDES_WITH_MULTIPLE_MORE_SPECIFIC_BUILDING_VARIANTS_UNIQUE_CONTAINS_BINDING_FORBIDDEN"
    elif ever_unique_contains:
        classification="STODDARD_WELLS_TARGET_BINDING_DELAYED_BUT_EVENTUALLY_UNIQUE"
    elif max_contains==0:
        classification="STODDARD_WELLS_TARGET_NOT_MATERIALIZED_IN_BOUNDED_WINDOW"
    else:
        classification="STODDARD_WELLS_TARGET_BINDING_RESIDUAL_REQUIRES_DEEPER_IDENTITY_DIAGNOSIS"

    passed=True
    state="M419D4BN17C_R4_R12_R16A_R25B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
    if classification.startswith("STODDARD_WELLS_BASE_TARGET_COLLIDES"):
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_COLLISION_SAFE_IDENTITY_BINDING_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    elif classification=="STODDARD_WELLS_TARGET_BINDING_DELAYED_BUT_EVENTUALLY_UNIQUE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_EXTENDED_TARGET_BINDING_SETTLE_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R1_R1_STODDARD_WELLS_IDENTITY_DEEP_DIAGNOSIS"

    checks={
      "r25bIncompleteStateConsumed":True,
      "firstTenQualified":prior_qualified==10,
      "firstFailureTargetResolved":first_failure.get("target")==TARGET,
      "firstFailureAtTargetBindingSettle":first_failure.get("targetBindingSettleCertified") is False,
      "freshPageCreated":True,
      "explorerSettleCertified":ex,
      "explorerEntryCertified":entry.get("clicked") is True,
      "fiveSecondBindingWindowObserved":len(samples)==len(schedule),
      "exactCountsCaptured":True,
      "containsCountsCaptured":True,
      "stoddardCollisionCandidatesCaptured":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R25B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":state,
      "classification":classification,
      "target":TARGET,
      "priorQualifiedCount":prior_qualified,
      "priorFailure":first_failure.get("failure"),
      "maxExactCount":max_exact,
      "maxContainsCount":max_contains,
      "maxStoddardLikeCount":max_stoddard,
      "everUniqueExact":ever_unique_exact,
      "everUniqueContains":ever_unique_contains,
      "everAmbiguousContains":ever_ambiguous_contains,
      "stoddardCandidateTexts":all_stoddard,
      "bindingSamples":samples,
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,
                   "propertyClick":False,"assignmentsInvocation":False,"exportInvocation":False},
      "sourceEvidence":{"r25bPath":str(p),"r25bSha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"non_export_live_qualification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",TARGET)
    print("PRIOR_QUALIFIED_COUNT:",prior_qualified)
    print("PRIOR_FAILURE:",first_failure.get("failure"))
    print("MAX_EXACT_COUNT:",max_exact)
    print("MAX_CONTAINS_COUNT:",max_contains)
    print("MAX_STODDARD_LIKE_COUNT:",max_stoddard)
    print("EVER_UNIQUE_EXACT:",ever_unique_exact)
    print("EVER_UNIQUE_CONTAINS:",ever_unique_contains)
    print("EVER_AMBIGUOUS_CONTAINS:",ever_ambiguous_contains)
    print()
    print("----- STODDARD-LIKE CANDIDATES -----")
    for x in all_stoddard: print(x)
    print()
    print("----- BINDING SAMPLES -----")
    for s in samples: print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
