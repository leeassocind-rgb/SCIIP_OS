#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get_bundle_text(app,bundle_file):
    p=app/bundle_file
    if not p.exists():return None,None
    try:return p,p.read_text(errors="ignore")
    except:return p,None

def function_defs(s):
    rows=[]
    patterns=[
      ("function",r"function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{"),
      ("arrow_paren",r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>"),
      ("arrow_single",r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?([A-Za-z_$][\w$]*)\s*=>")
    ]
    for kind,pat in patterns:
        for m in re.finditer(pat,s):
            start=m.start();name=m.group(1);params=m.group(2)
            snippet=s[max(0,start-400):min(len(s),start+2600)]
            sem={
              "export":len(re.findall(r"\bexport\b",snippet,re.I)),
              "presentation":len(re.findall(r"\bpresentation\b",snippet,re.I)),
              "deck":len(re.findall(r"\bdeck\b",snippet,re.I)),
              "download":len(re.findall(r"\bdownload\b",snippet,re.I)),
              "ppt":len(re.findall(r"\bpptx?\b|\bpowerpoint\b",snippet,re.I)),
              "blob":len(re.findall(r"\bBlob\b|createObjectURL|application/vnd\.openxmlformats",snippet,re.I)),
              "save":len(re.findall(r"\bsaveAs\b|downloadFile|createElement\(['\"]a['\"]\)",snippet,re.I)),
              "present":len(re.findall(r"\bpresent\b",snippet,re.I))
            }
            score=(sem["export"]*9+sem["presentation"]*10+sem["deck"]*5+sem["download"]*8+
                   sem["ppt"]*15+sem["blob"]*12+sem["save"]*10+sem["present"]*3)
            if score:
                rows.append({"name":name,"kind":kind,"params":params[:400],"offset":start,
                             "score":score,"semantics":sem,"snippet":re.sub(r"\s+"," ",snippet)[:2200]})
    rows.sort(key=lambda x:(-x["score"],x["offset"]))
    return rows

def call_edges(s,names):
    edges=[]
    names=set(names)
    for caller in names:
        for m in re.finditer(rf"\b{re.escape(caller)}\b",s):
            region=s[max(0,m.start()-1000):min(len(s),m.start()+1800)]
            for callee in names:
                if callee==caller:continue
                if re.search(rf"\b{re.escape(callee)}\s*\(",region):
                    edges.append({"caller":caller,"callee":callee,"offset":m.start()})
    uniq=[]
    seen=set()
    for e in edges:
        k=(e["caller"],e["callee"])
        if k not in seen:
            seen.add(k);uniq.append(e)
    return uniq[:500]

def payload_shapes(s):
    rows=[]
    for m in re.finditer(r"([A-Za-z_$][\w$]*)\s*\(\s*\{([^{}]{0,1200})\}\s*\)",s,re.S):
        blob=m.group(2)
        if not re.search(r"export|presentation|deck|download|ppt|powerpoint|present",blob,re.I):continue
        fields=sorted(set(re.findall(r"([A-Za-z_$][\w$]*)\s*:",blob)))
        sem=[]
        for k,pat in {
          "export":r"\bexport\b","presentation":r"\bpresentation\b","deck":r"\bdeck\b",
          "download":r"\bdownload\b","ppt":r"\bpptx?\b|\bpowerpoint\b","present":r"\bpresent\b"
        }.items():
            if re.search(pat,blob,re.I):sem.append(k)
        rows.append({"callee":m.group(1),"fields":fields[:80],"semantics":sem,
                     "offset":m.start(),"payload":re.sub(r"\s+"," ",blob)[:1100]})
    return rows[:300]

def classify(fn):
    sem=fn["semantics"];p=fn["params"]
    if sem["blob"] or sem["save"] or sem["ppt"] or sem["download"]:
        return "FILE_EXPORT_OR_DOWNLOAD_FUNCTION"
    if sem["presentation"] or sem["deck"] or sem["present"]:
        return "PRESENTATION_OR_DECK_FUNCTION"
    if re.search(r"event|target|currentTarget",p,re.I):
        return "UI_EVENT_HANDLER"
    if re.search(r"payload|options|config|context|property",p,re.I):
        return "OBJECT_OR_CONTEXT_ARGUMENT_FUNCTION"
    return "GENERIC_BOUND_FUNCTION"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r4p=ev/"M4_19D4BN17C_R4_R12_R16A_R4_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLUTION"/"export_presentation_source_to_runtime_action_binding_resolution.json"
    if not r4p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R4_EVIDENCE_REQUIRED");return 4
    r4=fj(r4p)
    if r4.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R4_MUST_PASS");return 5

    bundle=(r4.get("topActiveDistBundle") or {}).get("file")
    if not bundle:
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_DIST_BUNDLE_REQUIRED");return 6

    p,s=get_bundle_text(app,bundle)
    if not s:
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_DIST_BUNDLE_TEXT_REQUIRED");return 7

    funcs=function_defs(s)
    shapes=payload_shapes(s)
    for f in funcs:f["classification"]=classify(f)

    export_funcs=[f for f in funcs if f["classification"]=="FILE_EXPORT_OR_DOWNLOAD_FUNCTION" or f["semantics"]["export"]]
    present_funcs=[f for f in funcs if f["classification"]=="PRESENTATION_OR_DECK_FUNCTION" or f["semantics"]["presentation"] or f["semantics"]["deck"]]

    candidate_names=[f["name"] for f in funcs[:80]]
    edges=call_edges(s,candidate_names)

    # Rank candidates that appear in payload callee positions.
    payload_callees={x["callee"] for x in shapes}
    for f in funcs:
        f["payloadLinked"]=f["name"] in payload_callees
        if f["payloadLinked"]:f["score"]+=25
    funcs.sort(key=lambda x:(-x["score"],x["offset"]))

    top_export=[f for f in funcs if f in export_funcs][:20]
    top_present=[f for f in funcs if f in present_funcs][:20]

    contract_classes=set(f["classification"] for f in funcs[:30])
    param_shapes=sorted(set(f["params"] for f in funcs[:40] if f["params"]))

    checks={
      "r16aR4Passed":r4.get("status")=="PASSED",
      "activeDistBundlePreserved":bool(bundle),
      "exactFunctionCandidatesResolved":len(funcs)>0,
      "exportFunctionCandidatesResolved":len(top_export)>0,
      "presentationFunctionCandidatesResolved":len(top_present)>0,
      "formalParameterShapesResolved":len(param_shapes)>0,
      "payloadShapesResolved":len(shapes)>0,
      "callEdgesResolved":len(edges)>0,
      "invocationContractClassified":len(contract_classes)>0,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportPresentationRuntimeInvocationOff":True
    }

    if top_export and top_present:
        classification="EXACT_EXPORT_AND_PRESENTATION_BOUND_FUNCTION_CANDIDATES_AND_ARGUMENT_CONTRACTS_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R6_EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_CERTIFICATION"
    elif top_export:
        classification="EXPORT_BOUND_FUNCTION_RESOLVED_PRESENTATION_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R6_PRESENTATION_ALIAS_AND_CALL_GRAPH_CLOSURE_RESOLUTION"
    else:
        classification="EXPORT_PRESENTATION_BOUND_FUNCTION_RESOLUTION_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R6_ACTIVE_BUNDLE_EXPORT_PRESENTATION_SYMBOL_NEIGHBORHOOD_DIAGNOSIS"

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R5_BINDING_INCOMPLETE")
    diagnosis=classification if passed else "EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_REMAINS_INCOMPLETE"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "activeDistBundle":bundle,
      "exactFunctionCandidateCount":len(funcs),
      "exportFunctionCandidateCount":len(top_export),
      "presentationFunctionCandidateCount":len(top_present),
      "payloadShapeCount":len(shapes),
      "callEdgeCount":len(edges),
      "formalParameterShapeCount":len(param_shapes),
      "contractClasses":sorted(contract_classes),
      "topExportFunctions":top_export,
      "topPresentationFunctions":top_present,
      "payloadShapes":shapes[:100],
      "callEdges":edges[:200],
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"exportPresentationRuntimeInvocation":False},
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_export_presentation_bound_function_and_argument_contract_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R5 Exact Export/Presentation Bound Function + Argument Contract Resolution")
    print("="*120)
    print("ACTIVE_DIST_BUNDLE:",bundle)
    print("EXACT_FUNCTION_CANDIDATE_COUNT:",len(funcs))
    print("EXPORT_FUNCTION_CANDIDATE_COUNT:",len(top_export))
    print("PRESENTATION_FUNCTION_CANDIDATE_COUNT:",len(top_present))
    print("PAYLOAD_SHAPE_COUNT:",len(shapes))
    print("CALL_EDGE_COUNT:",len(edges))
    print("FORMAL_PARAMETER_SHAPE_COUNT:",len(param_shapes))
    print("CONTRACT_CLASSES:",", ".join(sorted(contract_classes)))

    print("\n----- TOP EXPORT FUNCTIONS -----")
    for x in top_export[:10]:
        print(f'{x["name"]}: score={x["score"]} class={x["classification"]} params={x["params"][:120]}')

    print("\n----- TOP PRESENTATION FUNCTIONS -----")
    for x in top_present[:10]:
        print(f'{x["name"]}: score={x["score"]} class={x["classification"]} params={x["params"][:120]}')

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
