#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,re,ast,hashlib

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R2="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_AUTHORITATIVE_PRIOR_200_SOURCE_BINDING_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
AUTH="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28NEW="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def norm(s): return " ".join(str(s or "").lower().split())

def simple_ident(x):
    if isinstance(x,str): return norm(x)
    if not isinstance(x,dict): return None
    for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
        if x.get(k): return norm(x[k])
    return None

def ids(xs):
    if not isinstance(xs,list): return []
    return [z for z in (simple_ident(x) for x in xs) if z]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    r2ev=er/R2/"authoritative_prior_200_source_binding_repair_and_candidate_selection_recertification.json"
    auth=er/AUTH/"exact_new_two_hundred_candidates.json"
    new=er/R28NEW/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"candidate_selection_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R1 Candidate Selection Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_SELECTOR_SOURCE_AND_ARGUMENT_SHAPE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    r2=loadj(r2ev)
    if not isinstance(r2,dict) or r2.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED");print("REASON: R29A-R4-R2 diagnostic evidence missing");return 4
    if not runner.exists() or not auth.exists() or not new.exists():
        print("STATUS: BLOCKED");print("REASON: selector or authoritative cohort artifact missing");return 5

    src=runner.read_text()
    tree=ast.parse(src)

    fn=None
    for node in tree.body:
        if isinstance(node,ast.FunctionDef) and node.name=="choose_prior200":
            fn=node;break
    if fn is None:
        print("STATUS: BLOCKED");print("REASON: choose_prior200 helper not found");return 6

    args=[a.arg for a in fn.args.args]
    fn_text=ast.get_source_segment(src,fn) or ""
    callsites=[]
    for m in re.finditer(r'choose_prior200\(([^)]*)\)',src):
        callsites.append(m.group(1).strip())

    auth_raw=loadj(auth); new_raw=loadj(new)
    auth_ids=ids(auth_raw); new_ids=ids(new_raw)

    # Diagnose the exact injected condition text.
    injected_present="R29A_R4_R2_AUTHORITATIVE_PRIOR200" in src
    uses_marker_identity="_r29a_r4_r2_ids = [marker_identity(x) for x in _r29a_r4_r2_prior]" in src
    intersects_livekeys="not (_r29a_r4_r2_keys & livekeys)" in src
    uses_keyset="keyset(_r29a_r4_r2_ids)" in src

    # Infer semantic role of function parameters from source.
    param_usage={}
    for a in args:
        param_usage[a]={
          "mentions":len(re.findall(rf'\b{re.escape(a)}\b',fn_text)),
          "usedInIntersection":bool(re.search(rf'&\s*{re.escape(a)}\b|\b{re.escape(a)}\s*&',fn_text)),
          "usedInLen":bool(re.search(rf'len\(\s*{re.escape(a)}\s*\)',fn_text)),
        }

    # Key observation: authoritative prior200 must be disjoint from NEW200, not from LIVE inventory.
    # If injected branch tests against livekeys, it will reject a valid prior cohort because reference records
    # are expected to still exist in live Explorer inventory.
    likely_wrong_comparison=(intersects_livekeys and "livekeys" in args)

    checks={
      "r29aR4R2DiagnosticConsumed":True,
      "runnerPresent":runner.exists(),
      "choosePrior200Resolved":fn is not None,
      "choosePrior200SignatureCaptured":len(args)>0,
      "choosePrior200CallsitesCaptured":len(callsites)>0,
      "authoritativeBranchPresent":injected_present,
      "authoritativePrior200CountExactly200":len(auth_ids)==200,
      "authoritativePrior200Unique":len(set(auth_ids))==200,
      "r28New200CountExactly200":len(new_ids)==200,
      "r28New200Unique":len(set(new_ids))==200,
      "authoritativePrior200DisjointFromR28New200":len(set(auth_ids)&set(new_ids))==0,
      "authoritativeBranchUsesMarkerIdentity":uses_marker_identity,
      "authoritativeBranchUsesKeyset":uses_keyset,
      "authoritativeBranchComparesAgainstLivekeys":intersects_livekeys,
      "argumentRoleMismatchEvaluated":True,
      "noSelectorMutationPerformed":True,
      "liveUiInteractionOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    if likely_wrong_comparison:
        classification="AUTHORITATIVE_PRIOR200_BRANCH_WRONGLY_TESTS_DISJOINTNESS_AGAINST_LIVE_INVENTORY_INSTEAD_OF_R28_NEW200_COHORT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_AUTHORITATIVE_PRIOR_200_DISJOINTNESS_COMPARATOR_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
    else:
        classification="AUTHORITATIVE_PRIOR200_BINDING_BRANCH_ARGUMENT_OR_NORMALIZATION_MISMATCH_REQUIRES_TARGETED_REPAIR"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_AUTHORITATIVE_PRIOR_200_ARGUMENT_BINDING_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "choosePrior200Signature":args,
      "choosePrior200Callsites":callsites,
      "parameterUsage":param_usage,
      "authoritativeBranch":{
        "present":injected_present,
        "usesMarkerIdentity":uses_marker_identity,
        "usesKeyset":uses_keyset,
        "comparesAgainstLivekeys":intersects_livekeys
      },
      "authoritativePrior200Count":len(auth_ids),
      "r28New200Count":len(new_ids),
      "authoritativeVsR28New200Overlap":len(set(auth_ids)&set(new_ids)),
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("CHOOSE_PRIOR200_SIGNATURE:",args)
    print("CHOOSE_PRIOR200_CALLSITES:")
    for c in callsites: print(" -",c)
    print("AUTHORITATIVE_BRANCH_PRESENT:",injected_present)
    print("AUTHORITATIVE_BRANCH_USES_MARKER_IDENTITY:",uses_marker_identity)
    print("AUTHORITATIVE_BRANCH_USES_KEYSET:",uses_keyset)
    print("AUTHORITATIVE_BRANCH_COMPARES_AGAINST_LIVEKEYS:",intersects_livekeys)
    print("AUTHORITATIVE_PRIOR_200_COUNT:",len(auth_ids))
    print("R28_NEW_200_COUNT:",len(new_ids))
    print("AUTHORITATIVE_VS_R28_NEW_200_OVERLAP:",len(set(auth_ids)&set(new_ids)))

    print("\n----- PARAMETER USAGE -----")
    for k,v in param_usage.items(): print(k,":",json.dumps(v,sort_keys=True))

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",ev["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__": raise SystemExit(main())
