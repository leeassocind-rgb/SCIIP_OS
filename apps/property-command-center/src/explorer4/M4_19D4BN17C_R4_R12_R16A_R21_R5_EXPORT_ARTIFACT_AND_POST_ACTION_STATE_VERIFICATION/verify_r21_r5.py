#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,re

M="M4_19D4BN17C_R4_R12_R16A_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"single_record_guarded_export_invocation_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R4_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected="SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R4_SINGLE_RECORD_EXPORT_CERTIFICATION_REQUIRED")
        return 5

    after=prev.get("after") or {}
    probe=after.get("probe") or {}
    downloads=probe.get("downloads") or []
    events=probe.get("events") or []

    pdf_events=[x for x in events if x.get("type")=="createObjectURL" and x.get("blobType")=="application/pdf"]
    download_records=[x for x in downloads if (x.get("download") or "").lower().endswith(".pdf")]
    filenames=[x.get("download") for x in download_records if x.get("download")]
    blob_hrefs=[x.get("href") for x in download_records if str(x.get("href") or "").startswith("blob:")]

    exact_one_download=len(download_records)==1
    exact_one_pdf_event=len(pdf_events)==1
    pdf_size=(pdf_events[0].get("size") if exact_one_pdf_event else None)
    valid_pdf_size=isinstance(pdf_size,int) and pdf_size>0
    filename=filenames[0] if exact_one_download else None

    filename_contract=bool(filename and re.fullmatch(
        r'Locust_Gateway_Logistics_Center_Client_Listing_Report_\d{4}-\d{2}-\d{2}\.pdf',
        filename
    ))

    shell_continuity=bool(after.get("reportReviewVisible") and after.get("explorerMounted"))
    same_origin=bool(str(after.get("url") or "").startswith("http://127.0.0.1:5173"))
    no_errors=(
        len(probe.get("errors") or [])==0 and
        len(probe.get("unhandled") or [])==0
    )
    output_signal=bool(prev.get("outputSignalObserved"))

    # Verify that the source engine emits a real PDF artifact and filename contract.
    engine=app/"src/product-realism/assignment/institutionalReportEngine.js"
    source_engine_present=engine.exists()
    source_pdf_contract=False
    source_filename_contract=False
    if engine.exists():
        s=engine.read_text(errors="ignore")
        source_pdf_contract=bool(re.search(r'application/pdf|Blob',s,re.I))
        source_filename_contract=bool(re.search(r'Client_Listing_Report|Client Listing Report',s,re.I))

    checks={
        "r21R4Passed":prev.get("status")=="PASSED",
        "singleRecordExportClassificationConsumed":True,
        "exactOnePdfDownloadObserved":exact_one_download,
        "exactOnePdfObjectUrlObserved":exact_one_pdf_event,
        "pdfMimeTypeCertified":exact_one_pdf_event,
        "pdfSizePositive":valid_pdf_size,
        "filenameContractCertified":filename_contract,
        "blobDownloadHrefObserved":len(blob_hrefs)==1,
        "sourceEnginePresent":source_engine_present,
        "sourcePdfContractResolved":source_pdf_contract,
        "sourceFilenameContractResolved":source_filename_contract,
        "reportReviewContinuityPreserved":shell_continuity,
        "sameOriginPreserved":same_origin,
        "noRuntimeErrorsObserved":no_errors,
        "outputSignalPreserved":output_signal,
        "additionalExportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    certifiable=all([
        exact_one_download,
        exact_one_pdf_event,
        valid_pdf_size,
        filename_contract,
        len(blob_hrefs)==1,
        shell_continuity,
        same_origin,
        no_errors,
        output_signal,
        source_engine_present,
        source_pdf_contract
    ])

    if certifiable:
        status="PASSED"
        cls="EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFIED_SINGLE_RECORD_LIFECYCLE_READY_FOR_CLOSURE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        cls="EXPORT_ARTIFACT_OR_POST_ACTION_STATE_VERIFICATION_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R5_R1_EXPORT_ARTIFACT_VERIFICATION_RESIDUAL_DIAGNOSIS"

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"export_artifact_and_post_action_state_verification.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R5_VERIFICATION_INCOMPLETE",
        "priorClassification":prev.get("classification"),
        "artifact":{
            "downloadCount":len(download_records),
            "pdfObjectUrlEventCount":len(pdf_events),
            "filename":filename,
            "mimeType":"application/pdf" if exact_one_pdf_event else None,
            "sizeBytes":pdf_size,
            "blobHref":blob_hrefs[0] if len(blob_hrefs)==1 else None,
            "filenameContractCertified":filename_contract
        },
        "sourceContract":{
            "engineFile":str(engine.relative_to(app)) if engine.exists() else None,
            "enginePresent":source_engine_present,
            "pdfContractResolved":source_pdf_contract,
            "filenameContractResolved":source_filename_contract
        },
        "postAction":{
            "reportReviewVisible":after.get("reportReviewVisible"),
            "explorerMounted":after.get("explorerMounted"),
            "sameOrigin":same_origin,
            "runtimeErrors":probe.get("errors") or [],
            "unhandledRejections":probe.get("unhandled") or []
        },
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "additionalExportInvocation":False
        },
        "nextMilestone":nxt
    }

    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R5 Export Artifact + Post-Action State Verification")
    print("="*120)
    print("R21_R4_CLASSIFICATION:",prev.get("classification"))
    print("PDF_DOWNLOAD_COUNT:",len(download_records))
    print("PDF_OBJECT_URL_EVENT_COUNT:",len(pdf_events))
    print("PDF_FILENAME:",filename)
    print("PDF_MIME_TYPE:","application/pdf" if exact_one_pdf_event else None)
    print("PDF_SIZE_BYTES:",pdf_size)
    print("FILENAME_CONTRACT_CERTIFIED:",filename_contract)
    print("BLOB_DOWNLOAD_HREF_OBSERVED:",len(blob_hrefs)==1)
    print("SOURCE_ENGINE_PRESENT:",source_engine_present)
    print("SOURCE_PDF_CONTRACT_RESOLVED:",source_pdf_contract)
    print("SOURCE_FILENAME_CONTRACT_RESOLVED:",source_filename_contract)
    print("REPORT_REVIEW_CONTINUITY:",shell_continuity)
    print("SAME_ORIGIN:",same_origin)
    print("NO_RUNTIME_ERRORS:",no_errors)
    print("CLASSIFICATION:",cls)

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("STATUS:",status)
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
