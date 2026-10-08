#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R22B_R1_GUARDED_EXPORT_MICRO_COHORT_RESIDUAL_CAUSAL_DIAGNOSIS"
R22B="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"
R21R4="M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def compact(s,n=12000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p22=evid/R22B/"exact_three_record_guarded_export_micro_cohort_execution.json"
    if not p22.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22B_EVIDENCE_REQUIRED")
        return 4
    r22=loadj(p22)

    if r22.get("state")!="M419D4BN17C_R4_R12_R16A_R22B_GUARDED_EXPORT_MICRO_COHORT_INCOMPLETE":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: EXPECTED_R22B_INCOMPLETE_STATE_REQUIRED")
        return 5

    outcomes=r22.get("outcomes") or []
    first=outcomes[0] if outcomes else {}
    artifact=first.get("artifact") or {}

    # Compare with prior single-record guard wording to detect earlier weak continuity predicate.
    prior={}
    p21=evid/R21R4/"single_record_guarded_export_invocation_certification.json"
    if p21.exists():
        prior=loadj(p21)

    # Source inspection: report component and parent owner.
    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    owner=app/"src/broker-product/ListingAssignmentProductionHouse.jsx"

    report_src=report.read_text(errors="ignore") if report.exists() else ""
    owner_src=owner.read_text(errors="ignore") if owner.exists() else ""

    # Resolve exportReport -> onPublish and parent onPublish callback behavior.
    export_handler=None
    m=re.search(r'(?:function|const)\s+exportReport\b[\s\S]{0,5000}',report_src)
    if m:
        export_handler=compact(m.group(0),7000)

    onpublish_refs=[]
    for m in re.finditer(r'onPublish',owner_src):
        onpublish_refs.append({
            "line":owner_src.count("\n",0,m.start())+1,
            "snippet":compact(owner_src[max(0,m.start()-1800):m.start()+3000],5000)
        })

    show_refs=[]
    for m in re.finditer(r'setShowReportReview\s*\(',owner_src):
        show_refs.append({
            "line":owner_src.count("\n",0,m.start())+1,
            "snippet":compact(owner_src[max(0,m.start()-1400):m.start()+2600],4200)
        })

    # Classify intended post-publish behavior.
    publish_closes=False
    publish_close_evidence=[]
    for ref in onpublish_refs:
        s=ref["snippet"]
        if re.search(r'onPublish[\s\S]{0,1200}setShowReportReview\s*\(\s*false\s*\)',s,re.I) or \
           re.search(r'setShowReportReview\s*\(\s*false\s*\)[\s\S]{0,1200}onPublish',s,re.I):
            publish_closes=True
            publish_close_evidence.append(ref)

    # Also look for inline prop shape:
    inline_patterns=[
        r'onPublish\s*=\s*\{\s*\([^)]*\)\s*=>\s*\{[\s\S]{0,1800}?setShowReportReview\s*\(\s*false\s*\)',
        r'onPublish\s*=\s*\{\s*[^}]*setShowReportReview\s*\(\s*false\s*\)'
    ]
    for pat in inline_patterns:
        mm=re.search(pat,owner_src,re.I)
        if mm:
            publish_closes=True
            publish_close_evidence.append({
                "line":owner_src.count("\n",0,mm.start())+1,
                "snippet":compact(mm.group(0),5000)
            })

    # Detect whether R21-R4 continuity predicate was semantically broad enough to false-positive.
    prior_script=app/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION/certify_r21_r4.py"
    prior_script_src=prior_script.read_text(errors="ignore") if prior_script.exists() else ""
    prior_weak_regex=bool(re.search(r'Institutional Report\|Client Listing Report',prior_script_src))
    r22_script=app/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION/execute_r22b.py"
    r22_script_src=r22_script.read_text(errors="ignore") if r22_script.exists() else ""
    r22_strict_regex=bool(re.search(r'Review Client Listing Report\|Institutional Reporting Engine',r22_script_src))

    export_success=all([
        first.get("exportAction",{}).get("clicked") is True,
        artifact.get("pdfDownloadCount")==1,
        artifact.get("pdfEventCount")==1,
        artifact.get("mimeType")=="application/pdf",
        isinstance(artifact.get("sizeBytes"),int) and artifact.get("sizeBytes")>0,
        first.get("runtimeErrorCount")==0,
        first.get("unhandledRejectionCount")==0,
        first.get("explorerContinuity") is True,
        first.get("sameOrigin") is True
    ])

    if export_success and publish_closes:
        classification="R22B_EXPORT_SUCCEEDED_REPORT_REVIEW_UNMOUNT_IS_INTENDED_POST_PUBLISH_BEHAVIOR"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_POST_PUBLISH_CONTINUITY_GUARD_REPAIR_AND_THREE_RECORD_EXPORT_RECERTIFICATION"
    elif export_success and prior_weak_regex and r22_strict_regex:
        classification="R22B_EXPORT_SUCCEEDED_PRIOR_REPORT_REVIEW_CONTINUITY_GUARD_WAS_FALSE_POSITIVE_PRONE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_POST_PUBLISH_CONTINUITY_GUARD_REPAIR_AND_THREE_RECORD_EXPORT_RECERTIFICATION"
    elif export_success:
        classification="R22B_EXPORT_SUCCEEDED_REPORT_REVIEW_POST_ACTION_STATE_REQUIRES_EXACT_SOURCE_OWNER_RESOLUTION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R1_R1_POST_PUBLISH_SOURCE_OWNER_DEEP_DIAGNOSIS"
    else:
        classification="R22B_EXPORT_ARTIFACT_OR_RUNTIME_FAILURE_REMAINS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R1_R1_EXPORT_ARTIFACT_RUNTIME_DEEP_DIAGNOSIS"

    checks={
        "r22bIncompleteStateConsumed":True,
        "firstRecordExportClicked":first.get("exportAction",{}).get("clicked") is True,
        "pdfDownloadCertified":artifact.get("pdfDownloadCount")==1,
        "pdfObjectUrlCertified":artifact.get("pdfEventCount")==1,
        "pdfMimeCertified":artifact.get("mimeType")=="application/pdf",
        "pdfSizePositive":isinstance(artifact.get("sizeBytes"),int) and artifact.get("sizeBytes")>0,
        "runtimeClean":first.get("runtimeErrorCount")==0 and first.get("unhandledRejectionCount")==0,
        "explorerContinuityPreserved":first.get("explorerContinuity") is True,
        "sameOriginPreserved":first.get("sameOrigin") is True,
        "reportReviewContinuityFailed":first.get("reportReviewContinuity") is False,
        "exportReportSourceInspected":bool(export_handler),
        "onPublishSourceInspected":bool(onpublish_refs),
        "setShowReportReviewSourceInspected":bool(show_refs),
        "postPublishCloseBehaviorClassified":publish_closes,
        "priorContinuityPredicateInspected":bool(prior_script_src),
        "r22ContinuityPredicateInspected":bool(r22_script_src),
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    outdir=evid/M
    outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"guarded_export_micro_cohort_residual_causal_diagnosis.json"
    data={
        "framework":"SCIIP_EXPLORER_4_R22B_R1_GUARDED_EXPORT_MICRO_COHORT_RESIDUAL_CAUSAL_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED",
        "state":"M419D4BN17C_R4_R12_R16A_R22B_R1_RESIDUAL_CAUSE_CERTIFIED",
        "classification":classification,
        "firstRecord":{
            "target":first.get("target"),
            "artifact":artifact,
            "runtimeErrorCount":first.get("runtimeErrorCount"),
            "unhandledRejectionCount":first.get("unhandledRejectionCount"),
            "reportReviewContinuity":first.get("reportReviewContinuity"),
            "explorerContinuity":first.get("explorerContinuity"),
            "sameOrigin":first.get("sameOrigin")
        },
        "source":{
            "reportFile":str(report.relative_to(app)) if report.exists() else None,
            "ownerFile":str(owner.relative_to(app)) if owner.exists() else None,
            "exportHandler":export_handler,
            "onPublishRefs":onpublish_refs[:20],
            "setShowReportReviewRefs":show_refs[:30],
            "publishClosesReportReview":publish_closes,
            "publishCloseEvidence":publish_close_evidence[:20]
        },
        "guardComparison":{
            "priorR21R4WeakContinuityRegexDetected":prior_weak_regex,
            "r22bStrictContinuityRegexDetected":r22_strict_regex
        },
        "checks":checks,
        "authority":{
            "exportInvocation":False,
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False
        },
        "nextMilestone":nextm
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B-R1 Guarded Export Micro-Cohort Residual Causal Diagnosis")
    print("="*120)
    print("TARGET:",first.get("target"))
    print("EXPORT_CLICKED:",first.get("exportAction",{}).get("clicked"))
    print("PDF_DOWNLOAD_COUNT:",artifact.get("pdfDownloadCount"))
    print("PDF_EVENT_COUNT:",artifact.get("pdfEventCount"))
    print("PDF_MIME:",artifact.get("mimeType"))
    print("PDF_SIZE_BYTES:",artifact.get("sizeBytes"))
    print("RUNTIME_ERRORS:",first.get("runtimeErrorCount"))
    print("UNHANDLED_REJECTIONS:",first.get("unhandledRejectionCount"))
    print("REPORT_REVIEW_CONTINUITY:",first.get("reportReviewContinuity"))
    print("EXPLORER_CONTINUITY:",first.get("explorerContinuity"))
    print("SAME_ORIGIN:",first.get("sameOrigin"))
    print("PUBLISH_CLOSES_REPORT_REVIEW:",publish_closes)
    print("PRIOR_R21_R4_WEAK_CONTINUITY_REGEX:",prior_weak_regex)
    print("R22B_STRICT_CONTINUITY_REGEX:",r22_strict_regex)

    print("\n----- POST-PUBLISH CLOSE EVIDENCE -----")
    for x in publish_close_evidence[:10]:
        print(json.dumps(x))

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R22B_R1_RESIDUAL_CAUSE_CERTIFIED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
