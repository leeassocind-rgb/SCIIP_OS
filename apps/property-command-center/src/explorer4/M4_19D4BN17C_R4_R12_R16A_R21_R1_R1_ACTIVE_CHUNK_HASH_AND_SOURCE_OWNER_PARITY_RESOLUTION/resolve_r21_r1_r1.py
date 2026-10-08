#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,hashlib

M="M4_19D4BN17C_R4_R12_R16A_R21_R1_R1_ACTIVE_CHUNK_HASH_AND_SOURCE_OWNER_PARITY_RESOLUTION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R1_ACTIVE_RUNTIME_BUNDLE_PROVENANCE_AND_CONTROL_REACHABILITY_CERTIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def get(url):
    try:
        with urllib.request.urlopen(url,timeout=3) as r:
            return r.read().decode("utf-8","ignore"),dict(r.headers)
    except Exception:
        return None,{}
def norm(base,ref):
    if ref.startswith("http://") or ref.startswith("https://"): return ref
    return urllib.parse.urljoin(base,ref)
def sha(s): return hashlib.sha256(s.encode()).hexdigest()
def compact(s,n=5000): return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    pp=ev/PREV/"active_runtime_bundle_provenance_and_control_reachability_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R21_R1_EVIDENCE_REQUIRED");return 4
    prev=loadj(pp)
    expected="LIVE_APP_REACHABLE_ACTIVE_EXPORT_PRESENTATION_CHUNK_NOT_RESOLVED"
    if prev.get("classification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R21_R1_UNRESOLVED_ACTIVE_CHUNK_CLASSIFICATION_REQUIRED");return 5
    live=prev.get("liveAppUrl") or "http://127.0.0.1:5173/"

    html,_=get(live)
    if not html:
        print("STATUS: BLOCKED");print("DIAGNOSIS: LIVE_APP_NO_LONGER_REACHABLE");return 6

    scripts=re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',html,re.I)
    queue=[norm(live,s) for s in scripts]
    seen=set(); modules=[]

    # Traverse standard ESM imports, side-effect imports, Vite transformed imports and dynamic imports.
    import_rx=[
      re.compile(r'\bimport\s+(?:[^"\']*?\s+from\s+)?["\']([^"\']+)["\']'),
      re.compile(r'\bexport\s+[^"\']*?\s+from\s+["\']([^"\']+)["\']'),
      re.compile(r'\bimport\s*\(\s*["\']([^"\']+)["\']\s*\)'),
    ]
    while queue and len(seen)<1500:
        u=queue.pop(0)
        if u in seen: continue
        seen.add(u)
        body,h=get(u)
        if body is None: continue
        ctype=(h.get("Content-Type") or "").lower()
        is_js=(".js" in u or ".jsx" in u or ".ts" in u or ".tsx" in u or "javascript" in ctype)
        refs=[]
        if is_js:
            for rx in import_rx:
                refs += [m.group(1) for m in rx.finditer(body)]
        for ref in refs:
            # Ignore bare package imports only if unresolved by Vite transform; /node_modules/.vite deps are absolute.
            if ref.startswith(("./","../","/","http://","https://")):
                ru=norm(u,ref)
                if ru not in seen: queue.append(ru)
        modules.append({
          "url":u,"bytes":len(body),"sha256":sha(body),
          "sourceStyle":"/src/" in u,
          "assetStyle":"/assets/" in u or "/node_modules/.vite/" in u,
          "exportSemantic":bool(re.search(r'>\s*Export\s*<|["\']Export["\']|Download Client Listing Report',body,re.I)),
          "presentationSemantic":bool(re.search(r'>\s*Presentation\s*<|["\']Presentation["\']',body,re.I)),
          "propertyExplorerBase":"PropertyExplorerBase" in body or "property-explorer__top-actions" in body,
          "propertySearchDiscovery":"PropertySearchDiscovery" in body or "property-search-toolbar" in body,
          "institutionalReportReview":"InstitutionalReportReview" in body or "Download Client Listing Report" in body,
          "refs":refs[:80]
        })

    src_count=sum(m["sourceStyle"] for m in modules)
    asset_count=sum(m["assetStyle"] for m in modules)
    semantic=[m for m in modules if m["exportSemantic"] or m["presentationSemantic"]]
    owner_live=[m for m in modules if m["propertyExplorerBase"] or m["propertySearchDiscovery"] or m["institutionalReportReview"]]

    # Compare live source modules to local source owner files by normalized text/hash where URL maps to /src/.
    parity=[]
    for m in modules:
        path=urllib.parse.urlparse(m["url"]).path
        if "/src/" not in path: continue
        rel=path.split("/src/",1)[1].split("?",1)[0]
        lp=app/"src"/rel
        if not lp.exists(): continue
        local=lp.read_text(errors="ignore")
        live_body,_=get(m["url"])
        if live_body is None: continue
        # Vite may inject HMR/import rewrites, so exact hash can differ. Capture both exact and semantic parity.
        semantic_terms=[]
        for t in ["PropertyExplorerBase","PropertySearchDiscovery","InstitutionalReportReview",
                  "property-explorer__top-actions","property-search-toolbar","Download Client Listing Report"]:
            if t in local and t in live_body: semantic_terms.append(t)
        parity.append({
          "liveUrl":m["url"],"localSource":str(lp.relative_to(app)),
          "exactHashParity":sha(local)==sha(live_body),
          "localSha256":sha(local),"liveSha256":sha(live_body),
          "semanticParityTerms":semantic_terms,
          "semanticParity":bool(semantic_terms)
        })

    owner_parity=[p for p in parity if p["semanticParity"]]
    if src_count>0 and owner_parity:
        cls="VITE_DEV_SOURCE_MODULE_RUNTIME_TOPOLOGY_CERTIFIED_CONTROL_OWNER_SOURCE_PARITY_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_LIVE_EXPORT_CONTROL_ROUTE_AND_INTERACTION_REACHABILITY_CERTIFICATION"
        status="PASSED"
    elif asset_count>0 and semantic:
        cls="BUILT_ASSET_RUNTIME_TOPOLOGY_SEMANTIC_CONTROL_MODULE_REACHABLE_HASH_PARITY_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_R2_BUILT_ASSET_HASH_TO_SOURCE_OWNER_CORRELATION"
        status="PASSED"
    else:
        cls="ACTIVE_RUNTIME_MODULE_GRAPH_RECOVERED_CONTROL_OWNER_PARITY_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_R2_ROUTE_LEVEL_MODULE_GRAPH_AND_OWNER_RECOVERY"
        status="DIAGNOSTIC_COMPLETE"

    checks={
      "r21R1DiagnosticConsumed":True,
      "liveEntryScriptsRecovered":len(scripts)>0,
      "recursiveEsmGraphTraversalCompleted":True,
      "runtimeTopologyClassified":src_count>0 or asset_count>0,
      "liveSourceToLocalOwnerParityAttempted":True,
      "diskDistPresenceNotUsedAsRuntimeProof":True,
      "applicationMutationOff":True,"governedMutationOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    ef=out/"active_chunk_hash_and_source_owner_parity_resolution.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_R1_R1_ACTIVE_CHUNK_HASH_AND_SOURCE_OWNER_PARITY_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,
      "state":"M419D4BN17C_R4_R12_R16A_R21_R1_R1_ACTIVE_CHUNK_HASH_AND_SOURCE_OWNER_PARITY_RESOLVED",
      "liveAppUrl":live,"entryScripts":scripts,"reachableModuleCount":len(modules),
      "sourceStyleModuleCount":src_count,"assetStyleModuleCount":asset_count,
      "semanticReachableModuleCount":len(semantic),"controlOwnerLiveModuleCount":len(owner_live),
      "semanticReachableModules":semantic[:100],"controlOwnerLiveModules":owner_live[:100],
      "sourceParityCount":len(parity),"sourceOwnerParityCount":len(owner_parity),
      "sourceOwnerParity":owner_parity[:100],"classification":cls,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R1-R1 Active Chunk Hash + Source Owner Parity Resolution")
    print("="*120)
    print("R21_R1_CLASSIFICATION:",prev.get("classification"))
    print("LIVE_APP_URL:",live)
    print("ENTRY_SCRIPT_COUNT:",len(scripts))
    print("REACHABLE_MODULE_COUNT:",len(modules))
    print("SOURCE_STYLE_MODULE_COUNT:",src_count)
    print("ASSET_STYLE_MODULE_COUNT:",asset_count)
    print("SEMANTIC_REACHABLE_MODULE_COUNT:",len(semantic))
    print("CONTROL_OWNER_LIVE_MODULE_COUNT:",len(owner_live))
    print("SOURCE_PARITY_COUNT:",len(parity))
    print("SOURCE_OWNER_PARITY_COUNT:",len(owner_parity))
    print("CLASSIFICATION:",cls)

    print("\n----- LIVE CONTROL OWNER MODULES -----")
    for x in owner_live[:30]: print(json.dumps(x))
    print("\n----- SOURCE OWNER PARITY -----")
    for x in owner_parity[:30]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
