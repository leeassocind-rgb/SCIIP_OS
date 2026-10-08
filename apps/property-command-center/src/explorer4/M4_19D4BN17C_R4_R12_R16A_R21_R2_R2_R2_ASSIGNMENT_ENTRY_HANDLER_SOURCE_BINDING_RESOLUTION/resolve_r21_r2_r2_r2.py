#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_RESOLUTION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_DIAGNOSIS"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def get(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:return r.read().decode("utf-8","ignore")
    except:return None
def targets():
    try:return json.loads(get("http://127.0.0.1:9333/json") or "[]")
    except:return []

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u); host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),timeout=5); key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode(); mask=os.urandom(4); n=len(p); h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h.extend([0x80|126]);h.extend(struct.pack("!H",n))
        else:h.extend([0x80|127]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+mask+bytes(b^mask[i%4] for i,b in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h;n=b2&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b2&128 else None; d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(b^mask[i%4] for i,b in enumerate(d))
        try:return json.loads(d.decode()) if (b1&15)==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")
def compact(s,n=5000):return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; src=app/"src"; evid=app/"evidence/explorer4"
    pp=evid/PREV/"assignment_workspace_entry_and_generate_control_materialization_diagnosis.json"
    if not pp.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: R21_R2_R2_R1_EVIDENCE_REQUIRED");return 4
    prev=loadj(pp)
    if prev.get("classification")!="ASSIGNMENT_WORKSPACE_MOUNT_OWNER_RESOLVED_LIVE_ENTRY_CONTROL_PARTIAL":
        print("STATUS: BLOCKED\nDIAGNOSIS: EXPECTED_PARTIAL_LIVE_ENTRY_CLASSIFICATION_REQUIRED");return 5

    # Resolve source shell/navigation handler for exact semantic destination "Assignments".
    assignment_calls=[]; handler_defs=[]; shell_owners=[]
    pats=[
      re.compile(r'onNavigate\s*\(\s*[\'"]Assignments[\'"]\s*\)'),
      re.compile(r'\bgo\s*\(\s*[\'"]Assignments[\'"]\s*\)'),
      re.compile(r'(?:set[A-Za-z0-9_$]*(?:Page|View|Route|Workspace|Section|Nav)[A-Za-z0-9_$]*)\s*\(\s*[\'"]Assignments[\'"]\s*\)',re.I)
    ]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"} or "src/explorer4/" in str(p):continue
        try:s=p.read_text(errors="ignore")
        except:continue
        for pat in pats:
            for m in pat.finditer(s):
                assignment_calls.append({"file":str(p.relative_to(app)),"line":s.count("\n",0,m.start())+1,"call":m.group(0),"snippet":compact(s[max(0,m.start()-2200):m.start()+3200])})
        if re.search(r'\bonNavigate\b',s) and re.search(r'Assignments',s):
            for m in re.finditer(r'(?:function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)|const\s+([A-Za-z_$][\w$]*)\s*=\s*\([^)]*\)\s*=>)',s):
                w=s[m.start():min(len(s),m.start()+8000)]
                if "onNavigate" in w and "Assignments" in w:
                    handler_defs.append({"file":str(p.relative_to(app)),"line":s.count("\n",0,m.start())+1,"owner":m.group(1) or m.group(2),"snippet":compact(w)})

        # Shell mount of AssignmentPortfolioLifecycle
        for m in re.finditer(r'<AssignmentPortfolioLifecycle\b',s):
            w=s[max(0,m.start()-3500):min(len(s),m.start()+3500)]
            shell_owners.append({"file":str(p.relative_to(app)),"line":s.count("\n",0,m.start())+1,"snippet":compact(w)})

    # Broader exact string sites can reveal nav arrays or switch statements.
    exact_string_sites=[]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"} or "src/explorer4/" in str(p):continue
        try:s=p.read_text(errors="ignore")
        except:continue
        for m in re.finditer(r'[\'"]Assignments[\'"]',s):
            exact_string_sites.append({"file":str(p.relative_to(app)),"line":s.count("\n",0,m.start())+1,"snippet":compact(s[max(0,m.start()-1200):m.start()+1800],3000)})

    # Live exact Assignments control: inspect stable DOM ancestry and React-ish attributes only. No click.
    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    live=[]
    current=None
    if pages:
        w=WS(pages[0]["webSocketDebuggerUrl"]);w.call("Runtime.enable");current=ev(w,"location.href")
        live=ev(w,r"""(() => [...document.querySelectorAll('button,a,[role=button],[role=tab]')]
          .filter(el => /^(Assignments?)$/i.test((el.innerText||el.textContent||'').trim()))
          .map((el,i)=>{
            const chain=[]; let n=el;
            for(let d=0;n&&d<7;d++,n=n.parentElement) chain.push({tag:n.tagName,id:n.id||'',cls:String(n.className||''),aria:n.getAttribute?.('aria-label')||'',role:n.getAttribute?.('role')||''});
            return {i,tag:el.tagName,text:(el.innerText||el.textContent||'').trim(),disabled:!!el.disabled,visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length),id:el.id||'',cls:String(el.className||''),aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',chain};
          }))()""") or []

    # Rank likely source binding.
    ranked=[]
    for x in exact_string_sites:
        sc=0; sn=x["snippet"]
        if "onNavigate" in sn:sc+=60
        if "AssignmentPortfolioLifecycle" in sn:sc+=50
        if re.search(r'nav|sidebar|shell|page|route|view|workspace',sn,re.I):sc+=25
        if re.search(r'active|selected|current',sn,re.I):sc+=10
        ranked.append({**x,"score":sc})
    ranked.sort(key=lambda x:-x["score"])

    unique_live=[x for x in live if x.get("visible") and not x.get("disabled")]
    source_handler_resolved=bool(assignment_calls or shell_owners) and bool(ranked)
    exact_live_unique=len(unique_live)==1

    if source_handler_resolved and exact_live_unique:
        cls="EXACT_ASSIGNMENTS_LIVE_CONTROL_AND_SOURCE_NAVIGATION_HANDLER_BINDING_RESOLVED"
        status="PASSED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION"
    elif source_handler_resolved:
        cls="ASSIGNMENTS_SOURCE_NAVIGATION_HANDLER_RESOLVED_LIVE_CONTROL_NOT_UNIQUE"
        status="DIAGNOSTIC_COMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_LIVE_ASSIGNMENTS_CONTROL_DISAMBIGUATION"
    else:
        cls="ASSIGNMENTS_ENTRY_HANDLER_SOURCE_BINDING_INCOMPLETE"
        status="DIAGNOSTIC_COMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_PARENT_SHELL_NAVIGATION_HANDLER_CALL_GRAPH_CLOSURE"

    checks={
      "r21R2R2R1Passed":prev.get("status")=="PASSED",
      "partialLiveEntryClassificationConsumed":True,
      "exactAssignmentsStringSitesInspected":True,
      "assignmentNavigationCallsInspected":True,
      "assignmentPortfolioMountOwnersInspected":True,
      "liveExactAssignmentsControlsInspected":bool(pages),
      "sourceHandlerBindingResolved":source_handler_resolved,
      "exactLiveAssignmentsControlUnique":exact_live_unique,
      "assignmentEntryInvocationOff":True,
      "generateReportInvocationOff":True,
      "exportControlInvocationOff":True,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True
    }
    out=evid/M;out.mkdir(parents=True,exist_ok=True);ef=out/"assignment_entry_handler_source_binding_resolution.json"
    data={"framework":"SCIIP_EXPLORER_4_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_RESOLUTION","generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":"M419D4BN17C_R4_R12_R16A_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_RESOLVED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_INCOMPLETE",
      "priorClassification":prev.get("classification"),"assignmentNavigationCallCount":len(assignment_calls),"assignmentNavigationCalls":assignment_calls[:80],
      "handlerDefinitionCount":len(handler_defs),"handlerDefinitions":handler_defs[:50],"assignmentPortfolioMountOwnerCount":len(shell_owners),"assignmentPortfolioMountOwners":shell_owners[:50],
      "exactAssignmentsStringSiteCount":len(exact_string_sites),"rankedExactAssignmentsStringSites":ranked[:80],"cdpTargetAvailable":bool(pages),"currentUrl":current,
      "liveExactAssignmentsControlCount":len(live),"liveExactAssignmentsControls":live,"classification":cls,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"assignmentEntryInvocation":False,"generateReportInvocation":False,"exportControlInvocation":False},
      "nextMilestone":nxt}
    ef.write_text(json.dumps(data,indent=2)+"\n")
    print("="*120);print("SCIIP Explorer 4.0 — R21-R2-R2-R2 Assignment Entry Handler Source Binding Resolution");print("="*120)
    print("PRIOR_CLASSIFICATION:",prev.get("classification"));print("ASSIGNMENT_NAVIGATION_CALL_COUNT:",len(assignment_calls));print("HANDLER_DEFINITION_COUNT:",len(handler_defs))
    print("ASSIGNMENT_PORTFOLIO_MOUNT_OWNER_COUNT:",len(shell_owners));print("EXACT_ASSIGNMENTS_STRING_SITE_COUNT:",len(exact_string_sites))
    print("CDP_TARGET_AVAILABLE:",bool(pages));print("CURRENT_URL:",current);print("LIVE_EXACT_ASSIGNMENTS_CONTROL_COUNT:",len(live));print("EXACT_LIVE_ASSIGNMENTS_CONTROL_UNIQUE:",exact_live_unique)
    print("CLASSIFICATION:",cls)
    print("\n----- TOP SOURCE BINDING SITES -----")
    for x in ranked[:20]:print(json.dumps(x))
    print("\n----- ASSIGNMENT NAVIGATION CALLS -----")
    for x in assignment_calls[:30]:print(json.dumps(x))
    print("\n----- ASSIGNMENT PORTFOLIO MOUNT OWNERS -----")
    for x in shell_owners[:20]:print(json.dumps(x))
    print("\n----- LIVE EXACT ASSIGNMENTS CONTROLS -----")
    for x in live:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",data["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__":raise SystemExit(main())
