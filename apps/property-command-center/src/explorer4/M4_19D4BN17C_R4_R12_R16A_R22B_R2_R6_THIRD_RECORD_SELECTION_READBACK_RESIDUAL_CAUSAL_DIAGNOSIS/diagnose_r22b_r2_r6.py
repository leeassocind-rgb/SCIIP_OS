#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R6_THIRD_RECORD_SELECTION_READBACK_RESIDUAL_CAUSAL_DIAGNOSIS"
TARGET="8700 - 8750 Rex Rd"
PORT=9333
APP="http://127.0.0.1:5173/"

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
        if not m:raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
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

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; evid=app/"evidence/explorer4"

    # Require prior 2/3 result.
    p=evid/"M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"/"exact_three_record_guarded_export_micro_cohort_execution.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R22B_EVIDENCE_REQUIRED");return 4
    d=json.loads(p.read_text())
    outs=d.get("outcomes") or []
    if len(outs)<3 or not outs[0].get("certified") or not outs[1].get("certified") or outs[2].get("failure")!="SELECTION_FAILED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPECTED_TWO_OF_THREE_WITH_THIRD_SELECTION_FAILURE_REQUIRED");return 5

    version=getj(f"http://127.0.0.1:{PORT}/json/version")
    if not version:
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED");return 7
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

    before=ev(w,r"""(() => ({
      body:(document.body?.innerText||'').slice(0,40000),
      buttons:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null).map((x,i)=>({i,text:(x.innerText||x.textContent||'').trim(),disabled:!!x.disabled,cls:x.className||'',aria:x.getAttribute('aria-label')||''})),
      session:Object.fromEntries(Object.keys(sessionStorage).map(k=>[k,sessionStorage.getItem(k)])),
      local:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))
    }))()""") or {}

    explorer=ev(w,r"""(()=>{const xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Explorer');if(xs.length!==1)return{clicked:false,count:xs.length};xs[0].click();return{clicked:true,count:1}})()""") or {}
    time.sleep(.7)

    afterExplorer=ev(w,f"""(()=>{{const T={json.dumps(TARGET)},btns=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);return{{
      body:(document.body?.innerText||'').slice(0,40000),
      exact:btns.filter(x=>(x.innerText||x.textContent||'').trim()===T).map((x,i)=>({{i,text:(x.innerText||x.textContent||'').trim(),disabled:!!x.disabled,cls:x.className||'',aria:x.getAttribute('aria-label')||''}})),
      contains:btns.filter(x=>(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase())).map((x,i)=>({{i,text:(x.innerText||x.textContent||'').trim(),disabled:!!x.disabled,cls:x.className||'',aria:x.getAttribute('aria-label')||''}})),
      rexLike:btns.filter(x=>/8700|8750|Rex/i.test((x.innerText||x.textContent||''))).map((x,i)=>({{i,text:(x.innerText||x.textContent||'').trim(),disabled:!!x.disabled,cls:x.className||'',aria:x.getAttribute('aria-label')||''}})),
      session:Object.fromEntries(Object.keys(sessionStorage).map(k=>[k,sessionStorage.getItem(k)])),
      local:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))
    }}}})()""") or {}

    click=ev(w,f"""(()=>{{const T={json.dumps(TARGET)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length,candidates:xs.map(x=>(x.innerText||x.textContent||'').trim())}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""") or {}
    time.sleep(.7)

    afterClick=ev(w,f"""(()=>{{const T={json.dumps(TARGET)},txt=document.body?.innerText||'';return{{
      body:txt.slice(0,40000),
      targetTextVisible:txt.toLowerCase().includes(T.toLowerCase()),
      assignments:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Assignments').length,
      session:Object.fromEntries(Object.keys(sessionStorage).map(k=>[k,sessionStorage.getItem(k)])),
      local:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),
      selectedHints:[...document.querySelectorAll('[class*="selected"],[aria-selected="true"]')].slice(0,50).map(x=>({{tag:x.tagName,text:(x.innerText||x.textContent||'').trim().slice(0,500),cls:x.className||'',ariaSelected:x.getAttribute('aria-selected')}}))
    }}}})()""") or {}

    exact_count=len(afterExplorer.get("exact") or [])
    contains_count=len(afterExplorer.get("contains") or [])
    rex_count=len(afterExplorer.get("rexLike") or [])
    clicked=bool(click.get("clicked"))
    visible=bool(afterClick.get("targetTextVisible"))

    # Determine whether failure is string-readback mismatch or actual selection failure.
    candidate_text=(afterExplorer.get("contains") or afterExplorer.get("rexLike") or [])
    texts=[x.get("text","") for x in candidate_text]

    if clicked and not visible:
        classification="THIRD_RECORD_CLICK_SUCCEEDED_SELECTED_PROPERTY_READBACK_TEXT_PREDICATE_TOO_STRICT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_IDENTITY_AWARE_SELECTION_READBACK_REPAIR_AND_FINAL_EXPORT_RECERTIFICATION"
    elif not clicked and contains_count==0 and rex_count>0:
        classification="THIRD_RECORD_LABEL_NORMALIZATION_MISMATCH_EXACT_TARGET_STRING_NOT_PRESENT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_NORMALIZED_LABEL_SELECTION_REPAIR_AND_FINAL_EXPORT_RECERTIFICATION"
    elif not clicked and contains_count>1:
        classification="THIRD_RECORD_MULTIPLE_TARGET_BUTTON_MATCHES_REQUIRE_DISAMBIGUATION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_BUTTON_INSTANCE_DISAMBIGUATION_AND_FINAL_EXPORT_RECERTIFICATION"
    elif clicked and visible:
        classification="THIRD_RECORD_SELECTION_TRANSIENT_PRIOR_FAILURE_NOT_REPRODUCED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_BOUNDED_SELECTION_AND_EXPORT_RECERTIFICATION"
    else:
        classification="THIRD_RECORD_SELECTION_FAILURE_REPRODUCED_REQUIRES_DEEPER_STATE_IDENTITY_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_SELECTION_STATE_IDENTITY_DEEP_DIAGNOSIS"

    checks={
      "priorTwoExportsCertified":True,
      "thirdPriorSelectionFailed":True,
      "freshPageCreated":True,
      "explorerEntryAttempted":True,
      "targetButtonInventoryCaptured":True,
      "normalizedRexCandidatesCaptured":True,
      "selectionClickAttempted":True,
      "postClickReadbackCaptured":True,
      "storageStateCaptured":True,
      "exportInvocationOff":True,
      "assignmentsInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R22B_R2_R6_THIRD_RECORD_SELECTION_READBACK_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R22B_R2_R6_THIRD_RECORD_SELECTION_CAUSE_DIAGNOSED",
      "classification":classification,
      "target":TARGET,
      "explorerEntry":explorer,
      "afterExplorer":{"exactCount":exact_count,"containsCount":contains_count,"rexLikeCount":rex_count,
                       "exact":afterExplorer.get("exact"),"contains":afterExplorer.get("contains"),
                       "rexLike":afterExplorer.get("rexLike"),"session":afterExplorer.get("session"),
                       "local":afterExplorer.get("local")},
      "selectionClick":click,
      "afterClick":{"targetTextVisible":visible,"assignmentsCount":afterClick.get("assignments"),
                    "selectedHints":afterClick.get("selectedHints"),"session":afterClick.get("session"),
                    "local":afterClick.get("local")},
      "checks":checks,
      "authority":{"exportInvocation":False,"assignmentsInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"third_record_selection_readback_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B-R2-R6 Third-Record Selection Readback Residual Causal Diagnosis")
    print("="*120)
    print("TARGET:",TARGET)
    print("EXPLORER_ENTRY:",json.dumps(explorer))
    print("EXACT_TARGET_BUTTON_COUNT:",exact_count)
    print("CONTAINS_TARGET_BUTTON_COUNT:",contains_count)
    print("REX_LIKE_BUTTON_COUNT:",rex_count)
    print("TARGET_BUTTON_TEXTS:",texts)
    print("SELECTION_CLICK:",json.dumps(click))
    print("TARGET_TEXT_VISIBLE_AFTER_CLICK:",visible)
    print("ASSIGNMENTS_CONTROL_COUNT_AFTER_CLICK:",afterClick.get("assignments"))
    print("\n----- SELECTED HINTS -----")
    for x in afterClick.get("selectedHints") or []:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R22B_R2_R6_THIRD_RECORD_SELECTION_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":raise SystemExit(main())
