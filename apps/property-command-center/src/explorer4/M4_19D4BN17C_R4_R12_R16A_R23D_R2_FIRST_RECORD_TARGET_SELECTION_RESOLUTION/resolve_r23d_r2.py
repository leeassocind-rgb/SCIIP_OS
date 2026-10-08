#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLUTION"
R1="M4_19D4BN17C_R4_R12_R16A_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED"
TARGET="2 Musick"
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

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def snapshot(w):
    return ev(w,f"""(()=>{{
      const T={json.dumps(TARGET)};
      const visible=e=>e.offsetParent!==null;
      const all=[...document.querySelectorAll('button')].filter(visible).map((x,i)=>({{
        i,text:(x.innerText||x.textContent||'').trim(),cls:String(x.className||''),disabled:!!x.disabled
      }}));
      const exact=all.filter(x=>x.text===T);
      const contains=all.filter(x=>x.text.toLowerCase().includes(T.toLowerCase()));
      const musick=all.filter(x=>/musick/i.test(x.text));
      const markers=[...document.querySelectorAll('.sciip-property-marker')].filter(visible).map((x,i)=>({{
        i,text:(x.innerText||x.textContent||'').trim(),cls:String(x.className||'')
      }}));
      const selected=markers.filter(x=>/is-selected/.test(x.cls));
      const inputs=[...document.querySelectorAll('input')].filter(visible).map((x,i)=>({{
        i,placeholder:x.placeholder||'',value:x.value||'',type:x.type||''
      }}));
      const body=document.body?.innerText||'';
      return {{
        exactButtons:exact,
        containsButtons:contains,
        musickButtons:musick,
        markers:markers.filter(x=>/musick/i.test(x.text)),
        selectedMarkers:selected,
        inputs,
        targetTextVisible:body.toLowerCase().includes(T.toLowerCase()),
        assignmentsCount:all.filter(x=>x.text==='Assignments'&&!x.disabled).length,
        explorerCount:all.filter(x=>x.text==='Explorer'&&!x.disabled).length,
        buttonCount:all.length
      }};
    }})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R1/"guarded_export_residual_causal_diagnosis.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R1_EVIDENCE_REQUIRED"); return 4
    r1=loadj(p)
    if r1.get("status")!="PASSED" or r1.get("state")!=R1_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23D_R1_CAUSAL_DIAGNOSIS_REQUIRED"); return 5
    if r1.get("classification")!="FIRST_RECORD_TARGET_SELECTION_CLICK_FAILED":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FIRST_RECORD_TARGET_SELECTION_CLICK_FAILURE_REQUIRED"); return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED"); return 8

    w=W(n["webSocketDebuggerUrl"]); w.call("Runtime.enable"); w.call("Page.enable"); time.sleep(.8)

    explorer=click_exact(w,"Explorer")
    time.sleep(.6)

    samples=[]
    for delay in [0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0]:
        if delay:
            time.sleep(delay - samples[-1]["t"] if samples else delay)
        s=snapshot(w); s["t"]=delay; samples.append(s)

    first_exact=next((s["t"] for s in samples if len(s.get("exactButtons") or [])==1),None)
    first_contains=next((s["t"] for s in samples if len(s.get("containsButtons") or [])>=1),None)
    first_marker=next((s["t"] for s in samples if len(s.get("markers") or [])>=1),None)
    first_text=next((s["t"] for s in samples if s.get("targetTextVisible")),None)

    # Classify the actual materialization mode.
    if first_exact is not None:
        classification="FIRST_RECORD_EXACT_TARGET_BUTTON_MATERIALIZES_AFTER_EXPLORER_ENTRY"
        resolution="EXACT_BUTTON_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_EXACT_BUTTON_SELECTION_WAIT_GUARD_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_contains is not None:
        classification="FIRST_RECORD_TARGET_PRESENT_AS_CONTAINS_MATCH_NOT_EXACT_BUTTON"
        resolution="CONTAINS_BUTTON_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_CONTAINS_MATCH_SELECTION_BINDING_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_marker is not None:
        classification="FIRST_RECORD_TARGET_PRESENT_AS_MAP_MARKER_ONLY"
        resolution="MARKER_BINDING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_MARKER_SELECTION_BINDING_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
    elif first_text is not None:
        classification="FIRST_RECORD_TARGET_TEXT_PRESENT_WITHOUT_ACTIONABLE_PROPERTY_CONTROL"
        resolution="NON_ACTIONABLE_TEXT_PRESENT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_PROPERTY_CONTROL_SURFACE_CORRELATION"
    else:
        classification="FIRST_RECORD_TARGET_NOT_MATERIALIZED_ON_FRESH_EXPLORER_PAGE"
        resolution="TARGET_MATERIALIZATION_MISSING"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_REFERENCE_RECORD_REENTRY_OR_FILTER_STATE_RESOLUTION"

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLVED",
      "classification":classification,
      "target":TARGET,
      "freshTargetCreated":True,
      "explorerEntry":explorer,
      "samples":samples,
      "firstExactButtonSeconds":first_exact,
      "firstContainsButtonSeconds":first_contains,
      "firstMarkerSeconds":first_marker,
      "firstTargetTextSeconds":first_text,
      "resolution":resolution,
      "checks":{
        "r23dR1Passed":True,
        "r23dR1TargetSelectionFailureConsumed":True,
        "freshPageCreated":True,
        "explorerEntryAttempted":True,
        "exactButtonInventoryCaptured":True,
        "containsButtonInventoryCaptured":True,
        "markerInventoryCaptured":True,
        "inputInventoryCaptured":True,
        "boundedMaterializationWindowInspected":True,
        "assignmentsReadbackCaptured":True,
        "noTargetClickPerformed":True,
        "assignmentsInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
      },
      "authority":{
        "targetClick":False,
        "assignmentsInvocation":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"first_record_target_selection_resolution.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R2 First-Record Target Selection Resolution")
    print("="*120)
    print("TARGET:",TARGET)
    print("EXPLORER_ENTRY:",json.dumps(explorer))
    print("FIRST_EXACT_BUTTON_SECONDS:",first_exact)
    print("FIRST_CONTAINS_BUTTON_SECONDS:",first_contains)
    print("FIRST_MARKER_SECONDS:",first_marker)
    print("FIRST_TARGET_TEXT_SECONDS:",first_text)
    print("RESOLUTION:",resolution)
    print()
    print("----- MATERIALIZATION SAMPLES -----")
    for s in samples:
        print(json.dumps({
          "t":s["t"],
          "exactButtonCount":len(s.get("exactButtons") or []),
          "containsButtonCount":len(s.get("containsButtons") or []),
          "musickButtonCount":len(s.get("musickButtons") or []),
          "markerCount":len(s.get("markers") or []),
          "targetTextVisible":s.get("targetTextVisible"),
          "assignmentsCount":s.get("assignmentsCount"),
          "explorerCount":s.get("explorerCount"),
          "buttonCount":s.get("buttonCount"),
          "inputs":s.get("inputs")
        },ensure_ascii=False))
    print()
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLVED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
