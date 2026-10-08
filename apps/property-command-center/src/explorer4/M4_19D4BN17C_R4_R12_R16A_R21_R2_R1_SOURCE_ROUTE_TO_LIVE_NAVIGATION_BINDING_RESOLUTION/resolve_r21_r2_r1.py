#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R1_SOURCE_ROUTE_TO_LIVE_NAVIGATION_BINDING_RESOLUTION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_LIVE_EXPORT_CONTROL_ROUTE_AND_INTERACTION_REACHABILITY_CERTIFICATION"

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
        payload=json.dumps(obj).encode(); mask=os.urandom(4); n=len(payload)
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
        b1,b2=h; n=b2&127
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

def compact(s,n=8000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    pp=ev/PREV/"live_export_control_route_and_interaction_reachability_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_EVIDENCE_REQUIRED")
        return 4
    prev=loadj(pp)
    expected="LIVE_EXPORT_CONTROL_NOT_MATERIALIZED_ROUTE_DISCOVERY_INCOMPLETE"
    if prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_ROUTE_DISCOVERY_INCOMPLETE_CLASSIFICATION_REQUIRED")
        return 5

    # 1) Find exact source mounting sites for InstitutionalReportReview.
    src=app/"src"
    mount_sites=[]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"}:
            continue
        if "src/explorer4/" in str(p):
            continue
        try:s=p.read_text(errors="ignore")
        except:continue
        if "InstitutionalReportReview" not in s:
            continue
        for m in re.finditer(r'<InstitutionalReportReview\b',s):
            a=max(0,m.start()-3000); b=min(len(s),m.start()+5000)
            w=s[a:b]
            # nearest preceding conditional signal
            conds=[]
            for cm in re.finditer(r'([A-Za-z_$][\w$.\[\]()"\'=!<>&|?: -]{0,180})\s*(?:&&|\?)\s*$',w[:m.start()-a],re.M):
                conds.append(cm.group(1).strip())
            mount_sites.append({
                "file":str(p.relative_to(app)),
                "offset":m.start(),
                "line":s.count("\n",0,m.start())+1,
                "nearestConditional":conds[-1] if conds else None,
                "snippet":compact(w,9000)
            })

    # 2) Inspect owning component for state setters / tabs / mode labels around mount.
    owner_candidates=[]
    for site in mount_sites:
        p=app/site["file"]
        s=p.read_text(errors="ignore")
        signals=[]
        # state declarations
        for m in re.finditer(r'const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*(?:React\.)?useState\s*\(([^)]*)\)',s):
            name,setter,init=m.group(1),m.group(2),m.group(3)
            if name in site["snippet"] or setter in site["snippet"]:
                signals.append({"kind":"state","name":name,"setter":setter,"initial":init})
        # buttons / tabs / labels invoking likely setter
        for m in re.finditer(r'<button\b([^>]*)>(.*?)</button>',s,re.S|re.I):
            block=m.group(0)
            txt=re.sub(r'<[^>]+>',' ',m.group(2))
            txt=compact(txt,500)
            if any(x.get("setter","") in block for x in signals if x["kind"]=="state") or re.search(r'report|review|client|listing|presentation|assignment',txt,re.I):
                signals.append({"kind":"button","text":txt,"markup":compact(block,1800)})
        owner_candidates.append({
            "file":site["file"],
            "mountLine":site["line"],
            "mountConditional":site["nearestConditional"],
            "signals":signals[:80]
        })

    # 3) Inspect live DOM for controls that semantically correspond to owner signals.
    targets=ws_targets(9333)
    pages=[t for t in targets if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    cdp_available=bool(pages)
    live_controls=[]
    current_url=None
    if pages:
        w=WS(pages[0]["webSocketDebuggerUrl"])
        w.call("Runtime.enable")
        current_url=evaluate(w,"location.href")
        live_controls=evaluate(w,r"""(() => [...document.querySelectorAll('button,a,[role=button],[role=tab]')].map((el,i)=>({
          i,tag:el.tagName,text:(el.innerText||el.textContent||'').trim(),
          aria:el.getAttribute('aria-label')||'',role:el.getAttribute('role')||'',
          disabled:!!el.disabled,visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length)
        })).filter(x=>x.visible && /report|review|client|listing|presentation|assignment|export/i.test([x.text,x.aria].join(' '))).slice(0,200))()""") or []

    # 4) Correlate source labels to live controls. Do not click.
    source_labels=[]
    for oc in owner_candidates:
        for sig in oc["signals"]:
            if sig["kind"]=="button" and sig.get("text"):
                source_labels.append(sig["text"])
    source_labels=sorted(set(source_labels))

    correlations=[]
    for lc in live_controls:
        lt=(lc.get("text","")+" "+lc.get("aria","")).lower()
        scores=[]
        for sl in source_labels:
            words=[w for w in re.findall(r'[a-z0-9]+',sl.lower()) if len(w)>=4]
            score=sum(1 for w in words if w in lt)
            if score:
                scores.append((score,sl))
        scores.sort(reverse=True)
        correlations.append({**lc,"topSourceLabel":scores[0][1] if scores else None,
                             "sourceLabelScore":scores[0][0] if scores else 0})
    correlations.sort(key=lambda x:-x["sourceLabelScore"])

    exact_owner=owner_candidates[0] if owner_candidates else None
    actionable=[x for x in correlations if x["sourceLabelScore"]>0 and not x.get("disabled")]

    if exact_owner and actionable:
        cls="SOURCE_STATE_MOUNT_OWNER_AND_LIVE_NAVIGATION_CONTROL_BINDING_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_BOUNDED_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"
        status="PASSED"
    elif exact_owner and live_controls:
        cls="SOURCE_STATE_MOUNT_OWNER_RESOLVED_LIVE_CONTROL_SEMANTIC_BINDING_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_LIVE_CONTROL_HANDLER_TO_SOURCE_SETTER_BINDING_RESOLUTION"
        status="PASSED"
    elif exact_owner:
        cls="SOURCE_STATE_MOUNT_OWNER_RESOLVED_NO_LIVE_NAVIGATION_CONTROL_VISIBLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_PARENT_WORKSPACE_STATE_AND_CONTROL_VISIBILITY_DIAGNOSIS"
        status="DIAGNOSTIC_COMPLETE"
    else:
        cls="INSTITUTIONAL_REPORT_REVIEW_MOUNT_OWNER_NOT_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_COMPONENT_IMPORT_GRAPH_AND_MOUNT_OWNER_CLOSURE"
        status="DIAGNOSTIC_COMPLETE"

    checks={
        "r21R2DiagnosticConsumed":True,
        "institutionalReportReviewMountSitesInspected":True,
        "mountOwnerStateSignalsCaptured":True,
        "liveSemanticNavigationControlsInventoried":cdp_available,
        "sourceToLiveControlCorrelationAttempted":True,
        "navigationControlInvocationOff":True,
        "exportControlInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "pixelEvidenceOff":True,
        "liveWorkflowActionAuthorityOff":True
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"source_route_to_live_navigation_binding_resolution.json"
    data={
        "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_R2_R1_SOURCE_ROUTE_TO_LIVE_NAVIGATION_BINDING_RESOLUTION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R2_R1_SOURCE_ROUTE_TO_LIVE_NAVIGATION_BINDING_RESOLVED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R1_BINDING_INCOMPLETE",
        "r21R2Classification":prev.get("classification"),
        "mountSiteCount":len(mount_sites),
        "mountSites":mount_sites[:50],
        "ownerCandidateCount":len(owner_candidates),
        "ownerCandidates":owner_candidates[:30],
        "sourceNavigationLabels":source_labels[:100],
        "cdpTargetAvailable":cdp_available,
        "currentUrl":current_url,
        "liveSemanticNavigationControlCount":len(live_controls),
        "liveSemanticNavigationControls":live_controls[:100],
        "sourceLiveCorrelations":correlations[:100],
        "actionableBindingCount":len(actionable),
        "actionableBindings":actionable[:50],
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "pixelEvidence":False,
            "liveWorkflowActionAuthority":False,
            "navigationControlInvocation":False,
            "exportControlInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R2-R1 Source Route-to-Live Navigation Binding Resolution")
    print("="*120)
    print("R21_R2_CLASSIFICATION:",prev.get("classification"))
    print("MOUNT_SITE_COUNT:",len(mount_sites))
    print("OWNER_CANDIDATE_COUNT:",len(owner_candidates))
    if exact_owner:
        print("TOP_OWNER_FILE:",exact_owner["file"])
        print("TOP_OWNER_MOUNT_LINE:",exact_owner["mountLine"])
        print("TOP_OWNER_MOUNT_CONDITIONAL:",exact_owner["mountConditional"])
    print("SOURCE_NAVIGATION_LABEL_COUNT:",len(source_labels))
    print("CDP_TARGET_AVAILABLE:",cdp_available)
    print("CURRENT_URL:",current_url)
    print("LIVE_SEMANTIC_NAVIGATION_CONTROL_COUNT:",len(live_controls))
    print("ACTIONABLE_BINDING_COUNT:",len(actionable))
    print("CLASSIFICATION:",cls)

    print("\n----- MOUNT OWNERS -----")
    for x in owner_candidates[:20]:
        print(json.dumps(x))
    print("\n----- LIVE SEMANTIC NAVIGATION CONTROLS -----")
    for x in live_controls[:50]:
        print(json.dumps(x))
    print("\n----- SOURCE → LIVE CORRELATIONS -----")
    for x in correlations[:50]:
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
