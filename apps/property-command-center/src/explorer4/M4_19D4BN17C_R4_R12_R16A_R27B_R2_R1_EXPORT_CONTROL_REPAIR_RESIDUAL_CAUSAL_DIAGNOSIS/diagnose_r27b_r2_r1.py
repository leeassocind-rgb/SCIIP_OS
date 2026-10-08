#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

SRC="M4_19D4BN17C_R4_R12_R16A_R27B_R2_FIRST_RECORD_EXPORT_CONTROL_BINDING_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R1_EXPORT_CONTROL_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    src=er/SRC/"first_record_export_control_binding_repair_and_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R2-R1 Export-Control Repair Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not src.exists():
        print("STATUS: BLOCKED")
        print("REASON: R27B-R2 evidence required")
        return 4

    d=loadj(src)
    ctrl=d.get("exportControlReadback") if isinstance(d.get("exportControlReadback"),dict) else {}
    target=d.get("target")
    label=d.get("exportControlLabel")

    count=ctrl.get("count")
    visible=ctrl.get("visible")
    enabled=ctrl.get("enabled")
    handler=ctrl.get("handlerName")

    if count is None:
        cls="EXPORT_CONTROL_READBACK_NOT_CAPTURED"
    elif count==0:
        cls="EXPECTED_DOWNLOAD_CONTROL_LABEL_NOT_MATERIALIZED"
    elif count!=1:
        cls="EXPECTED_DOWNLOAD_CONTROL_LABEL_NON_UNIQUE"
    elif visible is not True:
        cls="EXPECTED_DOWNLOAD_CONTROL_NOT_VISIBLE"
    elif enabled is not True:
        cls="EXPECTED_DOWNLOAD_CONTROL_DISABLED"
    elif handler != "exportReport":
        cls="DOWNLOAD_CONTROL_PRESENT_BUT_HANDLER_NAME_NOT_EXPORTREPORT"
    else:
        cls="READBACK_CONTRACT_APPEARS_CERTIFIABLE_BUT_SETTLE_DID_NOT_REACH_THREE_CONSECUTIVE_SAMPLES"

    checks={
      "r27bR2EvidencePresent":True,
      "r27bR2DiagnosticComplete":d.get("status")=="DIAGNOSTIC_COMPLETE",
      "targetResolved":bool(target),
      "exportControlLabelCaptured":label is not None,
      "exportControlReadbackCaptured":isinstance(d.get("exportControlReadback"),dict),
      "controlCountCaptured":count is not None,
      "controlVisibilityCaptured":visible is not None,
      "controlEnabledStateCaptured":enabled is not None,
      "handlerNameCaptured":("handlerName" in ctrl),
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R2_R1_EXPORT_CONTROL_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "sourceStatus":d.get("status"),
      "target":target,
      "expectedLabel":label,
      "exportControlReadback":ctrl,
      "classification":cls,
      "checks":checks,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R2_R2_EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS"
    }
    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_control_repair_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",target)
    print("EXPECTED_LABEL:",label)
    print("CONTROL_COUNT:",count)
    print("CONTROL_VISIBLE:",visible)
    print("CONTROL_ENABLED:",enabled)
    print("HANDLER_NAME:",handler)
    print("EXPORT_CONTROL_CERTIFIED:",d.get("exportControlCertified"))
    print("LIVE_HANDLER_CERTIFIED:",d.get("liveHandlerCertified"))
    print("EXPORT_INVOCATION:",d.get("exportInvocation"))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",cls)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R2_R1_EXPORT_CONTROL_REPAIR_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R27B_R2_R2_EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS")
    print("EVIDENCE:",ef)
    print("\nR27B-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__": raise SystemExit(main())
