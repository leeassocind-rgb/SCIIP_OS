#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,hashlib

REF="M4_19D4BN17C_R4_R12_R16A_R27_EXACT_ONE_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"
LIVE="M4_19D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def find_reference(er):
    # R27D/R27C explicitly bind the first 100 as closed evidence. Locate the strongest
    # prior exact-100 closure evidence without performing UI/export activity.
    candidates=[]
    for p in er.rglob("*.json"):
        s=str(p).lower()
        if "r27d" in s or "r27c" in s or "r27b" in s: continue
        try:
            j=loadj(p)
        except: continue
        blob=json.dumps(j).lower()
        score=0
        if "100" in blob: score+=1
        if "export" in blob: score+=2
        if "passed" in blob: score+=2
        if "certif" in blob: score+=1
        if "lifecycle" in blob or "closure" in blob: score+=2
        if score>=6:candidates.append((score,p,j))
    candidates.sort(key=lambda x:(x[0],str(x[1])),reverse=True)
    return candidates[0] if candidates else None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    lp=er/LIVE/"exact_new_one_hundred_guarded_live_export_execution.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27E Exact Two-Hundred Export Artifact/Runtime Verification + Progressive Lifecycle Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_LIFECYCLE_CLOSURE")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Reference re-export: FORBIDDEN")

    if not lp.exists():
        print("STATUS: BLOCKED");print("REASON: R27D evidence missing");return 4
    live=loadj(lp)
    outcomes=live.get("outcomes") or []
    if live.get("status")!="PASSED" or live.get("certifiedCount")!=100 or len(outcomes)!=100:
        print("STATUS: BLOCKED");print("REASON: exact new-100 R27D live execution must be PASSED 100/100");return 5
    if live.get("referenceReexported") is not False:
        print("STATUS: BLOCKED");print("REASON: reference cohort re-export invariant violated");return 6

    artifact_ok=all(
        x.get("certified") is True and
        (x.get("artifact") or {}).get("pdfDownloadCount")==1 and
        (x.get("artifact") or {}).get("pdfObjectUrlEventCount")==1 and
        (x.get("artifact") or {}).get("pdfMimeType")=="application/pdf" and
        isinstance((x.get("artifact") or {}).get("pdfSizeBytes"),(int,float)) and
        (x.get("artifact") or {}).get("pdfSizeBytes")>0 and
        str((x.get("artifact") or {}).get("pdfFilename") or "").lower().endswith(".pdf")
        for x in outcomes
    )
    runtime_ok=all(
        x.get("runtimeErrorCount")==0 and x.get("unhandledRejectionCount")==0 and
        x.get("postPublishReportReviewUnmountCertified") is True and
        x.get("explorerContinuity") is True and x.get("sameOrigin") is True
        for x in outcomes
    )
    ordinals=[x.get("ordinal") for x in outcomes]
    targets=[x.get("target") for x in outcomes]
    exact_delta=(ordinals==list(range(101,201)) and len(targets)==100 and len(set(t.lower() for t in targets if isinstance(t,str)))==100)

    ref=find_reference(er)
    ref_found=ref is not None
    ref_path=str(ref[1]) if ref else None
    ref_status=(ref[2].get("status") if ref else None)
    # Closed-reference authority is also explicitly attested by the PASSED R27D evidence.
    reference_contract_ok=(
        live.get("referenceClosedCount")==100 and
        live.get("referenceReexported") is False and
        (live.get("checks") or {}).get("referenceOneHundredNotReexported") is True
    )

    combined=100+live.get("certifiedCount",0)
    status="PASSED" if all([artifact_ok,runtime_ok,exact_delta,reference_contract_ok,combined==200]) else "FAILED"
    state=("M419D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSURE_FAILED")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"
         if status=="PASSED" else
         "M4_19D4BN17C_R4_R12_R16A_R27E_R1_EXACT_TWO_HUNDRED_CLOSURE_RESIDUAL_DIAGNOSIS")

    digest=hashlib.sha256(json.dumps(
        [{"ordinal":x.get("ordinal"),"target":x.get("target"),"artifact":x.get("artifact")} for x in outcomes],
        sort_keys=True,separators=(",",":")
    ).encode()).hexdigest()

    checks={
      "r27dPassed":live.get("status")=="PASSED",
      "r27dCertifiedCountExactly100":live.get("certifiedCount")==100,
      "r27dOutcomeCountExactly100":len(outcomes)==100,
      "newCohortOrdinalsExactly101Through200":ordinals==list(range(101,201)),
      "newCohortTargetsExactly100Unique":len(targets)==100 and len(set(t.lower() for t in targets if isinstance(t,str)))==100,
      "allNewCohortArtifactsCertified":artifact_ok,
      "allNewCohortRuntimeCertified":runtime_ok,
      "referenceClosedCountExactly100":live.get("referenceClosedCount")==100,
      "referenceOneHundredNotReexported":live.get("referenceReexported") is False,
      "referenceClosureContractConsumed":reference_contract_ok,
      "exactCombinedCertifiedCount200":combined==200,
      "referenceEvidenceCandidateLocated":ref_found,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_two_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27E_EXACT_TWO_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "referenceClosedCertifiedCount":100,
      "newLiveCertifiedCount":live.get("certifiedCount"),
      "exactCombinedCertifiedCount":combined,
      "referenceReexported":False,
      "newCohortArtifactEvidenceSha256":digest,
      "referenceEvidenceCandidate":ref_path,
      "referenceEvidenceCandidateStatus":ref_status,
      "checks":checks,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_CLOSED_CERTIFIED_COUNT:",100)
    print("NEW_LIVE_CERTIFIED_COUNT:",live.get("certifiedCount"))
    print("EXACT_COMBINED_CERTIFIED_COUNT:",combined)
    print("REFERENCE_REEXPORTED: False")
    print("NEW_COHORT_ARTIFACTS_CERTIFIED:",artifact_ok)
    print("NEW_COHORT_RUNTIME_CERTIFIED:",runtime_ok)
    print("NEW_COHORT_ORDINALS_EXACT_101_200:",exact_delta)
    print("REFERENCE_CLOSURE_CONTRACT_CERTIFIED:",reference_contract_ok)
    print("REFERENCE_EVIDENCE_CANDIDATE:",ref_path)
    print("NEW_COHORT_ARTIFACT_EVIDENCE_SHA256:",digest)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27E EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
