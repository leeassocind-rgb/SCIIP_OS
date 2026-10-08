#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib

M="M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: close_bn10_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    a=ev/"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_explain_evidence_consumer_parity_certification.json"
    r1=ev/"M4_19D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLUTION"/"explain_evidence_activation_path_resolution.json"
    r2=ev/"M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION"/"exact_ten_live_explain_evidence_activation_path_recertification.json"
    r3=ev/"M4_19D4BN10B_R3_COMMAND_ACTION_NODE_RECONCILIATION_AND_LIVE_EXPLAIN_EVIDENCE_RECERTIFICATION"/"command_action_node_reconciliation_live_explain_evidence_recertification.json"

    print("="*88)
    print("SCIIP Explorer 4.0 — BN10C Governed Explain/Evidence Consumer Lifecycle Closure")
    print("="*88)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (a,r1,r2,r3) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    ar,rr1,rr2,rr3=map(load,(a,r1,r2,r3))
    rows=rr3.get("records") or []
    queries=[x.get("query") for x in rows]
    aauth=ar.get("authority") or {}
    r3auth=rr3.get("authority") or {}
    r1checks=rr1.get("checks") or {}

    checks={
      "bn10aPassed":ar.get("status")=="PASSED",
      "bn10aStateCertified":ar.get("state")=="M419D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFIED",
      "bn10aDiagnosisCertified":ar.get("diagnosis")=="EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_CONTRACT_PARITY_CERTIFIED",

      "bn10bR1Passed":rr1.get("status")=="PASSED",
      "bn10bR1StateResolved":rr1.get("state")=="M419D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLVED",
      "bn10bR1RouteDispatcher":rr1.get("routeType")=="ACTION_DISPATCHER",
      "bn10bR1EvidenceSignalsPresent":r1checks.get("allEvidenceSignalsPresent") is True,
      "bn10bR1ExplanationSignalsPresent":r1checks.get("allExplanationSignalsPresent") is True,

      "bn10bR2DiagnosticGapRecorded":rr2.get("status")=="DIAGNOSTIC_COMPLETE",
      "bn10bR2SelectorGapPreserved":all(x.get("explainActionClicked") is False for x in (rr2.get("records") or [])),

      "bn10bR3Passed":rr3.get("status")=="PASSED",
      "bn10bR3StateCertified":rr3.get("state")=="M419D4BN10B_R3_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED",
      "bn10bR3DiagnosisCertified":rr3.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_AND_CONSUMER_CERTIFIED",

      "exactTenCount":len(rows)==10,
      "exactApprovedCohort":queries==EXPECTED,
      "certifiedCountTen":rr3.get("certifiedCount")==10,

      "allControlledValueMatch":all(x.get("controlledValueMatch") is True for x in rows),
      "allExplorerMounted":all(x.get("explorerMounted") is True for x in rows),
      "allMapsVisibleBeforeExplain":all(x.get("mapVisible") is True for x in rows),
      "allCommandSurfacesOpened":all(x.get("commandSurfaceOpened") is True for x in rows),
      "allExplainActionsResolved":all(x.get("explainActionResolved") is True for x in rows),
      "allExplainActionsClicked":all(x.get("explainActionClicked") is True for x in rows),
      "allExplainConsumersVisible":all(x.get("explainConsumerVisible") is True for x in rows),
      "allEvidenceSignalsObserved":all((x.get("evidenceSignalCount") or 0)>0 for x in rows),
      "allExplanationSignalsObserved":all((x.get("explanationSignalCount") or 0)>0 for x in rows),
      "allMapsVisibleAfterExplain":all(x.get("mapVisibleAfterExplain") is True for x in rows),
      "allOutcomesCertified":all(x.get("outcome")=="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED" for x in rows),

      "bn10aApplicationMutationOff":aauth.get("applicationSourceMutation") is False,
      "bn10aGovernedMutationOff":aauth.get("governedDataMutation") is False,
      "bn10bR3ApplicationMutationOff":r3auth.get("applicationSourceMutation") is False,
      "bn10bR3GovernedMutationOff":r3auth.get("governedDataMutation") is False,
      "bn10bR3PixelEvidenceOff":r3auth.get("pixelEvidence") is False,
    }

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN10C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "checks":checks,
      "cohort":{"count":len(rows),"queries":queries},
      "closure":{
        "explainEvidenceLifecycleClosed":passed,
        "sourceContractParityCertified":passed,
        "activationPathResolved":passed,
        "actionNodeCertified":passed,
        "evidenceConsumerCertified":passed,
        "explanationConsumerCertified":passed,
        "mapContinuityCertified":passed
      },
      "evidence":{
        "bn10a":{"path":str(a),"sha256":sha(a)},
        "bn10bR1":{"path":str(r1),"sha256":sha(r1)},
        "bn10bR2":{"path":str(r2),"sha256":sha(r2)},
        "bn10bR3":{"path":str(r3),"sha256":sha(r3)}
      },
      "next":"BN10_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN10_LIFECYCLE_REMAINS_OPEN"
    }

    f=out/"governed_explain_evidence_consumer_lifecycle_closure.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN EXPLAIN/EVIDENCE OUTCOMES -----")
    for i,x in enumerate(rows,1):
        ok=x.get("outcome")=="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED"
        print(f"{i:02d}. {x.get('query')} -> {'CERTIFIED' if ok else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
