#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R2="M4_19D4BN17C_R4_R12_R16A_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSIS"
R2_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSED"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION_DIAGNOSIS"
TARGET="112 W Alondra Blvd"; PORT=9333; APP="http://127.0.0.1:5173/"
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
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("ws")
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
def settle(w,text):
    st=time.time();c=0
    while time.time()-st<=2:
        n=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        c=c+1 if n==1 else 0
        if c>=3:return True
        time.sleep(.1)
    return False
def click(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R2/"alondra_target_identity_and_binding_deep_diagnosis.json"
    print("="*120);print("SCIIP Explorer 4.0 — R26B-R2-R1 Alondra Duplicate Canonical Identity Disambiguation Diagnosis");print("="*120)
    print("Mode: SINGLE_RECORD_READ_ONLY_DUPLICATE_IDENTITY_DIAGNOSIS")
    print("Property click: OFF\nAssignments invocation: OFF\nGenerate invocation: OFF\nExport invocation: OFF")
    if not p.exists(): print("STATUS: BLOCKED\nDIAGNOSIS: R26B_R2_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R2_STATE: print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_R26B_R2_REQUIRED");return 5
    # Critical reconciliation: R2 saw binding surface, but its own samples prove two normalized candidates.
    mx=max([s.get("normalizedCount",0) for s in d.get("samples",[])]+[0])
    if mx<2: print("STATUS: BLOCKED\nDIAGNOSIS: DUPLICATE_NORMALIZED_IDENTITY_EVIDENCE_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"): print("STATUS: BLOCKED\nDIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"): print("STATUS: BLOCKED\nDIAGNOSIS: FRESH_PAGE_REQUIRED");return 8
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        if not settle(w,"Explorer") or not click(w,"Explorer"): print("STATUS: BLOCKED\nDIAGNOSIS: EXPLORER_ENTRY_REQUIRED");return 9
        time.sleep(.75)
        rows=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(TARGET.lower())},re=/{STATUS_RE}/i;
return [...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map((b,i)=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 if(label.toLowerCase()!==q)return null;
 const a={{ordinal:i,text,label,className:String(b.className||''),id:b.id||null,
 data:[...b.attributes].filter(x=>x.name.startsWith('data-')).reduce((o,x)=>(o[x.name]=x.value,o),{{}}),
 parentText:ns(b.parentElement?.innerText||''),parentClass:String(b.parentElement?.className||''),
 grandparentText:ns(b.parentElement?.parentElement?.innerText||''),grandparentClass:String(b.parentElement?.parentElement?.className||'')}};
 return a;
}}).filter(Boolean);
}})()""") or []
        texts=[r.get("text") for r in rows]
        unique_text=len(set(texts))==len(texts)
        # infer stable distinguishing tokens from visible labels only; no click.
        sf=[]
        for t in texts:
            m=re.search(r"·\s*([\d,]+)\s*SF",t or "")
            sf.append(m.group(1) if m else None)
        distinct_sf=len(set(sf))==len(sf) and None not in sf
        classification=("ALONDRA_ADDRESS_IDENTITY_COLLISION_TWO_DISTINCT_RECORDS_DISAMBIGUATABLE_BY_VISIBLE_SF"
                        if len(rows)==2 and distinct_sf else
                        "ALONDRA_ADDRESS_IDENTITY_COLLISION_REQUIRES_CANONICAL_RECORD_KEY_DISCOVERY")
        nxt=("M4_19D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_CANONICAL_RECORD_KEY_BINDING_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
             if len(rows)==2 and distinct_sf else
             "M4_19D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_CANONICAL_RECORD_KEY_DISCOVERY")
        out={"framework":"SCIIP_EXPLORER_4_R26B_R2_R1_ALONDRA_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION_DIAGNOSIS",
             "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
             "state":"M419D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION_DIAGNOSED",
             "classification":classification,"target":TARGET,"normalizedCandidateCount":len(rows),
             "visibleCandidates":rows,"visibleSfTokens":sf,"visibleSfTokensDistinct":distinct_sf,
             "r26bR2PriorClassification":d.get("classification"),
             "r26bR2PriorClassificationCorrected":True,
             "correctionReason":"R26B-R2 reported boundary-normalized binding observed, but its timing samples show normalizedCount=2; address-only binding is therefore ambiguous and cannot be certified.",
             "authority":{"propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False,
                          "applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
             "nextMilestone":nxt}
        od=evid/M;od.mkdir(parents=True,exist_ok=True);ef=od/"alondra_duplicate_canonical_identity_disambiguation_diagnosis.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")
        print("TARGET:",TARGET);print("NORMALIZED_CANDIDATE_COUNT:",len(rows));print("VISIBLE_SF_TOKENS:",sf);print("VISIBLE_SF_TOKENS_DISTINCT:",distinct_sf)
        print("\n----- DUPLICATE CANDIDATES -----")
        for r in rows: print(json.dumps(r,ensure_ascii=False))
        print("\nR26B_R2_PRIOR_CLASSIFICATION_CORRECTED: True")
        print("CORRECTION_REASON:",out["correctionReason"])
        print("CLASSIFICATION:",classification);print("STATUS: PASSED");print("STATE:",out["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
        return 0
    finally:
        try:w.call("Page.close")
        except:pass
if __name__=="__main__": raise SystemExit(main())
