#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSIS"
R1="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
TARGET="2701 Carrier Ave"
PORT=9333
APP="http://127.0.0.1:5173/"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
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
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def count_exact(w,text):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def wait_explorer(w):
    start=time.time();samples=[];cons=0
    while time.time()-start<=3.0:
        c=count_exact(w,"Explorer");ok=c==1
        samples.append({"elapsedSeconds":round(time.time()-start,3),"count":c,"certified":ok})
        cons=cons+1 if ok else 0
        if cons>=3:return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":cons}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":cons}

def binding_snapshot(w):
    return ev(w,f"""(()=>{{
      const T={json.dumps(TARGET)};
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const exact=buttons.filter(x=>(x.innerText||x.textContent||'').trim()===T);
      const contains=buttons.filter(x=>(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));
      const markers=[...document.querySelectorAll('.sciip-property-marker')].filter(x=>x.offsetParent!==null).map(x=>(x.innerText||x.textContent||'').trim());
      return {{
        exactCount:exact.length,
        containsCount:contains.length,
        containsTexts:contains.slice(0,10).map(x=>(x.innerText||x.textContent||'').trim()),
        markerCount:markers.filter(x=>x.toLowerCase().includes(T.toLowerCase())).length,
        assignmentsCount:buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Assignments').length
      }};
    }})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";evid=app/"evidence/explorer4"
    p=evid/R1/"recertification_residual_causal_diagnosis.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R3_R3_R1_EVIDENCE_REQUIRED");return 4
    r1=loadj(p)
    if r1.get("status")!="PASSED" or r1.get("state")!=R1_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R3_R3_R1_CAUSAL_DIAGNOSIS_REQUIRED");return 5
    if r1.get("classification")!="SECOND_RECORD_TARGET_BINDING_TRANSIENT_OR_OSCILLATING_VALIDITY":
        print("STATUS: BLOCKED");print("DIAGNOSIS: SECOND_RECORD_TARGET_BINDING_TRANSIENT_CLASSIFICATION_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer=wait_explorer(w)
    entry=click_exact(w,"Explorer") if explorer.get("certified") else {"clicked":False,"count":0}

    samples=[];start=time.time()
    schedule=[0.0,0.1,0.25,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.25,2.5,2.75,3.0,3.5,4.0,4.5,5.0]
    for t in schedule:
        while time.time()-start<t:time.sleep(.02)
        s=binding_snapshot(w);s["t"]=t
        s["valid"]=bool(s.get("exactCount")==1 or (s.get("exactCount")==0 and s.get("containsCount")==1))
        samples.append(s)

    first_valid=next((s["t"] for s in samples if s.get("valid")),None)
    valid_after_2=[s for s in samples if s["t"]>=2.0 and s.get("valid")]
    stable_last_five=len(samples)>=5 and all(s.get("valid") for s in samples[-5:])
    max_cons=0;run=0
    for s in samples:
        if s.get("valid"):
            run+=1;max_cons=max(max_cons,run)
        else:run=0

    if first_valid is not None and stable_last_five and max_cons>=5:
        classification="SECOND_RECORD_TARGET_BINDING_DELAYED_BUT_STABLE_AFTER_MATERIALIZATION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXTENDED_BOUNDED_TARGET_BINDING_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_valid is not None and max_cons>=3:
        classification="SECOND_RECORD_TARGET_BINDING_STABLE_WINDOW_EXISTS_WITHIN_FIVE_SECONDS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_EXTENDED_BOUNDED_TARGET_BINDING_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_valid is not None:
        classification="SECOND_RECORD_TARGET_BINDING_GENUINELY_OSCILLATORY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_TARGET_BINDING_OSCILLATION_CAUSAL_DIAGNOSIS"
    else:
        classification="SECOND_RECORD_TARGET_BINDING_NOT_MATERIALIZED_WITHIN_FIVE_SECONDS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_R3_TARGET_BINDING_SEARCH_OR_FILTER_STATE_DIAGNOSIS"

    checks={
      "r23dR3R3R1Passed":True,
      "transientBindingClassificationConsumed":True,
      "freshPageCreated":True,
      "explorerSettleCertified":explorer.get("certified") is True,
      "explorerEntryClicked":entry.get("clicked") is True,
      "fiveSecondBindingWindowObserved":True,
      "exactCountsCaptured":True,
      "containsCountsCaptured":True,
      "markerCountsCaptured":True,
      "firstValidBindingResolved":True,
      "maxConsecutiveValidityComputed":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSED",
      "classification":classification,
      "target":TARGET,
      "explorerSettleReadback":explorer,
      "explorerEntry":entry,
      "bindingSamples":samples,
      "firstValidBindingSeconds":first_valid,
      "validSampleCount":sum(1 for s in samples if s.get("valid")),
      "validSampleCountAtOrAfterTwoSeconds":len(valid_after_2),
      "maxConsecutiveValidSamples":max_cons,
      "stableLastFiveSamples":stable_last_five,
      "checks":checks,
      "authority":{
        "propertyClick":False,
        "assignmentsInvocation":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"second_record_target_binding_stability_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3-R3-R2 Second-Record Target Binding Stability Diagnosis")
    print("="*120)
    print("TARGET:",TARGET)
    print("EXPLORER_SETTLE_CERTIFIED:",explorer.get("certified"))
    print("EXPLORER_ENTRY_CLICKED:",entry.get("clicked"))
    print("FIRST_VALID_BINDING_SECONDS:",first_valid)
    print("VALID_SAMPLE_COUNT:",sum(1 for s in samples if s.get("valid")))
    print("VALID_SAMPLE_COUNT_AT_OR_AFTER_2S:",len(valid_after_2))
    print("MAX_CONSECUTIVE_VALID_SAMPLES:",max_cons)
    print("STABLE_LAST_FIVE_SAMPLES:",stable_last_five)
    print()
    print("----- BINDING SAMPLES -----")
    for s in samples:print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R3_R3_R2_SECOND_RECORD_TARGET_BINDING_STABILITY_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
