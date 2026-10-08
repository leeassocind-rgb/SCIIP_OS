#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_DIAGNOSIS"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_BOUNDED_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:
            return r.read().decode("utf-8","ignore")
    except:
        return None

def ws_targets(port=9333):
    try:
        x=get(f"http://127.0.0.1:{port}/json")
        return json.loads(x) if x else []
    except:
        return []

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:
            raise RuntimeError(f"bad websocket url: {u!r}")
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode())
        b=b""
        while b"\r\n\r\n" not in b:
            b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:
            raise RuntimeError("websocket handshake failed")
        self.i=0

    def send(self,obj):
        payload=json.dumps(obj).encode()
        mask=os.urandom(4)
        n=len(payload)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h.extend([0x80|126]); h.extend(struct.pack("!H",n))
        else:
            h.extend([0x80|127]); h.extend(struct.pack("!Q",n))
        masked=bytes(b^mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(bytes(h)+mask+masked)

    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h
        n=b2&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b2&128 else None
        data=b""
        while len(data)<n:
            data+=self.s.recv(n-len(data))
        if mask:
            data=bytes(b^mask[i%4] for i,b in enumerate(data))
        if (b1&15)==1:
            try:return json.loads(data.decode())
            except:return None
        return None

    def call(self,method,params=None):
        self.i+=1
        i=self.i
        self.send({"id":i,"method":method,"params":params or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:
                return x

def evaluate(w,expr):
    r=w.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

def compact(s,n=9000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    pp=ev/PREV/"bounded_state_transition_and_export_control_materialization_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R2_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected="EXACT_GENERATE_CLIENT_LISTING_REPORT_CONTROL_NOT_UNIQUELY_MATERIALIZED"
    if prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R2_EXACT_GENERATE_CONTROL_ABSENCE_REQUIRED")
        return 5

    src=app/"src"

    # Find all source imports/mounts of ListingAssignmentProductionHouse and nearby route/state owners.
    import_sites=[]
    mount_sites=[]
    control_labels=set()
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"}:
            continue
        if "src/explorer4/" in str(p):
            continue
        try:s=p.read_text(errors="ignore")
        except:continue

        if "ListingAssignmentProductionHouse" in s:
            for m in re.finditer(r'ListingAssignmentProductionHouse',s):
                w=s[max(0,m.start()-2500):min(len(s),m.start()+4500)]
                kind="IMPORT_OR_REFERENCE"
                if re.search(r'import[\s\S]{0,200}ListingAssignmentProductionHouse',w):
                    kind="IMPORT"
                if "<ListingAssignmentProductionHouse" in w:
                    kind="MOUNT_OR_REFERENCE"
                import_sites.append({
                    "file":str(p.relative_to(app)),
                    "line":s.count("\n",0,m.start())+1,
                    "kind":kind,
                    "snippet":compact(w)
                })

            for m in re.finditer(r'<ListingAssignmentProductionHouse\b',s):
                w=s[max(0,m.start()-3500):min(len(s),m.start()+5500)]
                conds=[]
                for cm in re.finditer(r'([A-Za-z_$][\w$.\[\]()"\'=!<>&|?: -]{0,220})\s*(?:&&|\?)\s*$',w[:m.start()-max(0,m.start()-3500)],re.M):
                    conds.append(cm.group(1).strip())

                labels=[]
                for bm in re.finditer(r'<(?:button|a)\b([^>]*)>(.*?)</(?:button|a)>',w,re.S|re.I):
                    text=re.sub(r'<[^>]+>',' ',bm.group(2))
                    text=compact(text,350)
                    if re.search(r'assignment|listing|production|broker|workspace',text,re.I):
                        labels.append(text)
                        control_labels.add(text)

                mount_sites.append({
                    "file":str(p.relative_to(app)),
                    "line":s.count("\n",0,m.start())+1,
                    "nearestConditional":conds[-1] if conds else None,
                    "labels":labels,
                    "snippet":compact(w)
                })

    # Find direct source navigation/control references to assignment workspace.
    source_nav=[]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"}:
            continue
        if "src/explorer4/" in str(p):
            continue
        try:s=p.read_text(errors="ignore")
        except:continue
        for m in re.finditer(r'<(?:button|a)\b([^>]*)>(.*?)</(?:button|a)>',s,re.S|re.I):
            text=compact(re.sub(r'<[^>]+>',' ',m.group(2)),400)
            if re.search(r'\bAssignments?\b|Listing Assignment|Production House|Broker',text,re.I):
                source_nav.append({
                    "file":str(p.relative_to(app)),
                    "line":s.count("\n",0,m.start())+1,
                    "text":text,
                    "markup":compact(m.group(0),2200)
                })
                control_labels.add(text)

    # Live DOM inventory only; no clicks.
    targets=ws_targets(9333)
    pages=[t for t in targets if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    cdp_available=bool(pages)
    current_url=None
    live_controls=[]
    body_flags={}

    if pages:
        w=WS(pages[0]["webSocketDebuggerUrl"])
        w.call("Runtime.enable")
        current_url=evaluate(w,"location.href")
        live_controls=evaluate(w,r"""(() => [...document.querySelectorAll('button,a,[role=button],[role=tab]')].map((el,i)=>({
          i,tag:el.tagName,text:(el.innerText||el.textContent||'').trim(),
          aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',
          role:el.getAttribute('role')||'',disabled:!!el.disabled,
          visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length),
          href:el.getAttribute('href')||'',cls:el.className||''
        })).filter(x=>x.visible && /assignment|listing|production|broker|workspace/i.test([x.text,x.aria,x.title].join(' '))).slice(0,250))()""") or []

        body_flags=evaluate(w,r"""(() => {
          const t=document.body?.innerText||'';
          return {
            hasListingAssignmentProductionHouse:/Listing Assignment|Production House/i.test(t),
            hasAssignments:/Assignments?/i.test(t),
            hasGenerateClientListingReport:/Generate Client Listing Report/i.test(t)
          };
        })()""") or {}

    # Exact lexical correlation by normalized full labels.
    normalized_source={}
    for label in sorted(control_labels):
        n=re.sub(r'\s+',' ',label).strip().lower()
        if n:
            normalized_source[n]=label

    exact_bindings=[]
    partial_bindings=[]
    for lc in live_controls:
        lt=re.sub(r'\s+',' ',(lc.get("text","") or "")).strip().lower()
        if lt in normalized_source:
            exact_bindings.append({**lc,"sourceLabel":normalized_source[lt]})
        else:
            words=set(re.findall(r'[a-z0-9]+',lt))
            best=None
            for n,label in normalized_source.items():
                sw=set(re.findall(r'[a-z0-9]+',n))
                overlap=len(words & sw)
                if overlap and (best is None or overlap>best[0]):
                    best=(overlap,label)
            if best:
                partial_bindings.append({**lc,"sourceLabel":best[1],"overlap":best[0]})

    # Special exact live candidate: visible "Assignments" button is accepted only if source also has exact Assignments.
    assignments_exact=[
        x for x in live_controls
        if re.fullmatch(r'Assignments?',(x.get("text","") or "").strip(),re.I) and not x.get("disabled")
    ]
    source_assignments_exact=[
        x for x in source_nav
        if re.fullmatch(r'Assignments?',(x.get("text","") or "").strip(),re.I)
    ]

    if mount_sites and assignments_exact and source_assignments_exact:
        cls="ASSIGNMENT_WORKSPACE_MOUNT_OWNER_AND_EXACT_LIVE_ENTRY_CONTROL_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION"
        status="PASSED"
    elif mount_sites and live_controls:
        cls="ASSIGNMENT_WORKSPACE_MOUNT_OWNER_RESOLVED_LIVE_ENTRY_CONTROL_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_ASSIGNMENT_ENTRY_HANDLER_SOURCE_BINDING_RESOLUTION"
        status="PASSED"
    elif mount_sites:
        cls="ASSIGNMENT_WORKSPACE_MOUNT_OWNER_RESOLVED_NO_LIVE_ENTRY_CONTROL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_PARENT_SHELL_ASSIGNMENT_CONTROL_VISIBILITY_DIAGNOSIS"
        status="DIAGNOSTIC_COMPLETE"
    else:
        cls="LISTING_ASSIGNMENT_PRODUCTION_HOUSE_MOUNT_OWNER_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R2_COMPONENT_IMPORT_GRAPH_AND_MOUNT_OWNER_CLOSURE"
        status="DIAGNOSTIC_COMPLETE"

    checks={
        "r21R2R2DiagnosticConsumed":True,
        "listingAssignmentProductionHouseImportsInspected":True,
        "listingAssignmentProductionHouseMountSitesInspected":True,
        "sourceAssignmentNavigationControlsInspected":True,
        "liveAssignmentNavigationControlsInventoried":cdp_available,
        "exactAssignmentEntryBindingAttempted":True,
        "assignmentEntryInvocationOff":True,
        "generateReportInvocationOff":True,
        "exportControlInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "pixelEvidenceOff":True
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"assignment_workspace_entry_and_generate_control_materialization_diagnosis.json"
    data={
        "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_RESOLVED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_INCOMPLETE",
        "r21R2R2Classification":prev.get("classification"),
        "importReferenceCount":len(import_sites),
        "importReferences":import_sites[:80],
        "mountSiteCount":len(mount_sites),
        "mountSites":mount_sites[:50],
        "sourceAssignmentNavigationControlCount":len(source_nav),
        "sourceAssignmentNavigationControls":source_nav[:100],
        "cdpTargetAvailable":cdp_available,
        "currentUrl":current_url,
        "liveAssignmentNavigationControlCount":len(live_controls),
        "liveAssignmentNavigationControls":live_controls[:100],
        "bodyFlags":body_flags,
        "exactSourceLiveBindingCount":len(exact_bindings),
        "exactSourceLiveBindings":exact_bindings[:100],
        "partialSourceLiveBindings":partial_bindings[:100],
        "exactAssignmentsLiveCount":len(assignments_exact),
        "exactAssignmentsSourceCount":len(source_assignments_exact),
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "pixelEvidence":False,
            "assignmentEntryInvocation":False,
            "generateReportInvocation":False,
            "exportControlInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R2-R2-R1 Assignment Workspace Entry + Generate Control Materialization Diagnosis")
    print("="*120)
    print("R21_R2_R2_CLASSIFICATION:",prev.get("classification"))
    print("IMPORT_REFERENCE_COUNT:",len(import_sites))
    print("MOUNT_SITE_COUNT:",len(mount_sites))
    print("SOURCE_ASSIGNMENT_NAV_CONTROL_COUNT:",len(source_nav))
    print("CDP_TARGET_AVAILABLE:",cdp_available)
    print("CURRENT_URL:",current_url)
    print("LIVE_ASSIGNMENT_NAV_CONTROL_COUNT:",len(live_controls))
    print("EXACT_SOURCE_LIVE_BINDING_COUNT:",len(exact_bindings))
    print("EXACT_ASSIGNMENTS_LIVE_COUNT:",len(assignments_exact))
    print("EXACT_ASSIGNMENTS_SOURCE_COUNT:",len(source_assignments_exact))
    print("BODY_FLAGS:",json.dumps(body_flags))
    print("CLASSIFICATION:",cls)

    print("\n----- MOUNT SITES -----")
    for x in mount_sites[:30]:
        print(json.dumps(x))
    print("\n----- SOURCE ASSIGNMENT CONTROLS -----")
    for x in source_nav[:50]:
        print(json.dumps(x))
    print("\n----- LIVE ASSIGNMENT CONTROLS -----")
    for x in live_controls[:50]:
        print(json.dumps(x))
    print("\n----- EXACT SOURCE → LIVE BINDINGS -----")
    for x in exact_bindings[:50]:
        print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
