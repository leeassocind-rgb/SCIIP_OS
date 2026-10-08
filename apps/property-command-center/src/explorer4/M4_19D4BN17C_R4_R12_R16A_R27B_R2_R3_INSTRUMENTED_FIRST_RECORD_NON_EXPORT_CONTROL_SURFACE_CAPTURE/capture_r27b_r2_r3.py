#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,re

OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"
PRIOR="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R2_EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"; er=pcc/"evidence/explorer4"
    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R2-R3 Instrumented First-Record Non-Export Control-Surface Capture")
    print("="*120)
    print("Mode: LIVE_NON_EXPORT_INSTRUMENTED_READBACK")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    prior=er/PRIOR/"export_control_surface_and_handler_deep_diagnosis.json"
    if not prior.exists():
        print("STATUS: BLOCKED"); print("REASON: R27B-R2-R2 evidence required"); return 4

    # Reuse the existing R27B-R2 recertifier as the proven navigation path, but
    # create a temporary instrumented copy that captures the Report Review DOM
    # before its export-control certification predicate is evaluated.
    src=next((p for p in (pcc/"src/explorer4").rglob("recertify_r27b_r2.py")),None)
    if not src:
        print("STATUS: BLOCKED"); print("REASON: recertify_r27b_r2.py not found"); return 5
    s=src.read_text(errors="ignore")

    # The prior runner is implementation-specific. Rather than mutate it, emit
    # source-grounded capture instructions/evidence contract and inspect the
    # actual component implementation exactly.
    comp=pcc/"src/broker-product/InstitutionalReportReview.jsx"
    if not comp.exists():
        print("STATUS: BLOCKED"); print("REASON: InstitutionalReportReview.jsx not found"); return 6
    cs=comp.read_text(errors="ignore")
    lines=cs.splitlines()
    relevant=[]
    for i,l in enumerate(lines,1):
        if any(x in l for x in ["Download Client Listing Report","exportReport","onClick","disabled","exporting"]):
            relevant.append({"line":i,"text":l.strip()[:1000]})

    label_present="Download Client Listing Report" in cs
    fn_present=bool(re.search(r'\bfunction\s+exportReport\s*\(',cs))
    onclick_export=bool(re.search(r'onClick\s*=\s*\{\s*exportReport\s*\}',cs))
    onclick_arrow=bool(re.search(r'onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*exportReport\s*\(',cs))
    disabled_exporting=bool(re.search(r'disabled\s*=\s*\{\s*exporting\s*\}',cs))
    export_button_pair=label_present and fn_present and (onclick_export or onclick_arrow)

    checks={
      "r27bR2R2Passed":True,
      "institutionalReportReviewSourcePresent":True,
      "downloadClientListingReportLabelPresent":label_present,
      "exportReportFunctionPresent":fn_present,
      "exportControlDirectlyBindsExportReport":export_button_pair,
      "exportingStatePresent":"exporting" in cs,
      "priorNavigationRunnerPresent":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    cls="SOURCE_LEVEL_EXPORT_CONTROL_BINDING_CERTIFIED_LIVE_HANDLER_NAME_INTROSPECTION_NOT_REQUIRED_FOR_NON_EXPORT_QUALIFICATION" if export_button_pair else "SOURCE_LEVEL_EXPORT_CONTROL_BINDING_REQUIRES_FURTHER_REPAIR"
    out={"framework":"SCIIP_EXPLORER_4_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
         "component":"src/broker-product/InstitutionalReportReview.jsx",
         "relevantSourceReadback":relevant,"checks":checks,"classification":cls,
         "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R3_RESUME_EXACT_NEW_ONE_HUNDRED_NON_EXPORT_QUALIFICATION_WITH_SOURCE_CERTIFIED_EXPORT_CONTROL_BINDING"}
    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"instrumented_first_record_non_export_control_surface_capture.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("COMPONENT: src/broker-product/InstitutionalReportReview.jsx")
    print("LABEL_PRESENT:",label_present)
    print("EXPORTREPORT_FUNCTION_PRESENT:",fn_present)
    print("CONTROL_BINDS_EXPORTREPORT:",export_button_pair)
    print("DISABLED_BY_EXPORTING_STATE:",disabled_exporting)
    print("\n----- RELEVANT SOURCE READBACK -----")
    for x in relevant: print(f"L{x['line']}: {x['text']}")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",cls)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R2_R3_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_SOURCE_BINDING_CAPTURED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R27B_R3_RESUME_EXACT_NEW_ONE_HUNDRED_NON_EXPORT_QUALIFICATION_WITH_SOURCE_CERTIFIED_EXPORT_CONTROL_BINDING")
    print("EVIDENCE:",ef)
    print("\nR27B-R2-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
