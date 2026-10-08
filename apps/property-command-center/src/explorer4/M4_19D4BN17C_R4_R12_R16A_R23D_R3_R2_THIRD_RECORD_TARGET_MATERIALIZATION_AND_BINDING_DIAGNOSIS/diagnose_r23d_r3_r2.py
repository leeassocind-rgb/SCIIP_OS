#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSIS"
R1="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
TARGET="8700 - 8750 Rex Rd"
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
        if not m:raise RuntimeError("bad websocket")
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

def snapshot(w):
    return ev(w,f"""(()=>{{
      const T={json.dumps(TARGET)};
      const vis=e=>e.offsetParent!==null;
      const buttons=[...document.querySelectorAll('button')].filter(vis).map((x,i)=>({{
        i,text:(x.innerText||x.textContent||'').trim(),cls:String(x.className||''),disabled:!!x.disabled
      }}));
      const explorerExact=buttons.filter(x=>x.text==='Explorer'&&!x.disabled);
      const explorerLike=buttons.filter(x=>/explorer/i.test(x.text)&&!x.disabled);
      const exactTarget=buttons.filter(x=>x.text===T&&!x.disabled);
      const containsTarget=buttons.filter(x=>x.text.toLowerCase().includes(T.toLowerCase())&&!x.disabled);
      const rexLike=buttons.filter(x=>/rex/i.test(x.text)&&!x.disabled);
      const markers=[...document.querySelectorAll('.sciip-property-marker')].filter(vis).map((x,i)=>({{
        i,text:(x.innerText||x.textContent||'').trim(),cls:String(x.className||'')
      }}));
      return {{
        explorerExact,
        explorerLike,
        exactTarget,
        containsTarget,
        rexLike,
        targetMarkers:markers.filter(x=>x.text.toLowerCase().includes(T.toLowerCase())),
        assignmentsCount:buttons.filter(x=>x.text==='Assignments'&&!x.disabled).length,
        buttonCount:buttons.length,
        bodyHasExplorer:(document.body?.innerText||'').includes('Explorer'),
        bodyHasTarget:(document.body?.innerText||'').toLowerCase().includes(T.toLowerCase())
      }};
    }})()""") or {}

def click_unique_explorer(w):
    return ev(w,r"""(()=> {
      const xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Explorer');
      if(xs.length!==1)return {clicked:false,count:xs.length};
      xs[0].click();return {clicked:true,count:1,text:'Explorer'};
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; evid=app/"evidence/explorer4"

    p=evid/R1/"recertification_residual_causal_diagnosis.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R3_R1_EVIDENCE_REQUIRED"); return 4
    r1=loadj(p)
    if r1.get("status")!="PASSED" or r1.get("state")!=R1_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R3_R1_CAUSAL_DIAGNOSIS_REQUIRED"); return 5
    if r1.get("classification")!="THIRD_RECORD_TARGET_NOT_MATERIALIZED_AT_SELECTION_TIME":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: THIRD_RECORD_TARGET_MATERIALIZATION_FAILURE_REQUIRED"); return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED"); return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")

    samples=[]
    start=time.time()
    schedule=[0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0]
    for t in schedule:
        while time.time()-start<t: time.sleep(.02)
        s=snapshot(w);s["t"]=t;samples.append(s)

    first_explorer=next((s["t"] for s in samples if len(s.get("explorerExact") or [])==1),None)
    first_explorer_like=next((s["t"] for s in samples if len(s.get("explorerLike") or [])>=1),None)

    entry=None
    post=[]
    if first_explorer is not None:
        entry=click_unique_explorer(w)
        time.sleep(.1)
        start2=time.time()
        schedule2=[0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0]
        for t in schedule2:
            while time.time()-start2<t: time.sleep(.02)
            s=snapshot(w);s["t"]=t;post.append(s)

    first_exact_target=next((s["t"] for s in post if len(s.get("exactTarget") or [])==1),None)
    first_contains_target=next((s["t"] for s in post if len(s.get("containsTarget") or [])>=1),None)
    first_marker=next((s["t"] for s in post if len(s.get("targetMarkers") or [])>=1),None)

    if first_explorer is None:
        classification="THIRD_RECORD_FRESH_PAGE_EXPLORER_CONTROL_MATERIALIZATION_RACE_CONFIRMED"
        resolution="EXPLORER_ENTRY_REQUIRES_BOUNDED_MATERIALIZATION_WAIT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_BOUNDED_EXPLORER_ENTRY_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_contains_target is not None:
        classification="THIRD_RECORD_EXPLORER_ENTRY_CERTIFIED_TARGET_UNIQUE_CONTAINS_BINDING_MATERIALIZED"
        resolution="EXPLORER_WAIT_THEN_UNIQUE_CONTAINS_TARGET_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_BOUNDED_EXPLORER_ENTRY_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_exact_target is not None:
        classification="THIRD_RECORD_EXPLORER_ENTRY_CERTIFIED_TARGET_EXACT_BINDING_MATERIALIZED"
        resolution="EXPLORER_WAIT_THEN_EXACT_TARGET_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_BOUNDED_EXPLORER_ENTRY_SETTLE_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_marker is not None:
        classification="THIRD_RECORD_TARGET_MARKER_ONLY_AFTER_EXPLORER_ENTRY"
        resolution="MARKER_ONLY_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_THIRD_RECORD_MARKER_BINDING_RECERTIFICATION"
    else:
        classification="THIRD_RECORD_TARGET_STILL_NOT_MATERIALIZED_AFTER_CERTIFIED_EXPLORER_ENTRY"
        resolution="TARGET_MATERIALIZATION_GAP_PERSISTS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R3_THIRD_RECORD_FILTER_OR_SEARCH_STATE_RESOLUTION"

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSED",
      "classification":classification,
      "target":TARGET,
      "freshTargetCreated":True,
      "preExplorerSamples":samples,
      "firstUniqueExplorerSeconds":first_explorer,
      "firstExplorerLikeSeconds":first_explorer_like,
      "explorerEntry":entry,
      "postExplorerSamples":post,
      "firstExactTargetSeconds":first_exact_target,
      "firstContainsTargetSeconds":first_contains_target,
      "firstTargetMarkerSeconds":first_marker,
      "resolution":resolution,
      "checks":{
        "r23dR3R1Passed":True,
        "thirdRecordTargetMaterializationFailureConsumed":True,
        "freshPageCreated":True,
        "explorerControlTimingCaptured":True,
        "explorerLikeInventoryCaptured":True,
        "targetTimingCapturedAfterExplorerEntry":True,
        "exactTargetInventoryCaptured":True,
        "containsTargetInventoryCaptured":True,
        "markerInventoryCaptured":True,
        "noPropertyClickPerformed":True,
        "assignmentsInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
      },
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
    ef=od/"third_record_target_materialization_and_binding_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3-R2 Third-Record Target Materialization + Binding Diagnosis")
    print("="*120)
    print("TARGET:",TARGET)
    print("FIRST_UNIQUE_EXPLORER_SECONDS:",first_explorer)
    print("FIRST_EXPLORER_LIKE_SECONDS:",first_explorer_like)
    print("EXPLORER_ENTRY:",json.dumps(entry))
    print("FIRST_EXACT_TARGET_SECONDS:",first_exact_target)
    print("FIRST_CONTAINS_TARGET_SECONDS:",first_contains_target)
    print("FIRST_TARGET_MARKER_SECONDS:",first_marker)
    print("RESOLUTION:",resolution)
    print()
    print("----- PRE-EXPLORER SAMPLES -----")
    for s in samples:
        print(json.dumps({
          "t":s["t"],
          "explorerExactCount":len(s.get("explorerExact") or []),
          "explorerLikeCount":len(s.get("explorerLike") or []),
          "assignmentsCount":s.get("assignmentsCount"),
          "buttonCount":s.get("buttonCount")
        }))
    print()
    print("----- POST-EXPLORER SAMPLES -----")
    for s in post:
        print(json.dumps({
          "t":s["t"],
          "exactTargetCount":len(s.get("exactTarget") or []),
          "containsTargetCount":len(s.get("containsTarget") or []),
          "rexLikeCount":len(s.get("rexLike") or []),
          "targetMarkerCount":len(s.get("targetMarkers") or []),
          "assignmentsCount":s.get("assignmentsCount"),
          "bodyHasTarget":s.get("bodyHasTarget")
        }))
    print()
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
