#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys

OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R2_EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS"
SRC_EVID="M4_19D4BN17C_R4_R12_R16A_R27B_R2_FIRST_RECORD_EXPORT_CONTROL_BINDING_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
TOKENS=["Download Client Listing Report","exportReport","Client Listing Report","Download","Export"]

def read(p):
    try:return p.read_text(errors="ignore")
    except:return ""

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R2-R2 Export-Control Surface + Handler Deep Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_SOURCE_AND_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    prior=er/SRC_EVID/"first_record_export_control_binding_repair_and_non_export_recertification.json"
    pd={}
    if prior.exists():
        try: pd=json.JSONDecoder().raw_decode(read(prior).lstrip())[0]
        except: pass

    roots=[pcc/"src",pcc/"app",pcc/"components"]
    files=[]
    for root in roots:
        if root.exists():
            for ext in ("*.ts","*.tsx","*.js","*.jsx","*.mjs","*.py"):
                files.extend(root.rglob(ext))
    # Exclude milestone/evidence diagnostic machinery to find actual app implementation.
    files=[p for p in files if "explorer4/M4_" not in str(p) and "/evidence/" not in str(p)]
    hits=[]
    for p in files:
        s=read(p)
        found=[t for t in TOKENS if t in s]
        if found:
            lines=s.splitlines()
            snippets=[]
            for i,line in enumerate(lines):
                if any(t in line for t in found):
                    snippets.append({"line":i+1,"text":line.strip()[:500]})
            hits.append({"path":str(p.relative_to(pcc)),"tokens":found,"snippets":snippets[:20]})

    exact_label=[h for h in hits if "Download Client Listing Report" in h["tokens"]]
    export_handler=[h for h in hits if "exportReport" in h["tokens"]]
    classification=(
      "APPLICATION_SOURCE_CONTAINS_EXPECTED_LABEL_AND_EXPORTREPORT_HANDLER_REQUIRES_LIVE_INSTRUMENTED_CONTROL_SURFACE_CAPTURE"
      if exact_label and export_handler else
      "STATIC_APPLICATION_SOURCE_DOES_NOT_EXPOSE_EXPECTED_LABEL_AND_HANDLER_PAIR"
    )
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R2_R2_EXPORT_CONTROL_SURFACE_AND_HANDLER_DEEP_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "priorReadbackCaptured":isinstance(pd.get("exportControlReadback"),dict),
      "sourceHitCount":len(hits),
      "exactLabelSourceHitCount":len(exact_label),
      "exportReportSourceHitCount":len(export_handler),
      "sourceHits":hits,
      "classification":classification,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"
    }
    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_control_surface_and_handler_deep_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("PRIOR_STRUCTURED_CONTROL_READBACK_PRESENT:",out["priorReadbackCaptured"])
    print("SOURCE_HIT_COUNT:",len(hits))
    print("EXACT_LABEL_SOURCE_HIT_COUNT:",len(exact_label))
    print("EXPORTREPORT_SOURCE_HIT_COUNT:",len(export_handler))
    print("\n----- SOURCE HITS -----")
    for h in hits[:30]:
        print(h["path"],"::",", ".join(h["tokens"]))
        for sn in h["snippets"][:5]: print(f"  L{sn['line']}: {sn['text']}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R2_R2_EXPORT_CONTROL_SURFACE_HANDLER_DEEP_DIAGNOSED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE")
    print("EVIDENCE:",ef)
    print("\nR27B-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
