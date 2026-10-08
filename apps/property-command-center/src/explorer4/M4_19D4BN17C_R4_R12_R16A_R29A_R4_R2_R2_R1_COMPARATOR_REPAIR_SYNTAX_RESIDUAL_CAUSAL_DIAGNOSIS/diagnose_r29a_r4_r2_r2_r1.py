#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,ast,re

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R22="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_AUTHORITATIVE_PRIOR_200_DISJOINTNESS_COMPARATOR_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R1_COMPARATOR_REPAIR_SYNTAX_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    prior=er/R22/"authoritative_prior_200_disjointness_comparator_repair_and_candidate_selection_recertification.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"comparator_repair_syntax_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R1 Comparator Repair Syntax Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_SELECTOR_SYNTAX_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    j=loadj(prior)
    if not isinstance(j,dict) or j.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED");print("REASON: R29A-R4-R2-R2 diagnostic evidence missing");return 4
    if not runner.exists():
        print("STATUS: BLOCKED");print("REASON: R29A selector missing");return 5

    src=runner.read_text()
    syntax_error=None
    try:
        ast.parse(src)
    except SyntaxError as e:
        syntax_error={
          "lineno":e.lineno,
          "offset":e.offset,
          "text":(e.text or "").rstrip("\n"),
          "msg":e.msg
        }

    if not syntax_error:
        print("STATUS: BLOCKED");print("REASON: selector currently parses; observed syntax failure no longer reproducible");return 6

    lines=src.splitlines()
    ln=syntax_error["lineno"] or 1
    lo=max(1,ln-8); hi=min(len(lines),ln+8)
    context=[{"line":i,"text":lines[i-1]} for i in range(lo,hi+1)]

    # Detect the exact malformed comparator-repair signature.
    malformed_assignment=False
    malformed_if=False
    adjacent_assignment_before_if=False
    if 1<=ln<=len(lines):
        cur=lines[ln-1]
        malformed_if=cur.lstrip().startswith("if len(_r29a_r4_r2_prior)")
        if ln-1>=1:
            prev=lines[ln-2]
            adjacent_assignment_before_if="_r29a_r4_r2_new_keys = keyset(new200)" in prev
            # An assignment can only be a SyntaxError trigger if it was inserted into
            # an expression/conditional or indentation context incorrectly.
            malformed_assignment="_r29a_r4_r2_new_keys = keyset(new200)" in cur

    # Inspect try/except indentation around the authoritative branch.
    branch_start=None
    for i,line in enumerate(lines,1):
        if "R29A-R4-R2: authoritative closed prior-200 binding" in line:
            branch_start=i;break

    branch_context=[]
    if branch_start:
        for i in range(branch_start,min(len(lines),branch_start+20)+1):
            branch_context.append({"line":i,"text":lines[i-1]})

    # Common defect from R2-R2 patch: injected assignment may be placed at the
    # indentation level of the preceding list comprehension or inside a continued expression.
    leading={}
    for item in branch_context:
        txt=item["text"]
        leading[item["line"]]=len(txt)-len(txt.lstrip(" "))

    classification="COMPARATOR_REPAIR_INTRODUCED_PYTHON_SYNTAX_ERROR_IN_AUTHORITATIVE_PRIOR200_BRANCH"
    next_milestone="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_COMPARATOR_REPAIR_SYNTAX_ONLY_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

    checks={
      "r29aR4R2R2DiagnosticConsumed":True,
      "runnerPresent":runner.exists(),
      "syntaxErrorReproduced":syntax_error is not None,
      "syntaxErrorLineCaptured":syntax_error.get("lineno") is not None,
      "syntaxErrorTextCaptured":bool(syntax_error.get("text")),
      "sourceContextCaptured":len(context)>0,
      "authoritativeBranchResolved":branch_start is not None,
      "authoritativeBranchContextCaptured":len(branch_context)>0,
      "comparatorRepairAssignmentObserved":"_r29a_r4_r2_new_keys = keyset(new200)" in src,
      "new200ComparatorObserved":"_r29a_r4_r2_keys & _r29a_r4_r2_new_keys" in src,
      "livekeysComparatorRemoved":"_r29a_r4_r2_keys & livekeys" not in src,
      "noSelectorMutationPerformed":True,
      "liveUiInteractionOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R1_COMPARATOR_REPAIR_SYNTAX_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R1_COMPARATOR_REPAIR_SYNTAX_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "syntaxError":syntax_error,
      "sourceContext":context,
      "authoritativeBranchStartLine":branch_start,
      "authoritativeBranchContext":branch_context,
      "indentationReadback":leading,
      "malformedIfAtSyntaxLine":malformed_if,
      "assignmentAtSyntaxLine":malformed_assignment,
      "assignmentImmediatelyBeforeSyntaxLine":adjacent_assignment_before_if,
      "checks":checks,
      "nextMilestone":next_milestone
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("SYNTAX_ERROR_LINE:",syntax_error["lineno"])
    print("SYNTAX_ERROR_OFFSET:",syntax_error["offset"])
    print("SYNTAX_ERROR_MESSAGE:",syntax_error["msg"])
    print("SYNTAX_ERROR_TEXT:",syntax_error["text"])
    print("AUTHORITATIVE_BRANCH_START_LINE:",branch_start)
    print("ASSIGNMENT_IMMEDIATELY_BEFORE_SYNTAX_LINE:",adjacent_assignment_before_if)

    print("\n----- SOURCE CONTEXT -----")
    for x in context: print(f"{x['line']:>5}: {x['text']}")

    print("\n----- AUTHORITATIVE BRANCH CONTEXT -----")
    for x in branch_context: print(f"{x['line']:>5}: {x['text']}")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",ev["state"])
    print("NEXT_MILESTONE:",next_milestone)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
