#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_WORKSPACE_LOADER_SYMBOL_NEIGHBORHOOD_DIAGNOSIS"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r4p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_DEMINIFICATION"/"workspace_loader_import_graph_deminification.json"
    if not r4p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R4_EVIDENCE_REQUIRED");return 4
    r4=load_json(r4p)
    expected="WORKSPACE_LOADER_IMPORT_GRAPH_STILL_OPAQUE"
    if r4.get("status")!="DIAGNOSTIC_COMPLETE" or r4.get("classification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R4_OPAQUE_IMPORT_GRAPH_CLASSIFICATION_REQUIRED");return 5

    # Prefer the previously certified active broker-product bundle if present.
    candidates=[]
    for p in (app/"dist/assets").glob("*.js"):
        try:s=p.read_text(errors="ignore")
        except:continue
        score=0
        if "getCapability" in s: score+=35
        if "isFeatureEnabled" in s: score+=25
        if "Unknown capability" in s: score+=30
        if "NO_ENTRY" in s: score+=25
        if "LOADED" in s: score+=20
        if "CACHED" in s: score+=18
        if "featureOverrides" in s: score+=18
        if "presentation" in s.lower() or "export" in s.lower(): score+=12
        if score:
            candidates.append((score,p,s))
    candidates.sort(key=lambda x:-x[0])

    if not candidates:
        print("STATUS: DIAGNOSTIC_COMPLETE")
        print("DIAGNOSIS: ACTIVE_DIST_LOADER_SIGNATURE_NOT_FOUND")
        return 0

    score,bundle,s=candidates[0]
    rel=str(bundle.relative_to(app))

    # Identify exact loader implementation neighborhoods from known semantic fragments.
    sig_rx=re.compile(r"Unknown capability|NO_ENTRY|featureOverrides|status:\s*['\"]LOADED['\"]|status:\s*['\"]CACHED['\"]",re.I)
    neighborhoods=[]
    for m in sig_rx.finditer(s):
        a=max(0,m.start()-3200);b=min(len(s),m.start()+4200)
        sn=s[a:b]
        neighborhoods.append({"offset":m.start(),"snippet":sn})
        if len(neighborhoods)>=40:break

    # Extract candidate function definitions surrounding loader signatures.
    def_rx=[
      re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{",re.M),
      re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>",re.M),
      re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?([A-Za-z_$][\w$]*)\s*=>",re.M)
    ]
    defs=[]
    for rr in def_rx:
        for m in rr.finditer(s):
            defs.append((m.start(),m.group(1),m.group(2) if m.lastindex and m.lastindex>=2 else ""))
    defs.sort()

    loader_functions=[]
    for n in neighborhoods:
        prior=[d for d in defs if d[0]<n["offset"]]
        if not prior:continue
        d=prior[-1]
        a=max(0,d[0]-400);b=min(len(s),n["offset"]+2600)
        body=s[a:b]
        sigs={
          "unknownCapability":"Unknown capability" in body,
          "featureGate":"featureOverrides" in body or "isFeatureEnabled" in body,
          "noEntry":"NO_ENTRY" in body,
          "cached":"CACHED" in body,
          "loaded":"LOADED" in body
        }
        sc=20+20*sigs["unknownCapability"]+18*sigs["featureGate"]+18*sigs["noEntry"]+15*sigs["cached"]+15*sigs["loaded"]
        loader_functions.append({
          "symbol":d[1],"params":d[2],"definitionOffset":d[0],"score":sc,"signals":sigs,
          "snippet":re.sub(r"\s+"," ",body)[:6000]
        })
    # dedupe symbol
    ded={}
    for x in loader_functions:
        if x["symbol"] not in ded or x["score"]>ded[x["symbol"]]["score"]:ded[x["symbol"]]=x
    loader_functions=sorted(ded.values(),key=lambda x:-x["score"])
    loader_symbol=loader_functions[0]["symbol"] if loader_functions else None

    # Find all callsites of recovered minified loader symbol.
    callsites=[]
    if loader_symbol:
        rx=re.compile(r"(?<![\w$])"+re.escape(loader_symbol)+r"\s*\(",re.M)
        for m in rx.finditer(s):
            # skip its own definition area
            if any(abs(m.start()-x["definitionOffset"])<120 for x in loader_functions if x["symbol"]==loader_symbol):
                continue
            a=max(0,m.start()-3600);b=min(len(s),m.start()+4200);sn=s[a:b]
            # lexical owner
            prior=[d for d in defs if d[0]<m.start()]
            owner=prior[-1][1] if prior else None
            argm=re.match(r"\s*([^,\)]+)\s*(?:,\s*([^\)]*))?\)",s[m.end():])
            caparg=argm.group(1).strip() if argm else None
            ctxarg=(argm.group(2) or "").strip() if argm else None
            sig={
              "export":bool(re.search(r"\bexport\b|download|pptx?|powerpoint",sn,re.I)),
              "present":bool(re.search(r"\bpresent\b|presentation|deck|artifact",sn,re.I)),
              "ui":bool(re.search(r"onClick|onSelect|button|menuitem|toolbar|command",sn,re.I)),
              "workspace":bool(re.search(r"workspace|targetWorkspace|workspaceId|workspaceType|route|navigate",sn,re.I))
            }
            sc=20+35*sig["export"]+25*sig["present"]+18*sig["ui"]+16*sig["workspace"]+12*bool(owner)
            callsites.append({
              "offset":m.start(),"owner":owner,"capabilityArg":caparg,"contextArg":ctxarg,
              "signals":sig,"score":sc,"snippet":re.sub(r"\s+"," ",sn)[:7600]
            })
    callsites.sort(key=lambda x:-x["score"])

    strict=[x for x in callsites if x["signals"]["export"] or x["signals"]["present"]]
    exact_call=strict[0] if strict else (callsites[0] if callsites else None)
    exact_owner=exact_call.get("owner") if exact_call else None
    exact_cap=exact_call.get("capabilityArg") if exact_call else None
    exact_ctx=exact_call.get("contextArg") if exact_call else None

    if loader_symbol and exact_call and (exact_call["signals"]["export"] or exact_call["signals"]["present"]):
        cls="ACTIVE_DIST_LOADER_SYMBOL_AND_EXPORT_ADJACENT_CALLER_RESOLVED"
    elif loader_symbol and callsites:
        cls="ACTIVE_DIST_LOADER_SYMBOL_AND_CALLERS_RESOLVED_ROLE_PARTIAL"
    elif loader_symbol:
        cls="ACTIVE_DIST_LOADER_SYMBOL_RESOLVED_NO_CALLERS"
    else:
        cls="ACTIVE_DIST_LOADER_SYMBOL_UNRESOLVED"

    checks={
      "r20R4DiagnosticComplete":r4.get("status")=="DIAGNOSTIC_COMPLETE",
      "r20R4ImportGraphOpaque":r4.get("classification")==expected,
      "activeDistBundleResolved":bundle.exists(),
      "loaderSignatureNeighborhoodsCaptured":len(neighborhoods)>0,
      "loaderFunctionCandidatesResolved":len(loader_functions)>0,
      "loaderSymbolResolved":loader_symbol is not None,
      "distCallsitesScanned":True,
      "classificationResolved":cls!="ACTIVE_DIST_LOADER_SYMBOL_UNRESOLVED",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_WORKSPACE_LOADER_SYMBOL_NEIGHBORHOOD_DIAGNOSED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_WORKSPACE_LOADER_SYMBOL_NEIGHBORHOOD_INCOMPLETE")
    diagnosis=("ACTIVE_DIST_WORKSPACE_LOADER_CAUSALLY_CLASSIFIED_"+cls if passed
               else "ACTIVE_DIST_WORKSPACE_LOADER_REQUIRES_DEEPER_BUNDLE_CALL_GRAPH_RECOVERY")

    if cls=="ACTIVE_DIST_LOADER_SYMBOL_AND_EXPORT_ADJACENT_CALLER_RESOLVED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R6_ACTIVE_DIST_EXPORT_LOADER_CALLER_ARGUMENT_AND_WORKSPACE_BINDING_RESOLUTION"
    elif cls=="ACTIVE_DIST_LOADER_SYMBOL_AND_CALLERS_RESOLVED_ROLE_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R6_ACTIVE_DIST_LOADER_CALLER_ROLE_CORRELATION"
    elif cls=="ACTIVE_DIST_LOADER_SYMBOL_RESOLVED_NO_CALLERS":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R6_ACTIVE_DIST_LOADER_ALIAS_CLOSURE_AND_CALLSITE_RECOVERY"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R6_ACTIVE_DIST_LOADER_SIGNATURE_DEMINIFICATION"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"active_dist_workspace_loader_symbol_neighborhood_diagnosis.json"
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_WORKSPACE_LOADER_SYMBOL_NEIGHBORHOOD_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r20R4Classification":r4.get("classification"),
      "activeDistBundle":rel,
      "bundleScore":score,
      "loaderNeighborhoodCount":len(neighborhoods),
      "loaderFunctionCandidateCount":len(loader_functions),
      "loaderSymbol":loader_symbol,
      "callsiteCount":len(callsites),
      "roleAdjacentCallsiteCount":len(strict),
      "exactCaller":exact_owner,
      "exactCapabilityArgument":exact_cap,
      "exactContextArgument":exact_ctx,
      "classification":cls,
      "loaderFunctions":loader_functions[:80],
      "topCallsites":callsites[:120],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5 Active Dist Workspace Loader Symbol-Neighborhood Diagnosis")
    print("="*120)
    print("R20_R4_CLASSIFICATION:",r4.get("classification"))
    print("ACTIVE_DIST_BUNDLE:",rel)
    print("BUNDLE_SCORE:",score)
    print("LOADER_NEIGHBORHOOD_COUNT:",len(neighborhoods))
    print("LOADER_FUNCTION_CANDIDATE_COUNT:",len(loader_functions))
    print("LOADER_SYMBOL:",loader_symbol)
    print("CALLSITE_COUNT:",len(callsites))
    print("ROLE_ADJACENT_CALLSITE_COUNT:",len(strict))
    print("EXACT_CALLER:",exact_owner)
    print("EXACT_CAPABILITY_ARGUMENT:",exact_cap)
    print("EXACT_CONTEXT_ARGUMENT:",exact_ctx)
    print("CLASSIFICATION:",cls)

    print("\n----- TOP LOADER FUNCTIONS -----")
    for x in loader_functions[:12]: print(json.dumps(x))
    print("\n----- TOP CALLSITES -----")
    for x in callsites[:15]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
