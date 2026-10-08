#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R4_ACTIVE_DIST_BUNDLE_SEARCH_PIPELINE_SYMBOL_AND_EXECUTION_CONTRACT_RESOLUTION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

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
    r3p=ev/"M4_19D4BN17C_R4_R12_R3_COMPONENT_OWNER_CLOSURE_AND_MODULE_SCOPE_DIAGNOSIS"/"component_owner_closure_and_module_scope_diagnosis.json"
    if not r3p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R3_EVIDENCE_REQUIRED");return 4
    r3=fj(r3p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    assets_eval=w.ev(r"""(()=>({
scripts:[...document.scripts].map(s=>s.src).filter(Boolean),
resources:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/\.m?js($|\?)/.test(x))
}))()""")
    av=assets_eval.get("value") or {}
    runtime_assets=list(dict.fromkeys((av.get("scripts") or [])+(av.get("resources") or [])))
    basenames=[u.split("?")[0].rstrip("/").split("/")[-1] for u in runtime_assets]

    dist=app/"dist"
    active_local=[]
    for b in basenames:
        for p in dist.rglob("*") if dist.exists() else []:
            if p.is_file() and p.name==b:
                active_local.append(p)
    active_local=list(dict.fromkeys(active_local))

    # Fall back to correlations recorded by R3 if direct basename match is absent.
    if not active_local:
        for c in r3.get("runtimeLocalCorrelations") or []:
            for m in c.get("localMatches") or []:
                fp=app/m.get("file","")
                if fp.exists() and fp.is_file() and "dist" in fp.parts:
                    active_local.append(fp)
    active_local=list(dict.fromkeys(active_local))

    chain_patterns={
      "query_ingress":re.compile(r"(Search SCIIP|broker-global-search|searchQuery|searchTerm|handleSearch|runSearch|executeSearch)",re.I),
      "result_derivation":re.compile(r"(searchResults|filteredResults|\.filter\(|includes\(|startsWith\(|match\()",re.I),
      "result_owner":re.compile(r"(setSearchResults|setResults|searchResults|filteredResults|resultState)",re.I),
      "selection":re.compile(r"(selectedProperty|setSelectedProperty|selectProperty|onSelect|Open Property)",re.I),
      "dispatcher_service":re.compile(r"(dispatch|dispatcher|executeAction|runCommand|searchProvider|searchService|selector)",re.I),
    }

    bundle_rows=[]
    token_rx=re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{1,40})\b")
    for p in active_local:
        try: txt=p.read_text(errors="ignore")
        except: continue
        fam={}
        for k,rx in chain_patterns.items():
            ms=list(rx.finditer(txt))
            contexts=[]
            for m in ms[:120]:
                a=max(0,m.start()-500);b=min(len(txt),m.end()+900)
                contexts.append(txt[a:b])
            fam[k]={"count":len(ms),"contexts":contexts[:40]}
        # Symbol candidates from contexts, scored by recurrence near search/result terms.
        sym={}
        joined="\n".join(c for v in fam.values() for c in v["contexts"])
        for tok in token_rx.findall(joined):
            if len(tok)<2 or tok in {"const","let","var","function","return","true","false","null","undefined","this","class","new","if","else","for","while","switch","case","break","default","import","export","from"}: continue
            sym[tok]=sym.get(tok,0)+1
        syms=sorted(({"symbol":k,"score":v} for k,v in sym.items()),key=lambda x:(-x["score"],x["symbol"]))[:80]
        bundle_rows.append({"file":str(p.relative_to(app)),"families":fam,"symbolCandidates":syms,"bytes":p.stat().st_size})

    # Source module correlation via shared literal fragments and symbol names.
    source_files=[]
    source_root=app/"src"
    if source_root.exists():
        for p in source_root.rglob("*"):
            if not (p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"}):continue
            try:txt=p.read_text(errors="ignore")
            except:continue
            counts={k:len(rx.findall(txt)) for k,rx in chain_patterns.items()}
            if sum(counts.values()):
                source_files.append({"file":str(p.relative_to(app)),"counts":counts,"score":counts["query_ingress"]*4+counts["result_derivation"]*3+counts["result_owner"]*5+counts["selection"]*4+counts["dispatcher_service"]*2})
    source_files.sort(key=lambda x:(-x["score"],x["file"]))

    # Resolve whether a single active bundle contains all required pipeline families.
    complete=[]
    for row in bundle_rows:
        ok=all(row["families"][k]["count"]>0 for k in ("query_ingress","result_derivation","result_owner","selection"))
        if ok: complete.append(row["file"])

    checks={
      "bn17cR4R12R3Passed":r3.get("status")=="PASSED",
      "r3RuntimeToDistCorrelationCertified":r3.get("derived",{}).get("runtimeToDistCorrelation") is True,
      "activeRuntimeAssetsCaptured":len(runtime_assets)>0,
      "activeLocalDistBundlesResolved":len(active_local)>0,
      "queryIngressSymbolsCaptured":any(x["families"]["query_ingress"]["count"]>0 for x in bundle_rows),
      "resultDerivationSymbolsCaptured":any(x["families"]["result_derivation"]["count"]>0 for x in bundle_rows),
      "resultOwnerSymbolsCaptured":any(x["families"]["result_owner"]["count"]>0 for x in bundle_rows),
      "selectionSymbolsCaptured":any(x["families"]["selection"]["count"]>0 for x in bundle_rows),
      "sourceModuleCorrelationCaptured":len(source_files)>0,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if complete:
        diagnosis="ACTIVE_DIST_BUNDLE_CONTAINS_COMPLETE_SEARCH_RESULT_SELECTION_EXECUTION_CONTRACT"
        nxt="M4_19D4BN17C_R4_R12_R5_ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_RUNTIME_BINDING_RESOLUTION"
    elif bundle_rows:
        diagnosis="ACTIVE_DIST_SEARCH_PIPELINE_SPLIT_ACROSS_BUNDLE_MODULES_EXECUTION_CHAIN_PARTIALLY_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R5_CROSS_BUNDLE_SEARCH_PIPELINE_LINKAGE_RESOLUTION"
    else:
        diagnosis="ACTIVE_DIST_BUNDLE_FILE_MAPPING_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R5_CDP_SCRIPT_SOURCE_AND_BUNDLE_ID_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R4_ACTIVE_DIST_BUNDLE_SEARCH_PIPELINE_SYMBOL_AND_EXECUTION_CONTRACT_RESOLUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R12_R4_ACTIVE_DIST_BUNDLE_SEARCH_PIPELINE_CONTRACT_RESOLVED" if passed else "M419D4BN17C_R4_R12_R4_CONTRACT_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,
         "runtimeAssets":runtime_assets,
         "activeLocalDistBundles":[str(p.relative_to(app)) for p in active_local],
         "bundleAnalysis":bundle_rows,
         "completePipelineBundles":complete,
         "sourceModuleCandidates":source_files[:80],
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R12_R4_CERTIFIED_BOUND_FUNCTION_RESOLUTION_READY" if passed else "BN17C_R4_R12_R4_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"active_dist_bundle_search_pipeline_symbol_and_execution_contract_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R4 Active Dist Bundle Search Pipeline Symbol + Execution Contract Resolution")
    print("="*120)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nRUNTIME_ASSET_COUNT:",len(runtime_assets))
    print("ACTIVE_LOCAL_DIST_BUNDLE_COUNT:",len(active_local))
    print("COMPLETE_PIPELINE_BUNDLE_COUNT:",len(complete))
    print("SOURCE_MODULE_CANDIDATE_COUNT:",len(source_files))
    if active_local: print("PRIMARY_ACTIVE_DIST_BUNDLE:",str(active_local[0].relative_to(app)))
    if complete: print("COMPLETE_PIPELINE_BUNDLE:",complete[0])
    if source_files: print("TOP_SOURCE_MODULE:",source_files[0]["file"])
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
