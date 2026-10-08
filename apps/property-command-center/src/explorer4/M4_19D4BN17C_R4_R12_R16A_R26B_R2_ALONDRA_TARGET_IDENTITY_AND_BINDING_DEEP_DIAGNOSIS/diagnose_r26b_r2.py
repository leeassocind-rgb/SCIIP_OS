#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R1="M4_19D4BN17C_R4_R12_R16A_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
R1_CLASS="THIRTY_FIRST_RECORD_EXPLORER_SETTLED_BUT_TARGET_BINDING_DID_NOT_SETTLE_PRE_SELECTION"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSIS"
TARGET="112 W Alondra Blvd"
PORT=9333
APP="http://127.0.0.1:5173/"

STATUS_RE=r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
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

def settle_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R1/"non_export_live_qualification_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2 Alondra Target Identity + Binding Deep Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_IDENTITY_BINDING_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R1_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R1_STATE or d.get("classification")!=R1_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R1_CERTIFIED_RESIDUAL_REQUIRED");return 5
    if d.get("failureTarget")!=TARGET:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPECTED_ALONDRA_TARGET_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        es=settle_exact(w,"Explorer",2.0,3)
        ee=click_exact(w,"Explorer") if es else {}
        if not es or not ee.get("clicked"):
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_REQUIRED");return 9

        samples=[]
        t0=time.time()
        for delay in [0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0,4.0,5.0]:
            while time.time()-t0<delay: time.sleep(0.01)
            v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim();
const q=ns({json.dumps(TARGET)}).toLowerCase();
const re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
  const text=ns(b.innerText||b.textContent||'');
  const m=re.exec(text); const label=m?text.slice(0,m.index).trim():text;
  return{{text,label,full:text.toLowerCase(),norm:label.toLowerCase(),cls:String(b.className||'')}};
}});
const exact=rows.filter(x=>x.full===q);
const norm=rows.filter(x=>x.norm===q);
const contains=rows.filter(x=>x.full.includes(q));
const alondra=rows.filter(x=>x.full.includes('alondra'));
const marker=[...document.querySelectorAll('.sciip-property-marker')].filter(b=>b.offsetParent!==null).map(b=>ns(b.innerText||b.textContent||'')).filter(x=>x.toLowerCase().includes('alondra'));
return{{exactCount:exact.length,normalizedCount:norm.length,containsCount:contains.length,
exactTexts:exact.map(x=>x.text),normalizedTexts:norm.map(x=>x.text),containsTexts:contains.map(x=>x.text),
alondraCount:alondra.length,alondraTexts:alondra.map(x=>x.text),alondraLabels:alondra.map(x=>x.label),
markerCount:marker.length,markerTexts:marker,buttonCount:rows.length,bodyHasTarget:(document.body?.innerText||'').toLowerCase().includes(q)}};
}})()""") or {}
            v["t"]=delay;samples.append(v)

        alltexts=[]
        for s in samples:
            alltexts.extend(s.get("alondraTexts") or [])
        uniq=[]
        seen=set()
        for x in alltexts:
            if x not in seen:seen.add(x);uniq.append(x)

        exact_seen=any(s.get("exactCount",0)>0 for s in samples)
        norm_seen=any(s.get("normalizedCount",0)>0 for s in samples)
        contains_seen=any(s.get("containsCount",0)>0 for s in samples)
        marker_seen=any(s.get("markerCount",0)>0 for s in samples)

        first_norm=next((s["t"] for s in samples if s.get("normalizedCount")==1),None)
        first_contains=next((s["t"] for s in samples if s.get("containsCount")==1),None)

        # classify based on observed binding surface without clicking
        if norm_seen:
            classification="ALONDRA_CANONICAL_IDENTITY_MATERIALIZES_AND_IS_BOUNDARY_NORMALIZED_BINDABLE_PRIOR_R26B_FAILURE_TRANSIENT"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R3_ALONDRA_BOUNDED_BINDING_RECERTIFICATION_AND_FIFTY_RECORD_NON_EXPORT_RESUME"
        elif contains_seen:
            classification="ALONDRA_TARGET_PRESENT_ONLY_AS_UNIQUE_CONTAINS_BINDING"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_BINDING_BOUNDARY_REPAIR_DESIGN"
        else:
            classification="ALONDRA_TARGET_NOT_MATERIALIZED_WITHIN_FIVE_SECOND_BINDING_WINDOW"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_MATERIALIZATION_CAUSAL_DIAGNOSIS"

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSED",
          "classification":classification,
          "target":TARGET,
          "explorerSettleCertified":es,
          "explorerEntryCertified":ee.get("clicked") is True,
          "exactBindingEverObserved":exact_seen,
          "boundaryNormalizedBindingEverObserved":norm_seen,
          "uniqueContainsBindingEverObserved":contains_seen,
          "targetMarkerEverObserved":marker_seen,
          "firstBoundaryNormalizedBindingSeconds":first_norm,
          "firstUniqueContainsBindingSeconds":first_contains,
          "alondraButtonTextsObserved":uniq,
          "samples":samples,
          "authority":{"propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,
                       "exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,
                       "networkAuthority":False,"pixelEvidence":False},
          "sourceEvidence":{"r26bR1Path":str(p),"r26bR1Sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
          "nextMilestone":nxt
        }
        od=evid/M;od.mkdir(parents=True,exist_ok=True)
        ef=od/"alondra_target_identity_and_binding_deep_diagnosis.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET:",TARGET)
        print("EXPLORER_SETTLE_CERTIFIED:",es)
        print("EXPLORER_ENTRY_CERTIFIED:",ee.get("clicked") is True)
        print("EXACT_BINDING_EVER_OBSERVED:",exact_seen)
        print("BOUNDARY_NORMALIZED_BINDING_EVER_OBSERVED:",norm_seen)
        print("UNIQUE_CONTAINS_BINDING_EVER_OBSERVED:",contains_seen)
        print("TARGET_MARKER_EVER_OBSERVED:",marker_seen)
        print("FIRST_BOUNDARY_NORMALIZED_BINDING_SECONDS:",first_norm)
        print("FIRST_UNIQUE_CONTAINS_BINDING_SECONDS:",first_contains)
        print("\n----- ALONDRA BUTTON TEXTS -----")
        for x in uniq: print(x)
        print("\n----- TIMING SAMPLES -----")
        for s in samples: print(json.dumps(s,ensure_ascii=False))
        print("\nCLASSIFICATION:",classification)
        print("STATUS: PASSED")
        print("STATE:",out["state"])
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ef)
        return 0
    finally:
        try:w.call("Page.close")
        except:pass

if __name__=="__main__":
    raise SystemExit(main())
