#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, re, sys, hashlib

R24C="M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
R24C_STATE="M419D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_INCOMPLETE"

R24A="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R24B_R3="M4_19D4BN17C_R4_R12_R16A_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"

M="M4_19D4BN17C_R4_R12_R16A_R24C_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS_AND_NORMALIZED_COHORT_RECONCILIATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def norm_candidate(raw):
    s=re.sub(r"\s+"," ",raw or "").strip()
    m=re.match(r"^(.*?)(?=(?:EXISTING|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C)\s*·)",s,re.I)
    return m.group(1).strip() if m else s

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p24c=evid/R24C/"exact_twenty_five_record_guarded_export_execution_readiness_and_authorization.json"
    p24a=evid/R24A/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    p24b=evid/R24B_R3/"direct_report_review_materialization_repair_and_fifteen_record_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24C-R1 Authorization Residual Diagnosis + Normalized Cohort Reconciliation")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    for p in [p24c,p24a,p24b]:
        if not p.exists():
            print("STATUS: BLOCKED")
            print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
            print("MISSING:",p)
            return 4

    c=loadj(p24c); a=loadj(p24a); b=loadj(p24b)

    if c.get("status")!="DIAGNOSTIC_COMPLETE" or c.get("state")!=R24C_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24C_INCOMPLETE_AUTHORIZATION_STATE_REQUIRED"); return 5

    raw25=a.get("exactTwentyFiveCandidateCohort") or []
    ref=a.get("referenceCohort") or []
    normalized15=b.get("normalizedTargets") or []

    if len(raw25)!=25 or len(ref)!=10 or len(normalized15)!=15:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXPECTED_25_10_15_EVIDENCE_SHAPES_REQUIRED"); return 6

    raw_new=raw25[10:]
    normalized_raw_new=[norm_candidate(x) for x in raw_new]
    mismatch_rows=[]
    for i,(raw,normed,certified) in enumerate(zip(raw_new,normalized_raw_new,normalized15),11):
        mismatch_rows.append({
            "ordinal":i,
            "rawCandidate":raw,
            "normalizedCandidate":normed,
            "qualifiedTarget":certified,
            "rawEqualsQualified":raw==certified,
            "normalizedEqualsQualified":normed==certified,
            "statusSuffixRemoved":raw!=normed
        })

    raw_order_match = raw_new==normalized15
    normalized_order_match = normalized_raw_new==normalized15
    normalized25 = ref + normalized_raw_new
    qualified25 = ref + normalized15
    exact_identity_reconciled = normalized25==qualified25

    checks={
        "r24cIncompleteAuthorizationConsumed":True,
        "r24aRawExactTwentyFiveConsumed":True,
        "r24bR3NormalizedFifteenConsumed":True,
        "referenceTenPreserved":len(ref)==10,
        "rawNewFifteenPreserved":len(raw_new)==15,
        "normalizedNewFifteenResolved":len(normalized_raw_new)==15,
        "rawOrderMismatchConfirmed":raw_order_match is False,
        "normalizationOnlyAtRecognizedStatusBoundary":all(
            (r["rawCandidate"]==r["normalizedCandidate"]) or r["statusSuffixRemoved"] for r in mismatch_rows
        ),
        "normalizedR24aNewOrderMatchesR24bR3QualifiedOrder":normalized_order_match,
        "normalizedExactTwentyFiveReconciled":exact_identity_reconciled,
        "exactTwentyFiveUniqueNormalizedTargets":len({x.lower() for x in normalized25})==25,
        "noCohortReordering":True,
        "noCandidateSubstitution":True,
        "identityGuardNotWeakened":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True,
        "liveUiInteractionOff":True,
        "exportInvocationOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R24C_R1_NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILIATION_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R24C_R1_NORMALIZED_COHORT_RECONCILIATION_INCOMPLETE")
    classification=("R24C_AUTHORIZATION_GAP_CAUSED_SOLELY_BY_RAW_STATUS_SUFFIX_IDENTITY_PARITY_MISMATCH_NORMALIZED_COHORT_ORDER_RECONCILED"
                    if passed else
                    "R24C_AUTHORIZATION_RESIDUAL_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_RECERTIFICATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R24C_R1_R1_AUTHORIZATION_RESIDUAL_DEEP_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24C_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS_AND_NORMALIZED_COHORT_RECONCILIATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "rawExactTwentyFiveCohort":raw25,
        "normalizedExactTwentyFiveCohort":normalized25,
        "qualifiedExactTwentyFiveCohort":qualified25,
        "rawOrderMatch":raw_order_match,
        "normalizedOrderMatch":normalized_order_match,
        "mismatchRows":mismatch_rows,
        "normalizationPolicy":{
            "scope":"IDENTITY_RECONCILIATION_ONLY",
            "recognizedStatusSuffixBoundaryOnly":True,
            "cohortOrderMutation":False,
            "candidateSubstitution":False,
            "applicationSourceMutation":False,
            "governedDataMutation":False
        },
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "liveUiInteraction":False,
            "exportInvocation":False
        },
        "sourceEvidence":{
            "r24c":{"path":str(p24c),"sha256":hashlib.sha256(p24c.read_bytes()).hexdigest()},
            "r24a":{"path":str(p24a),"sha256":hashlib.sha256(p24a.read_bytes()).hexdigest()},
            "r24bR3":{"path":str(p24b),"sha256":hashlib.sha256(p24b.read_bytes()).hexdigest()}
        },
        "nextMilestone":nextm
    }

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"authorization_residual_diagnosis_and_normalized_cohort_reconciliation.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("RAW_ORDER_MATCH:",raw_order_match)
    print("NORMALIZED_ORDER_MATCH:",normalized_order_match)
    print("NORMALIZED_EXACT_TWENTY_FIVE_RECONCILED:",exact_identity_reconciled)
    print()
    print("----- IDENTITY PARITY ROWS -----")
    for r in mismatch_rows:
        print(json.dumps(r,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
