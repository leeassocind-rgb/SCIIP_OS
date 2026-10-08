#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib

M="M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    a=ev/"M4_19D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_export_presentation_consumer_parity_certification.json"
    b=ev/"M4_19D4BN11B_R2_CDP_WEBSOCKET_HANDSHAKE_REPAIR_AND_LIVE_EXPORT_PRESENTATION_RECERTIFICATION"/"live_export_presentation_recertification.json"

    print("="*88)
    print("SCIIP Explorer 4.0 — BN11C Governed Export/Presentation Consumer Lifecycle Closure")
    print("="*88)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (a,b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing:print("MISSING:",p)
        return 4

    ar,br=load(a),load(b)
    rows=br.get("outcomes") or []
    aauth=ar.get("authority") or {}
    bauth=br.get("authority") or {}

    checks={
      "bn11aPassed":ar.get("status")=="PASSED",
      "bn11aStateCertified":ar.get("state")=="M419D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFIED",
      "bn11aDiagnosisCertified":ar.get("diagnosis")=="EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_CONTRACT_PARITY_CERTIFIED",
      "bn11bR2Passed":br.get("status")=="PASSED",
      "bn11bR2StateCertified":br.get("state")=="M419D4BN11B_R2_EXACT_TEN_LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED",
      "bn11bR2DiagnosisCertified":br.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED",
      "exactTenCount":len(rows)==10,
      "exactApprovedCohort":[x.get("property") for x in rows]==EXPECTED,
      "observedCountTen":br.get("observedCount")==10,
      "allControlledValueMatch":all(x.get("controlledValueMatch") is True for x in rows),
      "allExplorerMounted":all(x.get("explorerMounted") is True for x in rows),
      "allMapsVisibleBeforeConsumers":all(x.get("mapVisible") is True for x in rows),
      "allExportControlsClicked":all(x.get("exportControlClicked") is True for x in rows),
      "allExportConsumersVisible":all(x.get("exportConsumerVisible") is True for x in rows),
      "allPresentControlsClicked":all(x.get("presentControlClicked") is True for x in rows),
      "allPresentationConsumersVisible":all(x.get("presentationConsumerVisible") is True for x in rows),
      "allMapsVisibleAfterConsumers":all(x.get("mapVisibleAfterConsumers") is True for x in rows),
      "allOutcomesCertified":all(x.get("outcome")=="LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED" for x in rows),
      "bn11aApplicationMutationOff":aauth.get("applicationSourceMutation") is False,
      "bn11aGovernedMutationOff":aauth.get("governedDataMutation") is False,
      "bn11bR2ApplicationMutationOff":bauth.get("applicationSourceMutation") is False,
      "bn11bR2GovernedMutationOff":bauth.get("governedDataMutation") is False,
      "bn11bR2PixelEvidenceOff":bauth.get("pixelEvidence") is False
    }

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN11C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "cohort":{"count":len(rows),"properties":[x.get("property") for x in rows]},
      "evidence":{"bn11a":{"path":str(a),"sha256":sha(a)},"bn11bR2":{"path":str(b),"sha256":sha(b)}},
      "next":"BN11_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN11_LIFECYCLE_REMAINS_OPEN"
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"governed_export_presentation_consumer_lifecycle_closure.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("\n----- EXACT-TEN EXPORT/PRESENTATION OUTCOMES -----")
    for i,x in enumerate(rows,1):
        ok=x.get("outcome")=="LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMERS_OBSERVED"
        print(f"{i:02d}. {x.get('property')} -> {'CERTIFIED' if ok else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
