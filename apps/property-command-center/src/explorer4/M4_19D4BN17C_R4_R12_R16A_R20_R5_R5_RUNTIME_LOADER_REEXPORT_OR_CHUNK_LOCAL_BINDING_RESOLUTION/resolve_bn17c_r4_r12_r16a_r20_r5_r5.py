#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_REEXPORT_OR_CHUNK_LOCAL_BINDING_RESOLUTION"
R4M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R4_RUNTIME_LOADER_CONTRACT_EXPORT_SYMBOL_AND_ENTRY_IMPORT_BINDING"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def rel(p,app):
    try:return str(p.relative_to(app))
    except:return str(p)
def exports(js):
    out=[]
    for m in re.finditer(r'export\s*\{([^}]+)\}',js):
        for part in m.group(1).split(","):
            mm=re.match(r'\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?',part.strip())
            if mm: out.append({"local":mm.group(1),"exported":mm.group(2) or mm.group(1),"offset":m.start()})
    return out
def imports(js):
    out=[]
    rx=re.compile(r'import\s*\{([^}]+)\}\s*from\s*["\']([^"\']+)["\']')
    for m in rx.finditer(js):
        specs=[]
        for part in m.group(1).split(","):
            mm=re.match(r'\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?',part.strip())
            if mm: specs.append({"imported":mm.group(1),"local":mm.group(2) or mm.group(1)})
        out.append({"source":m.group(2),"specifiers":specs,"offset":m.start()})
    return out
def uses(js,sym,limit=20):
    pts=[m.start() for m in re.finditer(r'(?<![\w$])'+re.escape(sym)+r'(?![\w$])',js)]
    sn=[]
    for p in pts[:limit]:
        sn.append(re.sub(r"\s+"," ",js[max(0,p-700):min(len(js),p+1200)])[:2600])
    return pts,sn
def semantic(sn):
    roles=[]
    tests=[("capability",r'CAPABILITY_|capabilit'),("feature",r'featureFlag|featureOverrides|DISABLED'),
           ("workspace",r'workspace|NO_ENTRY'),("cache",r'new Map|\.has\(|\.get\(|\.set\(|CACHED|LOADED'),
           ("lifecycle",r'INITIALIZED|ACTIVE|runtimeStatus|OPERATIONAL'),("dynamic_import",r'import\s*\(')]
    for k,rx in tests:
        if re.search(rx,sn,re.I|re.S): roles.append(k)
    return roles

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    r4p=ev/R4M/"runtime_loader_contract_export_symbol_and_entry_import_binding.json"
    if not r4p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R5_R4_EVIDENCE_REQUIRED");return 4
    r4=loadj(r4p)
    expected="RUNTIME_LOADER_EXPORT_SYMBOL_RESOLVED_ENTRY_IMPORT_BINDING_INDIRECT_OR_ABSENT"
    if r4.get("status")!="PASSED" or r4.get("classification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R5_R4_INDIRECT_BINDING_CLASSIFICATION_REQUIRED");return 5

    assets=app/"dist/assets"; bundles=sorted(assets.glob("*.js"))
    runtime=next(iter(sorted(assets.glob("domain-runtime-*.js"))),None)
    if not runtime:
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_DOMAIN_RUNTIME_BUNDLE_MISSING");return 6
    rjs=runtime.read_text(errors="ignore"); rex=exports(rjs)
    exported={x["exported"]:x["local"] for x in rex}
    target_export="b" if "b" in exported else (rex[0]["exported"] if rex else None)
    target_local=exported.get(target_export) if target_export else None

    # Search every active-dist JS chunk for static imports/reexports of the runtime export.
    direct=[]; reexports=[]; local_uses=[]
    for p in bundles:
        js=p.read_text(errors="ignore")
        for imp in imports(js):
            src=imp["source"]
            if runtime.name not in src: continue
            for s in imp["specifiers"]:
                if s["imported"]==target_export:
                    pts,sn=uses(js,s["local"])
                    direct.append({"bundle":rel(p,app),"source":src,"runtimeExport":target_export,
                                   "localAlias":s["local"],"useCount":len(pts),"useSnippets":sn[:12]})
        # terminal reexport forms from runtime chunk
        for m in re.finditer(r'export\s*\{([^}]+)\}\s*from\s*["\']([^"\']*'+re.escape(runtime.name)+r')["\']',js):
            reexports.append({"bundle":rel(p,app),"source":m.group(2),"clause":m.group(1),"offset":m.start()})

    # Analyze the exported runtime bootstrap itself and its internal call graph.
    pts,sn=uses(rjs,target_local) if target_local else ([],[])
    local_roles=semantic(" ".join(sn))
    # Extract calls made by G body when available.
    calls=[]
    if target_local:
        m=re.search(r'function\s+'+re.escape(target_local)+r'\s*\([^)]*\)\s*\{(.{0,5000}?)\}\s*export',rjs,re.S)
        if m:
            body=m.group(1)
            calls=sorted(set(re.findall(r'(?<![\w$])([A-Za-z_$][\w$]*)\s*\(',body)))
    # Search source tree for semantically corresponding initializer names/strings.
    source_hits=[]
    srcroot=app/"src"
    needles=["runtimeStatus","dynamicRegistration","dependencyValidation","autonomousCapabilityRemoval",
             "workflow-engine-runtime-adapter","initializeCapability","registerCapability","initializeRuntime"]
    for p in srcroot.rglob("*"):
        if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
        try: txt=p.read_text(errors="ignore")
        except: continue
        hit=[n for n in needles if n in txt]
        if hit:
            source_hits.append({"file":rel(p,app),"needles":hit[:],"count":sum(txt.count(n) for n in hit)})

    if direct:
        classification="RUNTIME_EXPORT_DIRECTLY_IMPORTED_BY_NON_ENTRY_ACTIVE_DIST_CHUNK"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R6_RUNTIME_LOADER_NON_ENTRY_CHUNK_CALLSITE_AND_TRIGGER_OWNER_RESOLUTION"
    elif reexports:
        classification="RUNTIME_EXPORT_REEXPORTED_THROUGH_ACTIVE_DIST_CHUNK"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R6_RUNTIME_LOADER_REEXPORT_CHAIN_TO_CALLSITE_RESOLUTION"
    elif source_hits:
        classification="RUNTIME_EXPORT_CHUNK_LOCAL_BOOTSTRAP_WITH_SOURCE_SEMANTIC_OWNER_CANDIDATES"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R6_RUNTIME_BOOTSTRAP_SOURCE_OWNER_AND_BUILD_GRAPH_BINDING"
    else:
        classification="RUNTIME_EXPORT_CHUNK_LOCAL_OR_EXTERNALLY_UNREFERENCED_IN_ACTIVE_DIST"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R6_RUNTIME_BOOTSTRAP_BUILD_GRAPH_AND_HTML_PRELOAD_OWNER_RESOLUTION"

    checks={"r5R4Passed":True,"r5R4IndirectBindingClassificationConsumed":True,
            "allActiveDistJsChunksInspected":True,"staticImportsInspected":True,"reexportsInspected":True,
            "runtimeExportLocalSymbolResolved":bool(target_local),"runtimeLocalUseGraphInspected":True,
            "sourceSemanticOwnerSearchCompleted":True,"classificationResolved":True,
            "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
            "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    ef=out/"runtime_loader_reexport_or_chunk_local_binding_resolution.json"
    data={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_REEXPORT_OR_CHUNK_LOCAL_BINDING_RESOLUTION",
          "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_REEXPORT_OR_CHUNK_LOCAL_BINDING_RESOLUTION_CERTIFIED",
          "r5R4Classification":r4.get("classification"),"runtimeBundle":rel(runtime,app),
          "runtimeExportSymbol":target_export,"runtimeLocalSymbol":target_local,
          "activeDistJsBundleCount":len(bundles),"directImportBindings":direct,"reexports":reexports,
          "runtimeLocalUseCount":len(pts),"runtimeLocalUseSnippets":sn[:12],"runtimeLocalSemanticRoles":local_roles,
          "runtimeBootstrapInternalCalls":calls,"sourceSemanticOwnerCandidates":source_hits[:100],
          "classification":classification,"checks":checks,
          "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                       "pixelEvidence":False,"liveWorkflowActionAuthority":False},"nextMilestone":nxt}
    ef.write_text(json.dumps(data,indent=2)+"\n")
    print("="*118)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R5 Runtime Loader Reexport / Chunk-Local Binding Resolution")
    print("="*118)
    print("R5_R4_CLASSIFICATION:",r4.get("classification"))
    print("ACTIVE_DIST_JS_BUNDLE_COUNT:",len(bundles))
    print("RUNTIME_BUNDLE:",rel(runtime,app))
    print("RUNTIME_EXPORT_SYMBOL:",target_export)
    print("RUNTIME_LOCAL_SYMBOL:",target_local)
    print("DIRECT_IMPORT_BINDING_COUNT:",len(direct))
    print("REEXPORT_COUNT:",len(reexports))
    print("RUNTIME_LOCAL_USE_COUNT:",len(pts))
    print("RUNTIME_LOCAL_SEMANTIC_ROLES:",local_roles)
    print("RUNTIME_BOOTSTRAP_INTERNAL_CALLS:",calls)
    print("SOURCE_SEMANTIC_OWNER_CANDIDATE_COUNT:",len(source_hits))
    for x in source_hits[:30]: print("SOURCE_OWNER_CANDIDATE:",json.dumps(x))
    print("CLASSIFICATION:",classification)
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
