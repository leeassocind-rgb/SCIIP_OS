#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re
PORT=9333;APP="http://127.0.0.1:5173/"
R1="M4_19D4BN17C_R4_R12_R16A_R27B_R1_NON_EXPORT_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R27A="M4_19D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R2_FIRST_RECORD_EXPORT_CONTROL_BINDING_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
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
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode());b=b""
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
def exact(w,t):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)}).length)()""") or 0
def settle(w,t,sec=2.0,samples=3):
    st=time.time();c=0
    while time.time()-st<=sec:
        c=c+1 if exact(w,t)==1 else 0
        if c>=samples:return True
        time.sleep(.1)
    return False
def click(w,t):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)});if(x.length!==1)return false;x[0].click();return true}})()""") is True
def bind(w,target):
    js=f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();
let x=bs.filter(b=>txt(b)===q);if(x.length===1)return{{ok:true,mode:'EXACT'}};
x=bs.filter(b=>txt(b).startsWith(q));if(x.length===1)return{{ok:true,mode:'UNIQUE_PREFIX'}};
return{{ok:false,count:x.length}}}})()"""
    return ev(w,js) or {"ok":False}
def click_bound(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled),txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();
let x=bs.filter(b=>txt(b)===q);if(x.length!==1)x=bs.filter(b=>txt(b).startsWith(q));if(x.length!==1)return false;x[0].click();return true}})()""") is True
def export_control_readback(w):
    return ev(w,r"""(()=>{const label='Download Client Listing Report';
const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()===label);
if(x.length!==1)return {count:x.length,visible:x.length===1,enabled:false,handlerName:null};
const b=x[0];const k=Object.keys(b).find(k=>k.startsWith('__reactProps$'));const f=k&&b[k]&&b[k].onClick;
return {count:1,visible:true,enabled:!b.disabled,handlerName:typeof f==='function'?(f.name||'anonymous'):null};})()""") or {}
def main():
    repo=Path(sys.argv[1]).expanduser().resolve();er=repo/"apps/property-command-center/evidence/explorer4"
    d1p=er/R1/"non_export_qualification_residual_causal_diagnosis.json";tp=er/R27A/"exact_new_one_hundred_targets.json"
    print("="*120);print("SCIIP Explorer 4.0 — R27B-R2 First-Record Export-Control Binding Repair + Non-Export Recertification");print("="*120)
    print("Export invocation: OFF\nApplication source mutation: OFF\nGoverned data mutation: OFF")
    if not d1p.exists() or not tp.exists():print("STATUS: BLOCKED\nREASON: R27B-R1 diagnosis and R27A target file required");return 4
    d1=loadj(d1p);targets=loadj(tp)
    if d1.get("status")!="PASSED" or d1.get("firstFailedStage")!="exportControlCertified":
        print("STATUS: BLOCKED\nREASON: certified export-control-only residual diagnosis required");return 5
    target=targets[0]
    if d1.get("firstFailureTarget")!=target:print("STATUS: BLOCKED\nREASON: first target parity mismatch");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):print("STATUS: BLOCKED\nREASON: CDP browser required");return 7
    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):print("STATUS: BLOCKED\nREASON: fresh page creation failed");return 8
    w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer=settle(w,"Explorer");entered=click(w,"Explorer") if explorer else False
    st=time.time();c=0;br=None
    while entered and time.time()-st<=5:
        br=bind(w,target);c=c+1 if br.get("ok") else 0
        if c>=3:break
        time.sleep(.1)
    binding=c>=3;selected=click_bound(w,target) if binding else False
    st=time.time();c=0
    while selected and time.time()-st<=2:
        v=ev(w,"""(()=>!!document.querySelector('.sciip-property-marker[aria-pressed="true"],.sciip-property-marker.selected,[data-selected="true"]')||document.body.innerText.includes('Assignments'))()""")
        c=c+1 if v else 0
        if c>=3:break
        time.sleep(.1)
    selected_settle=c>=3
    assignments=settle(w,"Assignments") and click(w,"Assignments") if selected_settle else False
    time.sleep(.15)
    gen=None
    for lab in ["Generate Client Listing Report","Generate"]:
        if settle(w,lab):gen=lab;break
    generated=click(w,gen) if gen else False
    st=time.time();c=0;ctrl={}
    while generated and time.time()-st<=4:
        ctrl=export_control_readback(w)
        ok=(ctrl.get("count")==1 and ctrl.get("visible") and ctrl.get("enabled") and ctrl.get("handlerName")=="exportReport")
        c=c+1 if ok else 0
        if c>=3:break
        time.sleep(.1)
    export_control=c>=3;same_origin=str(ev(w,"location.origin") or "")=="http://127.0.0.1:5173"
    passed=all([explorer,entered,binding,selected,selected_settle,assignments,bool(gen),generated,export_control,same_origin])
    out={"framework":"SCIIP_EXPLORER_4_R27B_R2_FIRST_RECORD_EXPORT_CONTROL_BINDING_REPAIR_AND_NON_EXPORT_RECERTIFICATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE","target":target,"explorerSettleCertified":explorer,"explorerEntryCertified":entered,"targetBindingSettleCertified":binding,"bindingMode":(br or {}).get("mode"),"selectionCertified":selected,"selectedPropertySettleCertified":selected_settle,"assignmentsEntryCertified":assignments,"generateControlCertified":bool(gen),"reportReviewEntryCertified":generated,"exportControlLabel":"Download Client Listing Report","exportControlReadback":ctrl,"exportControlCertified":export_control,"liveHandlerCertified":ctrl.get("handlerName")=="exportReport","sameOrigin":same_origin,"exportInvocation":False,"nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R3_EXACT_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_RECERTIFICATION" if passed else "M4_19D4BN17C_R4_R12_R16A_R27B_R2_R1_EXPORT_CONTROL_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS"}
    od=er/OUT;od.mkdir(parents=True,exist_ok=True);ef=od/"first_record_export_control_binding_repair_and_non_export_recertification.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("TARGET:",target);print("EXPORT_CONTROL_LABEL: Download Client Listing Report");print("EXPORT_CONTROL_CERTIFIED:",export_control);print("LIVE_HANDLER_CERTIFIED:",ctrl.get("handlerName")=="exportReport");print("EXPORT_INVOCATION: OFF");print("STATUS:",out["status"]);print("NEXT_MILESTONE:",out["nextMilestone"]);print("EVIDENCE:",ef);print("\nR27B-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if passed else 10
if __name__=="__main__":raise SystemExit(main())
