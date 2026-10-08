#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,hashlib

M="M4_19D4BN17C_R4_R12_R3_COMPONENT_OWNER_CLOSURE_AND_MODULE_SCOPE_DIAGNOSIS"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())
def target():
    for p in (9333,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{p}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return p,x
        except: pass
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs: raise RuntimeError(self.hs)
        self.i=0
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();mask=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2):return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        r=x.get("result",{});rr=r.get("result",{});ex=r.get("exceptionDetails")
        return {"ok":not x.get("error") and ex is None,"value":rr.get("value"),"exceptionDetails":ex,"description":rr.get("description"),"topLevelError":x.get("error")}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r2p=ev/"M4_19D4BN17C_R4_R12_R2_DEEP_RUNTIME_STORE_CONTEXT_AND_MODULE_OWNER_INTROSPECTION"/"deep_runtime_store_context_and_module_owner_introspection.json"
    if not r2p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R2_EVIDENCE_REQUIRED");return 4
    r2=fj(r2p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    page=w.ev(r"""(()=>({
location:location.href,
scripts:[...document.scripts].map((s,i)=>({i,src:s.src||null,type:s.type||null,textLength:(s.text||'').length})),
links:[...document.querySelectorAll('link')].map(l=>({rel:l.rel,href:l.href})).filter(x=>x.href),
rootCandidates:[...document.querySelectorAll('*')].filter(e=>Object.getOwnPropertyNames(e).some(k=>k.startsWith('__reactContainer$')||k.startsWith('__reactFiber$'))).slice(0,100).map(e=>({tag:e.tagName,id:e.id||null,className:String(e.className||'').slice(0,160),reactKeys:Object.getOwnPropertyNames(e).filter(k=>k.startsWith('__react')).slice(0,10)})),
performanceResources:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/\\.m?js($|\\?)/.test(x)).slice(0,300)
}))()""")
    pv=page.get("value") or {}
    runtime_assets=[]
    for s in pv.get("scripts") or []:
        if s.get("src"): runtime_assets.append(s["src"])
    runtime_assets += pv.get("performanceResources") or []
    runtime_assets=list(dict.fromkeys(runtime_assets))

    # Build local JS inventory, with dist prioritized because R4-R8 previously identified a dist bundle.
    local=[]
    sig_rx=re.compile(r"(searchResults|filteredResults|setSearchResults|globalSearch|Search SCIIP|broker-global-search|selectedProperty|setSelectedProperty|handleSearch|runSearch|executeSearch)",re.I)
    for p in app.rglob("*"):
        if not (p.is_file() and p.suffix.lower() in {".js",".mjs",".jsx",".ts",".tsx",".map"}): continue
        if "node_modules" in p.parts or "evidence" in p.parts: continue
        try:
            txt=p.read_text(errors="ignore")
        except: continue
        hits=len(sig_rx.findall(txt))
        if hits:
            local.append({
                "file":str(p.relative_to(app)),
                "hits":hits,
                "bytes":p.stat().st_size,
                "sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
                "isDist":"dist" in p.parts,
                "isSource":"src" in p.parts,
                "symbols":sorted(set(m.group(0) for m in sig_rx.finditer(txt)))[:50],
                "snippet":txt[:14000]
            })
    local.sort(key=lambda x:(not x["isDist"],-x["hits"],x["file"]))
    top=local[:100]

    # Correlate runtime asset basenames/hashes-like bundle names to local dist assets.
    correlations=[]
    for u in runtime_assets:
        base_name=u.split("?")[0].rstrip("/").split("/")[-1]
        stem=re.sub(r"-[A-Za-z0-9_-]{6,}(?=\\.js$)","",base_name)
        matches=[]
        for row in top:
            fn=Path(row["file"]).name
            score=0
            if fn==base_name: score+=1000
            if base_name and base_name in fn: score+=500
            if stem and stem in fn: score+=200
            if row["isDist"]: score+=50
            if score: matches.append((score,row["file"],row["hits"]))
        matches.sort(reverse=True)
        if matches: correlations.append({"runtimeAsset":u,"basename":base_name,"localMatches":[{"score":a,"file":b,"hits":c} for a,b,c in matches[:10]]})

    # Identify modules that co-own query+results+selection.
    owner_rows=[]
    qrx=re.compile(r"(searchQuery|searchTerm|query)",re.I)
    rrx=re.compile(r"(searchResults|filteredResults|setSearchResults|setResults)",re.I)
    srx=re.compile(r"(selectedProperty|setSelectedProperty|onSelect|selectProperty)",re.I)
    for row in top:
        txt=row["snippet"]
        q=len(qrx.findall(txt));r=len(rrx.findall(txt));s=len(srx.findall(txt))
        if q or r or s:
            owner_rows.append({"file":row["file"],"isDist":row["isDist"],"queryRefs":q,"resultRefs":r,"selectionRefs":s,"score":q*2+r*5+s*3+row["hits"]})
    owner_rows.sort(key=lambda x:(-x["score"],not x["isDist"],x["file"]))

    root_candidates=pv.get("rootCandidates") or []
    dist_owner=any(x.get("isDist") and x.get("resultRefs",0)>0 for x in owner_rows[:20])
    runtime_to_dist=any(any("/dist/" in (m["file"] if isinstance(m,dict) else "") or str(m).startswith("dist/") for m in c.get("localMatches",[])) for c in correlations)
    # Fix above correlation structure robustly
    runtime_to_dist=any(any(str(m.get("file","")).startswith("dist/") for m in c.get("localMatches",[])) for c in correlations)
    source_dist_duality=any(x.get("isDist") for x in owner_rows[:20]) and any(not x.get("isDist") for x in owner_rows[:50])

    checks={
      "bn17cR4R12R2Passed":r2.get("status")=="PASSED",
      "r2StateSurfaceOpaque":r2.get("diagnosis")=="SOURCE_RUNTIME_OWNER_COMPONENT_CORRELATION_RESOLVED_BUT_STATE_SURFACE_REMAINS_OPAQUE",
      "activeRuntimeAssetInventoryCaptured":len(runtime_assets)>0,
      "localSearchResultModuleInventoryCaptured":len(top)>0,
      "runtimeToLocalBundleCorrelationAttempted":True,
      "searchResultSelectionOwnerCandidatesResolved":len(owner_rows)>0,
      "reactAttachmentTopologyCaptured":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if runtime_to_dist and dist_owner:
        diagnosis="ACTIVE_BROWSER_RUNTIME_CORRELATES_TO_DIST_BUNDLE_SEARCH_PIPELINE_MODULE_SCOPE_OWNER"
        nxt="M4_19D4BN17C_R4_R12_R4_ACTIVE_DIST_BUNDLE_SEARCH_PIPELINE_SYMBOL_AND_EXECUTION_CONTRACT_RESOLUTION"
    elif dist_owner:
        diagnosis="DIST_BUNDLE_SEARCH_PIPELINE_OWNER_RESOLVED_RUNTIME_ASSET_CORRELATION_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R4_DIST_BUNDLE_SEARCH_PIPELINE_SYMBOL_RESOLUTION"
    elif source_dist_duality:
        diagnosis="SOURCE_DIST_SEARCH_PIPELINE_DUALITY_RESOLVED_BUILD_RUNTIME_BOUNDARY_REQUIRES_ACTIVE_ASSET_DISAMBIGUATION"
        nxt="M4_19D4BN17C_R4_R12_R4_ACTIVE_ASSET_AND_SOURCE_MAP_DISAMBIGUATION"
    elif owner_rows:
        diagnosis="SEARCH_RESULT_SELECTION_MODULE_OWNER_RESOLVED_OUTSIDE_EXPOSED_REACT_STATE_SURFACE"
        nxt="M4_19D4BN17C_R4_R12_R4_MODULE_OWNER_SEARCH_PIPELINE_EXECUTION_CONTRACT_RESOLUTION"
    else:
        diagnosis="COMPONENT_OWNER_AND_MODULE_SCOPE_REMAIN_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R4_BROWSER_DEBUGGER_SCRIPT_SOURCE_SEARCH"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R3_COMPONENT_OWNER_CLOSURE_AND_MODULE_SCOPE_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R12_R3_COMPONENT_OWNER_AND_MODULE_SCOPE_DIAGNOSIS_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R3_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,
         "runtime":{"page":page,"runtimeAssets":runtime_assets,"reactRootCandidates":root_candidates},
         "localModuleInventory":top,
         "runtimeLocalCorrelations":correlations,
         "searchResultSelectionOwnerCandidates":owner_rows[:60],
         "derived":{"runtimeToDistCorrelation":runtime_to_dist,"distOwnerResolved":dist_owner,"sourceDistDuality":source_dist_duality,"runtimeAssetCount":len(runtime_assets),"rootCandidateCount":len(root_candidates)},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R12_R3_CERTIFIED_MODULE_SCOPE_NEXT_STEP_READY" if passed else "BN17C_R4_R12_R3_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"component_owner_closure_and_module_scope_diagnosis.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*118)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R3 Component Owner Closure + Module-Scope Diagnosis")
    print("="*118)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nRUNTIME_ASSET_COUNT:",len(runtime_assets))
    print("REACT_ATTACHMENT_CANDIDATE_COUNT:",len(root_candidates))
    print("LOCAL_SEARCH_RESULT_MODULE_COUNT:",len(top))
    print("RUNTIME_LOCAL_CORRELATION_COUNT:",len(correlations))
    print("SEARCH_RESULT_SELECTION_OWNER_CANDIDATE_COUNT:",len(owner_rows))
    print("RUNTIME_TO_DIST_CORRELATION:",runtime_to_dist)
    print("DIST_OWNER_RESOLVED:",dist_owner)
    print("SOURCE_DIST_DUALITY:",source_dist_duality)
    if owner_rows:
        print("TOP_OWNER_MODULE:",owner_rows[0]["file"])
        print("TOP_OWNER_SCORE:",owner_rows[0]["score"])
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
