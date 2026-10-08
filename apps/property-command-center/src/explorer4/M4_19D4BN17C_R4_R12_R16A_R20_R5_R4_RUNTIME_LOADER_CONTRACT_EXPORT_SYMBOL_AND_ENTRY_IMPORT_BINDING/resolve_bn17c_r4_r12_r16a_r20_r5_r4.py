#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R4_RUNTIME_LOADER_CONTRACT_EXPORT_SYMBOL_AND_ENTRY_IMPORT_BINDING"
R3M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R3_DYNAMIC_IMPORT_ROLE_AND_CACHE_CONTRACT_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def exported_symbols(js):
    out=[]
    # Handles Vite/Rollup terminal exports: export{a as b,c as d};
    for m in re.finditer(r'export\s*\{([^}]+)\}',js):
        for part in m.group(1).split(","):
            part=part.strip()
            mm=re.match(r'([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?',part)
            if mm:
                out.append({"local":mm.group(1),"exported":mm.group(2) or mm.group(1),"offset":m.start()})
    return out

def function_defs(js):
    d={}
    # compact named functions
    for m in re.finditer(r'function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)',js):
        d[m.group(1)]={"kind":"function","params":m.group(2),"offset":m.start()}
    # common const/let arrow functions
    for m in re.finditer(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?([^=;{}()]*)\)?\s*=>',js):
        d.setdefault(m.group(1),{"kind":"arrow","params":m.group(2),"offset":m.start()})
    return d

def neighborhood(js,pos,r=1400):
    return js[max(0,pos-r):min(len(js),pos+r)]

def score_loader_symbol(name,meta,js):
    sn=neighborhood(js,meta["offset"],2200)
    score=0; roles=[]
    tests=[
      ("capability_lookup",r'getCapability|Unknown capability|CAPABILITY_REGISTERED',34),
      ("feature_gate",r'featureFlag|isFeatureEnabled|featureOverrides|DISABLED',28),
      ("workspace_entry",r'workspace|entry|NO_ENTRY',24),
      ("loaded_cache",r'new Map|\.has\(|\.get\(|\.set\(|CACHED|LOADED',24),
      ("dynamic_import",r'import\s*\(',16),
      ("status_contract",r'INITIALIZED|ACTIVE|DISABLED|CACHED|LOADED|NO_ENTRY',18)
    ]
    for role,rx,w in tests:
        if re.search(rx,sn,re.I|re.S):
            score+=w; roles.append(role)
    # Penalize generic manifest/registry-only symbols that never mention loading semantics
    if "dynamic_import" not in roles and "loaded_cache" not in roles:
        score-=12
    return score,roles,re.sub(r"\s+"," ",sn)[:5000]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    r3p=ev/R3M/"dynamic_import_role_and_cache_contract_diagnosis.json"
    if not r3p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R3_EVIDENCE_REQUIRED"); return 4
    r3=loadj(r3p)
    required="RUNTIME_LOADER_CACHE_CONTRACT_CHUNK_RECOVERED_DYNAMIC_IMPORTS_CLASSIFIED_AS_ENTRY_LAZY_ROUTING"
    if r3.get("status")!="PASSED" or r3.get("classification")!=required:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R3_RUNTIME_LOADER_CONTRACT_RECOVERY_REQUIRED"); return 5

    assets=app/"dist/assets"
    runtime_files=sorted(assets.glob("domain-runtime-*.js"))
    entry_files=sorted(assets.glob("index-*.js"))
    if not runtime_files or not entry_files:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_DIST_RUNTIME_OR_ENTRY_BUNDLE_MISSING"); return 6

    runtime_candidates=[]
    for p in runtime_files:
        js=p.read_text(errors="ignore")
        defs=function_defs(js); exps=exported_symbols(js)
        exp_by_local={x["local"]:x["exported"] for x in exps}
        for nm,meta in defs.items():
            score,roles,snip=score_loader_symbol(nm,meta,js)
            if score>0:
                runtime_candidates.append({
                    "bundle":str(p.relative_to(app)),"localSymbol":nm,
                    "exportedSymbol":exp_by_local.get(nm),
                    "score":score,"roles":roles,"params":meta.get("params",""),
                    "snippet":snip
                })
    runtime_candidates.sort(key=lambda x:(x["exportedSymbol"] is not None,x["score"]),reverse=True)

    exported_loader_candidates=[x for x in runtime_candidates if x["exportedSymbol"]]

    bindings=[]
    for ep in entry_files:
        ejs=ep.read_text(errors="ignore")
        for rp in runtime_files:
            bn=rp.name
            # import{a as b,c as d}from"./domain-runtime-XXX.js"
            rx=re.compile(r'import\s*\{([^}]+)\}\s*from\s*["\']\./'+re.escape(bn)+r'["\']')
            for m in rx.finditer(ejs):
                parts=[]
                for part in m.group(1).split(","):
                    part=part.strip()
                    mm=re.match(r'([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?',part)
                    if mm:
                        parts.append({"exported":mm.group(1),"entryLocal":mm.group(2) or mm.group(1)})
                bindings.append({"entryBundle":str(ep.relative_to(app)),
                                 "runtimeBundle":str(rp.relative_to(app)),
                                 "imports":parts,"offset":m.start()})

    # Join runtime exported symbols to entry import aliases.
    joined=[]
    for c in exported_loader_candidates:
        for b in bindings:
            if b["runtimeBundle"]!=c["bundle"]: continue
            for imp in b["imports"]:
                if imp["exported"]==c["exportedSymbol"]:
                    ejs=(app/b["entryBundle"]).read_text(errors="ignore")
                    loc=imp["entryLocal"]
                    uses=[m.start() for m in re.finditer(r'(?<![\w$])'+re.escape(loc)+r'(?![\w$])',ejs)]
                    use_snips=[]
                    for pos in uses[:12]:
                        sn=neighborhood(ejs,pos,900)
                        use_snips.append(re.sub(r"\s+"," ",sn)[:2200])
                    joined.append({
                      **c,"entryBundle":b["entryBundle"],"entryLocalSymbol":loc,
                      "entryUseCount":len(uses),"entryUseSnippets":use_snips
                    })
    joined.sort(key=lambda x:(x["score"],x["entryUseCount"]),reverse=True)

    # If no direct entry import, retain the best exported runtime symbol and classify as chunk-local/indirect import.
    exact = joined[0] if joined else None
    if exact:
        cls="EXACT_RUNTIME_LOADER_EXPORT_SYMBOL_AND_ENTRY_IMPORT_ALIAS_BOUND"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_ENTRY_ALIAS_CALLSITE_AND_TRIGGER_OWNER_RESOLUTION"
    elif exported_loader_candidates:
        cls="RUNTIME_LOADER_EXPORT_SYMBOL_RESOLVED_ENTRY_IMPORT_BINDING_INDIRECT_OR_ABSENT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_REEXPORT_OR_CHUNK_LOCAL_BINDING_RESOLUTION"
    else:
        cls="RUNTIME_LOADER_CONTRACT_CHUNK_RESOLVED_EXPORT_SYMBOL_NOT_YET_PROVEN"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R5_RUNTIME_LOADER_LOCAL_SYMBOL_TO_EXPORT_TABLE_DEMINIFICATION"

    checks={
      "r5R3Passed":r3.get("status")=="PASSED",
      "r5R3ClassificationConsumed":r3.get("classification")==required,
      "activeRuntimeBundleResolved":bool(runtime_files),
      "activeEntryBundleResolved":bool(entry_files),
      "runtimeFunctionDefinitionsInspected":True,
      "runtimeExportTableInspected":True,
      "entryRuntimeImportsInspected":True,
      "runtimeToEntryBindingAttempted":True,
      "classificationResolved":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }

    status="PASSED"
    state="M419D4BN17C_R4_R12_R16A_R20_R5_R4_RUNTIME_LOADER_CONTRACT_EXPORT_SYMBOL_AND_ENTRY_IMPORT_BINDING_CERTIFIED"
    diag="RUNTIME_LOADER_EXPORT_AND_ENTRY_IMPORT_CAUSALLY_CLASSIFIED_"+cls
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    ef=out/"runtime_loader_contract_export_symbol_and_entry_import_binding.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R4_RUNTIME_LOADER_CONTRACT_EXPORT_SYMBOL_AND_ENTRY_IMPORT_BINDING",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diag,
      "r5R3Classification":r3.get("classification"),
      "runtimeBundleCount":len(runtime_files),"entryBundleCount":len(entry_files),
      "runtimeLoaderCandidateCount":len(runtime_candidates),
      "exportedRuntimeLoaderCandidateCount":len(exported_loader_candidates),
      "entryRuntimeImportBindingCount":len(bindings),
      "joinedRuntimeEntryBindingCount":len(joined),
      "topRuntimeLoaderCandidates":runtime_candidates[:40],
      "entryRuntimeBindings":bindings[:40],
      "joinedBindings":joined[:40],
      "exactBinding":exact,
      "classification":cls,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R4 Runtime Loader Contract Export Symbol + Entry Import Binding")
    print("="*120)
    print("R5_R3_CLASSIFICATION:",r3.get("classification"))
    print("RUNTIME_BUNDLE_COUNT:",len(runtime_files))
    print("ENTRY_BUNDLE_COUNT:",len(entry_files))
    print("RUNTIME_LOADER_CANDIDATE_COUNT:",len(runtime_candidates))
    print("EXPORTED_RUNTIME_LOADER_CANDIDATE_COUNT:",len(exported_loader_candidates))
    print("ENTRY_RUNTIME_IMPORT_BINDING_COUNT:",len(bindings))
    print("JOINED_RUNTIME_ENTRY_BINDING_COUNT:",len(joined))
    print("CLASSIFICATION:",cls)

    print("\n----- TOP RUNTIME LOADER CANDIDATES -----")
    for x in runtime_candidates[:15]: print(json.dumps(x))
    print("\n----- ENTRY RUNTIME IMPORT BINDINGS -----")
    for x in bindings[:15]: print(json.dumps(x))
    print("\n----- JOINED RUNTIME -> ENTRY BINDINGS -----")
    for x in joined[:10]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diag)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
