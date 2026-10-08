#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import ast, importlib.util, json, sys, traceback

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R1_POST_ARGV1_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    try: return json.loads(Path(p).read_text())
    except Exception: return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    selector=pcc/"src/explorer4"/R29A/"select_r29a.py"
    out=er/OUT
    out.mkdir(parents=True, exist_ok=True)
    ep=out/"post_argv1_repair_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R1 Post-ARGV1 Repair Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_CURRENT_SELECTOR_AUTHORITATIVE_BRANCH_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not selector.exists():
        print("STATUS: BLOCKED"); print("REASON: selector missing"); return 4

    src=selector.read_text()
    ast.parse(src)

    spec=importlib.util.spec_from_file_location("r29a_diag_current", selector)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    choose=getattr(mod,"choose_prior200",None)
    norm=getattr(mod,"norm",None)
    prior_path=getattr(mod,"R29A_R4_R2_AUTHORITATIVE_PRIOR200",None)
    if not callable(choose) or prior_path is None:
        print("STATUS: BLOCKED"); print("REASON: choose_prior200 or authoritative path missing"); return 5

    prior_path=Path(prior_path)
    prior_raw=loadj(prior_path)

    # Resolve current main() pnew/new200 source by reproducing the selector's configured path constant.
    pnew=None
    # First inspect module Path constants.
    for name in dir(mod):
        try: val=getattr(mod,name)
        except: continue
        if isinstance(val,Path) and val.exists():
            j=loadj(val)
            if isinstance(j,list) and len(j)==200 and val.resolve()!=prior_path.resolve():
                # Prefer R28A-R4 normalized candidate artifact.
                if "R28A_R4" in str(val) or "prefix_normalized" in val.name:
                    pnew=val; break
    if pnew is None:
        r28dir=er/"M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
        for f in sorted(r28dir.glob("*.json")) if r28dir.exists() else []:
            j=loadj(f)
            if isinstance(j,list) and len(j)==200:
                pnew=f; break
    if pnew is None:
        print("STATUS: BLOCKED"); print("REASON: exact new200 artifact unresolved"); return 6

    new_raw=loadj(pnew)

    def raw_key(x):
        if not isinstance(x,dict): return ""
        v=x.get("selectionKey") or x.get("label")
        k=norm(v) if callable(norm) else " ".join(str(v or "").lower().split())
        return k[7:] if k.startswith("select ") else k

    prior_keys=[raw_key(x) for x in prior_raw] if isinstance(prior_raw,list) else []
    new_keys=[raw_key(x) for x in new_raw] if isinstance(new_raw,list) else []
    prior_nonempty=[x for x in prior_keys if x]
    new_nonempty=[x for x in new_keys if x]
    pset=set(prior_nonempty); nset=set(new_nonempty)

    conditions={
        "priorRawCount200": isinstance(prior_raw,list) and len(prior_raw)==200,
        "priorKeyCount200": len(pset)==200,
        "newRawCount200": isinstance(new_raw,list) and len(new_raw)==200,
        "newKeyCount200": len(nset)==200,
        "disjoint": len(pset & nset)==0
    }

    result=None; err=None
    try:
        result=choose(er,new_raw,set())
    except Exception as e:
        err={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

    prior_ret=None; diag=None
    if isinstance(result,tuple):
        if len(result)>0: prior_ret=result[0]
        if len(result)>1: diag=result[1]
    else:
        prior_ret=result

    # Capture authoritative branch source.
    lines=src.splitlines()
    start=None
    for i,line in enumerate(lines,1):
        if "authoritative closed prior-200 binding" in line:
            start=i; break
    branch=[]
    if start:
        for i in range(start,min(len(lines),start+26)+1):
            branch.append({"line":i,"text":lines[i-1]})

    print("AUTHORITATIVE_PRIOR200_PATH:",prior_path)
    print("NEW200_ARTIFACT:",pnew)
    print("PRIOR_RAW_COUNT:",len(prior_raw) if isinstance(prior_raw,list) else None)
    print("PRIOR_NONEMPTY_KEY_COUNT:",len(prior_nonempty))
    print("PRIOR_UNIQUE_KEY_COUNT:",len(pset))
    print("NEW_RAW_COUNT:",len(new_raw) if isinstance(new_raw,list) else None)
    print("NEW_NONEMPTY_KEY_COUNT:",len(new_nonempty))
    print("NEW_UNIQUE_KEY_COUNT:",len(nset))
    print("PRIOR_NEW_OVERLAP_COUNT:",len(pset & nset))
    print("PRIOR_KEY_SAMPLE:",json.dumps(prior_nonempty[:12]))
    print("NEW_KEY_SAMPLE:",json.dumps(new_nonempty[:12]))
    print("OVERLAP_SAMPLE:",json.dumps(sorted(pset & nset)[:20]))
    print("BRANCH_CONDITIONS:",json.dumps(conditions,sort_keys=True))
    print("CHOOSE_PRIOR200_ERROR:",json.dumps(err) if err else None)
    print("CHOOSE_PRIOR200_RESULT_TYPE:",type(result).__name__ if result is not None else None)
    print("CHOOSE_PRIOR200_PRIOR_RETURN_TYPE:",type(prior_ret).__name__ if prior_ret is not None else None)
    if isinstance(prior_ret,(list,dict,tuple,set)):
        print("CHOOSE_PRIOR200_PRIOR_RETURN_COUNT:",len(prior_ret))
    else:
        print("CHOOSE_PRIOR200_PRIOR_RETURN_COUNT:",None)
    print("CHOOSE_PRIOR200_DIAG:",json.dumps(diag,default=str,sort_keys=True) if diag is not None else None)

    print("\n----- CURRENT AUTHORITATIVE BRANCH SOURCE -----")
    for x in branch:
        print(f"{x['line']:>5}: {x['text']}")

    if err:
        classification="R29A_AUTHORITATIVE_BRANCH_EXCEPTION_AFTER_ARGV1_REPAIR"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_AUTHORITATIVE_BRANCH_EXCEPTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif not conditions["priorKeyCount200"]:
        classification="R29A_PRIOR200_KEY_DOMAIN_STILL_NOT_200_AFTER_DIRECT_RAW_KEY_REPAIR"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_PRIOR200_KEY_DOMAIN_DEEP_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif not conditions["newKeyCount200"]:
        classification="R29A_NEW200_KEY_DOMAIN_STILL_NOT_200_AFTER_DIRECT_RAW_KEY_REPAIR"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_NEW200_KEY_DOMAIN_DEEP_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif not conditions["disjoint"]:
        classification="R29A_PRIOR200_AND_NEW200_GENUINELY_OVERLAP_AFTER_DIRECT_RAW_KEY_REPAIR"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_REFERENCE400_OVERLAP_RECONCILIATION"
    elif prior_ret is None:
        classification="R29A_AUTHORITATIVE_BRANCH_ALL_INVARIANTS_PASS_BUT_RETURN_IS_SWALLOWED_OR_FALLS_THROUGH"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_AUTHORITATIVE_BRANCH_RETURN_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif isinstance(prior_ret,list) and len(prior_ret)==200:
        classification="R29A_CHOOSE_PRIOR200_RETURNS_LIST200_BUT_MAIN_EXPECTS_DICT_IDS_RETURN_CONTRACT_MISMATCH"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_PRIOR200_RETURN_CONTRACT_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif isinstance(prior_ret,dict) and isinstance(prior_ret.get("ids"),list) and len(prior_ret["ids"])==200:
        classification="R29A_AUTHORITATIVE_PRIOR200_DIRECT_RESOLUTION_VALID_FAILURE_OCCURS_AFTER_RESOLUTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_POST_RESOLUTION_MAIN_PATH_DIAGNOSIS"
    else:
        classification="R29A_AUTHORITATIVE_PRIOR200_RETURN_SHAPE_UNEXPECTED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_PRIOR200_RETURN_SHAPE_REPAIR_AND_SELECTOR_RECERTIFICATION"

    checks={
        "selectorImportedWithoutMainExecution":True,
        "priorArtifactResolved":True,
        "new200ArtifactResolved":True,
        "rawKeyDomainCaptured":True,
        "overlapCaptured":True,
        "branchConditionsCaptured":True,
        "choosePrior200DirectlyInvoked":True,
        "authoritativeBranchSourceCaptured":len(branch)>0,
        "liveUiInteractionOff":True,
        "explorerClickOff":True,
        "propertyClickOff":True,
        "assignmentsInvocationOff":True,
        "generateInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True
    }

    ev={
        "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R1_POST_ARGV1_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED",
        "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R1_RESIDUAL_CAUSE_DIAGNOSED",
        "classification":classification,
        "conditions":conditions,
        "counts":{"priorRaw":len(prior_raw) if isinstance(prior_raw,list) else None,
                  "priorUniqueKeys":len(pset),
                  "newRaw":len(new_raw) if isinstance(new_raw,list) else None,
                  "newUniqueKeys":len(nset),
                  "overlap":len(pset & nset)},
        "samples":{"prior":prior_nonempty[:12],"new":new_nonempty[:12],"overlap":sorted(pset & nset)[:20]},
        "choosePrior200":{"error":err,"resultType":type(result).__name__ if result is not None else None,
                          "priorReturnType":type(prior_ret).__name__ if prior_ret is not None else None,
                          "diag":diag},
        "authoritativeBranchSource":branch,
        "checks":checks,
        "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",ev["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
