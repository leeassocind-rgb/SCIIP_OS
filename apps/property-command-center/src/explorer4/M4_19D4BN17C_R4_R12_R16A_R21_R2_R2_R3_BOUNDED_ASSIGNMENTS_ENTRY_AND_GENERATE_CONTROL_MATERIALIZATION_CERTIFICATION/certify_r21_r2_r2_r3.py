#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_RESOLUTION"
def loadj(p):return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def get(u):
    try:
        with urllib.request.urlopen(u,timeout=2) as r:return r.read().decode("utf8","ignore")
    except:return None
def targets():
    try:return json.loads(get("http://127.0.0.1:9333/json") or "[]")
    except:return []
class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,x=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {x} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        z=b""
        while b"\r\n\r\n" not in z:z+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(b^m[i%4] for i,b in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        m=self.s.recv(4) if b&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if m:d=bytes(x^m[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if (a&15)==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while 1:
            x=self.recv()
            if x and x.get("id")==i:return x
def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";evid=app/"evidence/explorer4"
    pp=evid/PREV/"assignment_entry_handler_source_binding_resolution.json"
    if not pp.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R21_R2_R2_R2_EVIDENCE_REQUIRED");return 4
    prev=loadj(pp)
    if prev.get("classification")!="EXACT_ASSIGNMENTS_LIVE_CONTROL_AND_SOURCE_NAVIGATION_HANDLER_BINDING_RESOLVED":
        print("STATUS: BLOCKED\nDIAGNOSIS: EXACT_ASSIGNMENTS_SOURCE_LIVE_BINDING_REQUIRED");return 5
    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:print("STATUS: BLOCKED\nDIAGNOSIS: CDP_TARGET_REQUIRED");return 6
    w=WS(pages[0]["webSocketDebuggerUrl"]);w.call("Runtime.enable")
    before=ev(w,r"""(() => ({
      url:location.href,
      assignments:[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&(e.innerText||'').trim()==='Assignments').length,
      generate:[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&(e.innerText||'').trim()==='Generate Client Listing Report').length,
      export:[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null&&/^Export(?: Report)?$/i.test((e.innerText||'').trim())).length,
      body:(document.body.innerText||'').slice(0,12000)
    }))()""")
    # Authority is exactly one click on the unique visible exact Assignments button.
    action=ev(w,r"""(() => {
      const xs=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&!e.disabled&&(e.innerText||'').trim()==='Assignments');
      if(xs.length!==1)return {clicked:false,reason:'PRECONDITION_EXACT_ASSIGNMENTS_CONTROL_NOT_UNIQUE',count:xs.length};
      xs[0].click(); return {clicked:true,count:1};
    })()""")
    time.sleep(.8)
    after=ev(w,r"""(() => ({
      url:location.href,
      assignments:[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&(e.innerText||'').trim()==='Assignments').length,
      generateControls:[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&(e.innerText||'').trim()==='Generate Client Listing Report').map((e,i)=>({i,text:(e.innerText||'').trim(),disabled:!!e.disabled,cls:String(e.className||''),visible:true})),
      exportControls:[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null&&/^Export(?: Report)?$/i.test((e.innerText||'').trim())).map((e,i)=>({i,tag:e.tagName,text:(e.innerText||'').trim(),disabled:!!e.disabled,cls:String(e.className||''),visible:true})),
      brookfield:/Brookfield/i.test(document.body.innerText||''),
      clientProductionHouse:/Client production house/i.test(document.body.innerText||''),
      body:(document.body.innerText||'').slice(0,16000)
    }))()""")
    gs=(after or {}).get("generateControls") or []; unique_gen=len(gs)==1 and not gs[0].get("disabled")
    if action and action.get("clicked") and unique_gen:
        cls="BOUNDED_ASSIGNMENTS_ENTRY_CERTIFIED_GENERATE_CLIENT_LISTING_REPORT_CONTROL_MATERIALIZED"
        status="PASSED";nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"
    elif action and action.get("clicked"):
        cls="ASSIGNMENTS_ENTRY_COMPLETED_GENERATE_CONTROL_MATERIALIZATION_INCOMPLETE"
        status="DIAGNOSTIC_COMPLETE";nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_R1_ASSIGNMENT_SELECTION_STATUS_AND_GENERATE_CONTROL_REACHABILITY_DIAGNOSIS"
    else:
        cls="BOUNDED_ASSIGNMENTS_ENTRY_PRECONDITION_FAILED"
        status="DIAGNOSTIC_COMPLETE";nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_R1_LIVE_ASSIGNMENTS_CONTROL_PRECONDITION_RECERTIFICATION"
    checks={"r21R2R2R2Passed":prev.get("status")=="PASSED","exactSourceLiveAssignmentsBindingConsumed":True,
      "exactAssignmentsUniqueBeforeAction":(before or {}).get("assignments")==1,"singleBoundedAssignmentsClickOnly":bool(action and action.get("clicked")),
      "generateControlInventoriedAfterEntry":True,"exactGenerateControlUniqueAfterEntry":unique_gen,
      "generateReportInvocationOff":True,"exportControlInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True}
    out=evid/M;out.mkdir(parents=True,exist_ok=True);ef=out/"bounded_assignments_entry_and_generate_control_materialization_certification.json"
    data={"framework":"SCIIP_EXPLORER_4_R21_R2_R2_R3_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,
      "state":"M419D4BN17C_R4_R12_R16A_R21_R2_R2_R3_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R2_R3_GENERATE_CONTROL_MATERIALIZATION_INCOMPLETE",
      "priorClassification":prev.get("classification"),"before":before,"stateTransition":action,"after":after,"classification":cls,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"assignmentEntryInvocation":"SINGLE_EXACT_ASSIGNMENTS_CLICK_ONLY","generateReportInvocation":False,"exportControlInvocation":False},
      "nextMilestone":nxt}
    ef.write_text(json.dumps(data,indent=2)+"\n")
    print("="*120);print("SCIIP Explorer 4.0 — R21-R2-R2-R3 Bounded Assignments Entry + Generate Control Materialization Certification");print("="*120)
    print("R21_R2_R2_R2_CLASSIFICATION:",prev.get("classification"));print("EXACT_ASSIGNMENTS_CONTROL_COUNT_BEFORE:",(before or {}).get("assignments"))
    print("STATE_TRANSITION:",json.dumps(action));print("CLIENT_PRODUCTION_HOUSE_VISIBLE_AFTER:",(after or {}).get("clientProductionHouse"))
    print("BROOKFIELD_VISIBLE_AFTER:",(after or {}).get("brookfield"));print("GENERATE_CONTROL_COUNT_AFTER:",len(gs));print("GENERATE_CONTROL_UNIQUE_ENABLED_AFTER:",unique_gen)
    print("EXPORT_CONTROL_COUNT_AFTER:",len((after or {}).get("exportControls") or []));print("CLASSIFICATION:",cls)
    print("\n----- GENERATE CONTROLS AFTER -----")
    for x in gs:print(json.dumps(x))
    print("\n----- EXPORT CONTROLS AFTER -----")
    for x in (after or {}).get("exportControls") or []:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",data["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__":raise SystemExit(main())
