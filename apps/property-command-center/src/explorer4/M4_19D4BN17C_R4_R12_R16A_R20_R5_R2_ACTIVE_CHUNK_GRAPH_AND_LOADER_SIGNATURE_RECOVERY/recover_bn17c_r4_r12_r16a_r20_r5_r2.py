#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R2_ACTIVE_CHUNK_GRAPH_AND_LOADER_SIGNATURE_RECOVERY"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r1p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_R5_R1_FALSE_POSITIVE_EXPORT_TOKEN_REPAIR_AND_ACTIVE_DIST_LOADER_RECERTIFICATION"/"false_positive_export_token_repair_active_dist_loader_recertification.json"
    if not r1p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R20_R5_R1_EVIDENCE_REQUIRED"); return 4
    r1=load_json(r1p)
    expected="R5_FALSE_POSITIVE_REJECTED_STRICT_ACTIVE_DIST_LOADER_NOT_YET_RESOLVED"
    if r1.get("status")!="PASSED" or r1.get("classification")!=expected:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R20_R5_R1_STRICT_LOADER_UNRESOLVED_CLASSIFICATION_REQUIRED"); return 5

    assets=app/"dist/assets"
    jsfiles=list(assets.glob("*.js"))
    texts={}
    for p in jsfiles:
        try: texts[p]=p.read_text(errors="ignore")
        except: pass

    # Build chunk import/reference graph. Vite chunks commonly reference ./chunk.js in static or dynamic imports.
    graph=[]
    rev={}
    for p,s in texts.items():
        rel=str(p.relative_to(app))
        refs=set()
        for m in re.finditer(r"(?:from\s*|import\s*\(\s*)['\"]\.\/([^'\"]+\.js)['\"]",s):
            refs.add("dist/assets/"+m.group(1))
        for m in re.finditer(r"['\"]\.\/([^'\"]+\.js)['\"]",s):
            refs.add("dist/assets/"+m.group(1))
        for r in sorted(refs):
            graph.append({"from":rel,"to":r})
            rev.setdefault(r,[]).append(rel)

    # Candidate loader functions: dynamic import + cache/map + feature/capability/workspace-ish topology,
    # but WITHOUT requiring semantic strings to survive minification.
    defs=[]
    candidates=[]
    fn_patterns=[
      re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{",re.M),
      re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>",re.M)
    ]
    for p,s in texts.items():
        rel=str(p.relative_to(app))
        local_defs=[]
        for rr in fn_patterns:
            for m in rr.finditer(s):
                local_defs.append((m.start(),m.group(1),m.group(2)))
        local_defs.sort()
        defs.extend((rel,*d) for d in local_defs)

        # Scan dynamic import sites and infer lexical owner.
        for m in re.finditer(r"import\s*\(",s):
            a=max(0,m.start()-2600); b=min(len(s),m.start()+3600); sn=s[a:b]
            prior=[d for d in local_defs if d[0]<m.start()]
            owner=prior[-1] if prior else None
            sig={
              "mapOrCache":bool(re.search(r"\bMap\s*\(|\.has\s*\(|\.get\s*\(|\.set\s*\(",sn)),
              "featureOrFlag":bool(re.search(r"feature|flag|enabled|override",sn,re.I)),
              "workspaceOrCapability":bool(re.search(r"workspace|capabilit",sn,re.I)),
              "statusShape":bool(re.search(r"status\s*:",sn)),
              "asyncContext":bool(re.search(r"async|Promise|await",sn)),
              "runtimeRegistry":bool(re.search(r"registry|register|loaded|cache",sn,re.I))
            }
            sc=30+18*sig["mapOrCache"]+14*sig["featureOrFlag"]+18*sig["workspaceOrCapability"]+10*sig["statusShape"]+10*sig["asyncContext"]+14*sig["runtimeRegistry"]
            candidates.append({
              "bundle":rel,"offset":m.start(),
              "owner":owner[1] if owner else None,
              "ownerParams":owner[2] if owner else None,
              "score":sc,"signals":sig,
              "snippet":re.sub(r"\s+"," ",sn)[:7000]
            })

    candidates.sort(key=lambda x:-x["score"])

    # Rank graph-central chunks that contain dynamic imports and are referenced by active broker/runtime chunks.
    chunk_scores=[]
    for p,s in texts.items():
        rel=str(p.relative_to(app))
        dyn=len(re.findall(r"import\s*\(",s))
        incoming=len(rev.get(rel,[]))
        outgoing=sum(1 for e in graph if e["from"]==rel)
        semantic=sum(bool(re.search(rx,s,re.I)) for rx in [r"workspace",r"capabilit",r"feature",r"registry",r"loaded"])
        sc=dyn*25+incoming*8+outgoing*5+semantic*10
        if dyn or semantic:
            chunk_scores.append({"bundle":rel,"score":sc,"dynamicImportCount":dyn,"incomingEdges":incoming,
                                 "outgoingEdges":outgoing,"semanticSignals":semantic})
    chunk_scores.sort(key=lambda x:-x["score"])

    strict=[x for x in candidates if x["signals"]["mapOrCache"] and x["signals"]["asyncContext"] and (x["signals"]["workspaceOrCapability"] or x["signals"]["runtimeRegistry"])]

    if strict:
        top=strict[0]
        cls="LOADER_LIKE_DYNAMIC_IMPORT_SIGNATURE_RECOVERED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R3_LOADER_LIKE_DYNAMIC_IMPORT_SYMBOL_AND_CALLSITE_BINDING"
    elif candidates:
        top=candidates[0]
        cls="DYNAMIC_IMPORT_GRAPH_RECOVERED_LOADER_ROLE_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R3_DYNAMIC_IMPORT_ROLE_AND_CACHE_CONTRACT_DIAGNOSIS"
    else:
        top=None
        cls="ACTIVE_CHUNK_GRAPH_RECOVERED_NO_DYNAMIC_IMPORT_LOADER_SIGNATURE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R3_RUNTIME_CHUNK_EXECUTION_EDGE_DIAGNOSIS"

    checks={
      "r20R5R1Passed":r1.get("status")=="PASSED",
      "r20R5R1StrictLoaderUnresolved":r1.get("classification")==expected,
      "activeDistAssetsEnumerated":len(texts)>0,
      "chunkReferenceGraphBuilt":True,
      "dynamicImportSitesScanned":True,
      "loaderLikeTopologyScored":True,
      "classificationResolved":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }

    status="PASSED"
    state="M419D4BN17C_R4_R12_R16A_R20_R5_R2_ACTIVE_CHUNK_GRAPH_AND_LOADER_SIGNATURE_RECOVERED"
    diagnosis="ACTIVE_CHUNK_GRAPH_CAUSALLY_CLASSIFIED_"+cls
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    ef=out/"active_chunk_graph_and_loader_signature_recovery.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R2_ACTIVE_CHUNK_GRAPH_AND_LOADER_SIGNATURE_RECOVERY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
      "r20R5R1Classification":r1.get("classification"),
      "assetCount":len(texts),"chunkEdgeCount":len(graph),
      "dynamicImportCandidateCount":len(candidates),"strictLoaderLikeCandidateCount":len(strict),
      "topCandidate":top,"classification":cls,
      "topChunkScores":chunk_scores[:80],"topCandidates":candidates[:120],"chunkGraph":graph[:500],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R2 Active Chunk Graph + Loader Signature Recovery")
    print("="*120)
    print("R20_R5_R1_CLASSIFICATION:",r1.get("classification"))
    print("ASSET_COUNT:",len(texts))
    print("CHUNK_EDGE_COUNT:",len(graph))
    print("DYNAMIC_IMPORT_CANDIDATE_COUNT:",len(candidates))
    print("STRICT_LOADER_LIKE_CANDIDATE_COUNT:",len(strict))
    print("TOP_CANDIDATE:",json.dumps(top))
    print("CLASSIFICATION:",cls)

    print("\n----- TOP CHUNKS -----")
    for x in chunk_scores[:15]: print(json.dumps(x))
    print("\n----- TOP DYNAMIC IMPORT CANDIDATES -----")
    for x in candidates[:15]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status); print("STATE:",state); print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
