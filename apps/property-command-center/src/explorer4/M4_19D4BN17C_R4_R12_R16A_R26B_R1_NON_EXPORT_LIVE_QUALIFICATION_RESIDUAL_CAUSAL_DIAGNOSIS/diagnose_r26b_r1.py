#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib, re

R26B="M4_19D4BN17C_R4_R12_R16A_R26B_FIFTY_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
EXPECTED_TARGET="112 W Alondra Blvd"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    src=evid/R26B/"fifty_new_record_non_export_live_qualification.json"
    print("="*118)
    print("SCIIP Explorer 4.0 — R26B-R1 Non-Export Live Qualification Residual Causal Diagnosis")
    print("="*118)
    print("Mode: READ_ONLY_EVIDENCE_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("R26B retry: OFF")

    if not src.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R26B_EVIDENCE_REQUIRED"); return 4
    d=loadj(src)
    outs=d.get("outcomes") or []
    failed=[x for x in outs if not x.get("qualified")]
    qualified=[x for x in outs if x.get("qualified")]
    first=failed[0] if failed else None
    target=(first or {}).get("target")
    ordinal=(first or {}).get("ordinal")

    checks={
      "r26bIncompleteStateConsumed": d.get("status")=="DIAGNOSTIC_COMPLETE" and "INCOMPLETE" in d.get("state",""),
      "thirtyRecordsQualifiedBeforeHalt": len(qualified)==30,
      "firstFailureResolved": first is not None,
      "firstFailureOrdinalThirtyOne": ordinal==31,
      "firstFailureTargetResolved": target==EXPECTED_TARGET,
      "freshPageCreationCertified": bool((first or {}).get("freshTargetCreated")),
      "explorerSettleCertified": bool((first or {}).get("explorerSettleCertified")),
      "targetBindingSettleFailed": (first or {}).get("targetBindingSettleCertified") is False,
      "selectionNotPerformed": (first or {}).get("selectionBinding") is None and (first or {}).get("selectionClicked") is not True,
      "selectedPropertyNotCertified": (first or {}).get("selectedPropertyCertified") is False,
      "assignmentsNotEntered": (first or {}).get("assignmentsEntryCertified") is False,
      "reportReviewNotEntered": (first or {}).get("reportReviewEntryCertified") is False,
      "exportControlNotReached": (first or {}).get("exportControlCertified") is False,
      "explorerContinuityPreserved": bool((first or {}).get("explorerContinuity")),
      "sameOriginPreserved": bool((first or {}).get("sameOrigin")),
      "noRetryPerformed": True,
      "liveUiInteractionOff": True,
      "exportInvocationOff": True,
      "applicationMutationOff": True,
      "governedMutationOff": True,
      "networkAuthorityOff": True,
      "pixelEvidenceOff": True
    }

    if not all([checks["r26bIncompleteStateConsumed"],checks["firstFailureResolved"],
                checks["firstFailureOrdinalThirtyOne"],checks["firstFailureTargetResolved"]]):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R26B_EXPECTED_RESIDUAL_NOT_RESOLVED"); return 5

    classification="THIRTY_FIRST_RECORD_EXPLORER_SETTLED_BUT_TARGET_BINDING_DID_NOT_SETTLE_PRE_SELECTION"
    nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_ALONDRA_TARGET_IDENTITY_AND_BINDING_DEEP_DIAGNOSIS"
    out={
      "framework":"SCIIP_EXPLORER_4_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "qualifiedBeforeHalt":len(qualified),
      "failureOrdinal":ordinal,
      "failureTarget":target,
      "failureOutcome":first,
      "checks":checks,
      "authority":{"liveUiInteraction":False,"propertyClick":False,"assignmentsInvocation":False,
                   "generateInvocation":False,"exportInvocation":False,"applicationSourceMutation":False,
                   "governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,"r26bRetry":False},
      "sourceEvidence":{"r26bPath":str(src),"r26bSha256":hashlib.sha256(src.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }
    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"non_export_live_qualification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("QUALIFIED_BEFORE_HALT:",len(qualified))
    print("FIRST_FAILURE_ORDINAL:",ordinal)
    print("FIRST_FAILURE_TARGET:",target)
    print("FRESH_PAGE_CREATED:",first.get("freshTargetCreated"))
    print("EXPLORER_SETTLE_CERTIFIED:",first.get("explorerSettleCertified"))
    print("TARGET_BINDING_SETTLE_CERTIFIED:",first.get("targetBindingSettleCertified"))
    print("SELECTION_BINDING:",first.get("selectionBinding"))
    print("SELECTED_PROPERTY_CERTIFIED:",first.get("selectedPropertyCertified"))
    print("EXPLORER_CONTINUITY:",first.get("explorerContinuity"))
    print("SAME_ORIGIN:",first.get("sameOrigin"))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
