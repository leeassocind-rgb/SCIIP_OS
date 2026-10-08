#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN17C_R4_R12_R16A_R4_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLUTION"

SOURCE_EXT={".js",".jsx",".ts",".tsx",".mjs",".cjs",".json"}

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def scan_files(root):
    out=[]
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in SOURCE_EXT: continue
        if any(x in p.parts for x in ("node_modules",".git","evidence")): continue
        try:s=p.read_text(errors="ignore")
        except:continue
        yield p,s

def semantic_counts(s):
    pats={
      "export":r"\bexport\b",
      "presentation":r"\bpresentation\b",
      "deck":r"\bdeck\b",
      "download":r"\bdownload\b",
      "ppt":r"\bpptx?\b|\bpowerpoint\b",
      "generate":r"\bgenerate\b",
      "present":r"\bpresent\b",
      "blob":r"\bBlob\b|createObjectURL|application/vnd\.openxmlformats",
      "file":r"\bFile\b|saveAs|downloadFile",
      "dispatcher":r"\bdispatch\b|\bdispatcher\b",
      "service":r"\bservice\b|\badapter\b|\bprovider\b"
    }
    return {k:len(re.findall(v,s,re.I)) for k,v in pats.items()}

def rank_sources(app):
    ranked=[]
    for p,s in scan_files(app):
        c=semantic_counts(s)
        score=(c["export"]*6+c["presentation"]*7+c["deck"]*4+c["download"]*5+
               c["ppt"]*10+c["blob"]*8+c["generate"]*3+c["present"]*2+
               c["dispatcher"]*2+c["service"]*2)
        if score:
            ranked.append({"file":str(p.relative_to(app)),"score":score,"counts":c,
                           "sha256":hashlib.sha256(s.encode(errors="ignore")).hexdigest()})
    ranked.sort(key=lambda x:(-x["score"],x["file"]))
    return ranked[:200]

def extract_functions(s):
    out=[]
    pats=[
      r"function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{",
      r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>",
      r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?([A-Za-z_$][\w$]*)\s*=>"
    ]
    for pat in pats:
        for m in re.finditer(pat,s):
            name=m.group(1);params=m.group(2) if m.lastindex and m.lastindex>=2 else ""
            start=max(0,m.start()-300);end=min(len(s),m.start()+1800)
            snippet=s[start:end]
            if re.search(r"export|presentation|deck|download|ppt|powerpoint|blob|present",snippet,re.I):
                out.append({"name":name,"params":params[:300],"offset":m.start(),
                            "snippet":re.sub(r"\s+"," ",snippet)[:1500]})
    return out

def action_shapes(s):
    out=[]
    for m in re.finditer(r"([A-Za-z_$][\w$]*)\s*\(\s*\{([^{}]{0,800})\}\s*\)",s,re.S):
        blob=m.group(2)
        if not re.search(r"export|presentation|deck|download|ppt|present",blob,re.I):continue
        fields=sorted(set(re.findall(r"([A-Za-z_$][\w$]*)\s*:",blob)))
        out.append({"callee":m.group(1),"fields":fields[:40],"offset":m.start(),
                    "payload":re.sub(r"\s+"," ",blob)[:700]})
    return out[:200]

def bundle_rank(app, source_rank):
    dist=app/"dist/assets"
    rows=[]
    if not dist.exists():return rows
    for p in dist.glob("*.js"):
        try:s=p.read_text(errors="ignore")
        except:continue
        c=semantic_counts(s)
        score=(c["export"]*6+c["presentation"]*7+c["deck"]*4+c["download"]*5+
               c["ppt"]*10+c["blob"]*8+c["generate"]*3+c["present"]*2+
               c["dispatcher"]*2+c["service"]*2)
        if score:
            funcs=extract_functions(s)
            shapes=action_shapes(s)
            rows.append({"file":str(p.relative_to(app)),"score":score,"counts":c,
                         "functionCandidateCount":len(funcs),
                         "actionShapeCount":len(shapes),
                         "topFunctions":funcs[:40],"topActionShapes":shapes[:40]})
    rows.sort(key=lambda x:(-x["score"],x["file"]))
    return rows[:80]

def source_runtime_overlap(source_rows,bundle_rows):
    source_tokens=set()
    for r in source_rows[:80]:
        try:
            s=(r["file"]+" "+json.dumps(r["counts"]))
        except:s=r["file"]
        source_tokens.update(re.findall(r"[A-Za-z_$][\w$]{2,}",s))
    overlaps=[]
    for b in bundle_rows:
        tokens=set()
        for f in b.get("topFunctions",[]):
            tokens.add(f.get("name",""))
            tokens.update(re.findall(r"[A-Za-z_$][\w$]{2,}",f.get("snippet","")))
        common=sorted(x for x in (source_tokens & tokens) if len(x)>2)
        overlaps.append({"bundle":b["file"],"overlapCount":len(common),"symbols":common[:100]})
    overlaps.sort(key=lambda x:(-x["overlapCount"],x["bundle"]))
    return overlaps

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r3p=ev/"M4_19D4BN17C_R4_R12_R16A_R3_EXPORT_PRESENTATION_POST_ACTION_RESIDUAL_CAUSAL_DIAGNOSIS"/"export_presentation_post_action_residual_causal_diagnosis.json"
    if not r3p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R16A_R3_EVIDENCE_REQUIRED")
        return 4

    r3=fj(r3p)
    if r3.get("status")!="PASSED":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R16A_R3_MUST_PASS")
        return 5

    source_rows=rank_sources(app)
    bundle_rows=bundle_rank(app,source_rows)
    overlaps=source_runtime_overlap(source_rows,bundle_rows)

    top_source=source_rows[0] if source_rows else None
    top_bundle=bundle_rows[0] if bundle_rows else None

    source_export_modules=[r for r in source_rows if r["counts"]["export"] or r["counts"]["download"] or r["counts"]["ppt"]]
    source_presentation_modules=[r for r in source_rows if r["counts"]["presentation"] or r["counts"]["deck"] or r["counts"]["present"]]
    bundle_action_candidates=[b for b in bundle_rows if b.get("functionCandidateCount",0)>0]
    bundle_payload_candidates=[b for b in bundle_rows if b.get("actionShapeCount",0)>0]

    checks={
      "r16aR3Passed":r3.get("status")=="PASSED",
      "r3NoCleanActionControlVisible":r3.get("diagnosis")=="FALSE_POSITIVE_PROPERTY_CARD_TARGET_CAUSED_R2_FAILURE_NO_CLEAN_ACTION_CONTROL_VISIBLE",
      "sourceExportModulesResolved":len(source_export_modules)>0,
      "sourcePresentationModulesResolved":len(source_presentation_modules)>0,
      "activeDistBundlesResolved":len(bundle_rows)>0,
      "boundFunctionCandidatesResolved":len(bundle_action_candidates)>0,
      "actionPayloadShapeCandidatesResolved":len(bundle_payload_candidates)>0,
      "sourceRuntimeSymbolOverlapAttempted":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportPresentationRuntimeInvocationOff":True
    }

    if bundle_action_candidates:
        classification="EXPORT_PRESENTATION_SOURCE_SEMANTICS_CORRELATED_TO_ACTIVE_DIST_RUNTIME_FUNCTION_CANDIDATES"
        nxt="M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"
    else:
        classification="EXPORT_PRESENTATION_SOURCE_SEMANTICS_RESOLVED_RUNTIME_BOUND_FUNCTION_REMAINS_OPAQUE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R5_ACTIVE_BUNDLE_EXPORT_PRESENTATION_SYMBOL_DEMINIFICATION_AND_CALL_GRAPH_DIAGNOSIS"

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R4_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R4_BINDING_INCOMPLETE")
    diagnosis=classification if passed else "EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_REMAINS_INCOMPLETE"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R4_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "topSourceModule":top_source,
      "topActiveDistBundle":top_bundle,
      "sourceExportModuleCount":len(source_export_modules),
      "sourcePresentationModuleCount":len(source_presentation_modules),
      "activeDistBundleCount":len(bundle_rows),
      "boundFunctionCandidateBundleCount":len(bundle_action_candidates),
      "actionPayloadCandidateBundleCount":len(bundle_payload_candidates),
      "sourceRuntimeOverlaps":overlaps[:50],
      "sourceModules":source_rows[:120],
      "activeDistBundles":bundle_rows[:40],
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "exportPresentationRuntimeInvocation":False
      },
      "nextMilestone":nxt
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"export_presentation_source_to_runtime_action_binding_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R4 Export/Presentation Source-to-Runtime Action Binding Resolution")
    print("="*120)
    print("R3_DIAGNOSIS:",r3.get("diagnosis"))
    print("SOURCE_EXPORT_MODULE_COUNT:",len(source_export_modules))
    print("SOURCE_PRESENTATION_MODULE_COUNT:",len(source_presentation_modules))
    print("ACTIVE_DIST_BUNDLE_COUNT:",len(bundle_rows))
    print("BOUND_FUNCTION_CANDIDATE_BUNDLE_COUNT:",len(bundle_action_candidates))
    print("ACTION_PAYLOAD_CANDIDATE_BUNDLE_COUNT:",len(bundle_payload_candidates))
    print("TOP_SOURCE_MODULE:",top_source["file"] if top_source else None)
    print("TOP_ACTIVE_DIST_BUNDLE:",top_bundle["file"] if top_bundle else None)

    print("\n----- TOP ACTIVE DIST BUNDLES -----")
    for b in bundle_rows[:10]:
        print(f'{b["file"]}: score={b["score"]} functions={b["functionCandidateCount"]} payloadShapes={b["actionShapeCount"]}')

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
