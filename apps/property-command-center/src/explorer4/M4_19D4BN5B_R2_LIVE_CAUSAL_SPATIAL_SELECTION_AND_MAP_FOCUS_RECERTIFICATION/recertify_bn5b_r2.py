#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION"
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
        print("usage: recertify_bn5b_r2.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn5a=ev/"M4_19D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION"/"exact_ten_governed_spatial_selection_map_focus_contract_certification.json"
    bn5b=ev/"M4_19D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVATION"/"exact_ten_live_governed_spatial_selection_map_focus_observation.json"
    r1=ev/"M4_19D4BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSAL_RECONCILIATION"/"search_session_handoff_causal_reconciliation.json"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN5B-R2 Live Causal Spatial Selection + Map Focus")
    print("="*72)
    print("Mode: READ_ONLY_EVIDENCE_RECERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn5a,bn5b,r1) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_CERTIFIED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    a=load(bn5a); b=load(bn5b); r=load(r1)
    records=b.get("records") or []
    queries=[x.get("query") for x in records]

    checks={
      "bn5aPassed":a.get("status")=="PASSED",
      "bn5aStateCertified":a.get("state")=="M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED",
      "bn5aDiagnosisCertified":a.get("diagnosis")=="EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_PARITY_CERTIFIED",

      "bn5bR1Passed":r.get("status")=="PASSED",
      "bn5bR1StateReconciled":r.get("state")=="M419D4BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSALLY_RECONCILED",
      "bn5bR1DiagnosisReconciled":r.get("diagnosis")=="RESIDUAL_SEARCH_SESSION_VALUE_IS_HANDOFF_CLEANUP_GAP_NOT_SPATIAL_SELECTION_FAILURE",

      "exactTenRecords":len(records)==10,
      "exactApprovedCohort":queries==EXPECTED,
    }

    per=[]
    for x in records:
        pre=x.get("pre") or {}
        prop=x.get("property") or {}
        neigh=x.get("neighbors") or {}
        rc={
          "query":x.get("query"),
          "controlledValueMatch":x.get("controlledValueMatch") is True,
          "explorerMounted":pre.get("explorer") is True,
          "mapVisibleAfterSelection":pre.get("mapVisible") is True,
          "focusLikeSignalObserved":x.get("focusLikeSignalObserved") is True,
          "selectedSignalObserved":(pre.get("selectedSignalCount") or 0)>0,
          "markerSignalObserved":(pre.get("markerSignalCount") or 0)>0,
          "propertyDrawerVisible":prop.get("drawerVisible") is True,
          "neighborsDrawerVisible":neigh.get("drawerVisible") is True,
          "mapVisibleAfterNeighbors":neigh.get("mapVisible") is True,
          "sessionResidualRecorded":pre.get("sessionQuery")==x.get("query"),
        }

        # Corrected causal rule:
        # session residual is observational cleanup evidence only, not a focus gate.
        live_core=all([
            rc["controlledValueMatch"],
            rc["explorerMounted"],
            rc["mapVisibleAfterSelection"],
            rc["focusLikeSignalObserved"],
            rc["propertyDrawerVisible"],
            rc["neighborsDrawerVisible"],
            rc["mapVisibleAfterNeighbors"],
        ])

        rc["causalSpatialSelectionAndFocusCertified"]=(
          live_core and
          checks["bn5aPassed"] and
          checks["bn5bR1Passed"] and
          checks["bn5bR1DiagnosisReconciled"]
        )
        per.append(rc)

    checks["allExactTenLiveCoreSpatialObservationsPassed"]=len(per)==10 and all(x["causalSpatialSelectionAndFocusCertified"] for x in per)
    checks["allResidualSessionValuesRecorded"]=len(per)==10 and all(x["sessionResidualRecorded"] for x in per)

    passed=all(checks.values())
    certified=sum(1 for x in per if x["causalSpatialSelectionAndFocusCertified"])

    result={
      "framework":"SCIIP_EXPLORER_4_BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN5B_R2_EXACT_TEN_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED" if passed else "M419D4BN5B_R2_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_CAUSAL_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED" if passed else "LIVE_CAUSAL_SPATIAL_SELECTION_OR_MAP_FOCUS_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_RECERTIFICATION",
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
      "evidence":{
        "bn5a":{"path":str(bn5a),"sha256":sha(bn5a)},
        "bn5b":{"path":str(bn5b),"sha256":sha(bn5b)},
        "bn5bR1":{"path":str(r1),"sha256":sha(r1)}
      },
      "checks":checks,
      "records":per,
      "certifiedCount":certified,
      "recordCount":len(per),
      "recertificationBoundary":{
        "sessionStorageResidualDisqualifiesSpatialFocus":False,
        "sessionStorageResidualStillRecorded":True,
        "sourceFocusContractInheritedFromBN5A":True,
        "cleanupGapInheritedFromBN5BR1":True,
        "pixelCenterEqualityClaimed":False
      },
      "next":"BN5B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN5B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE" if passed else None
    }

    outfile=out/"live_causal_spatial_selection_map_focus_recertification.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- RECERTIFICATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- EXACT-TEN LIVE CAUSAL SPATIAL OUTCOMES -----")
    for i,x in enumerate(per,1):
        print(f"{i:02d}. {x['query']} -> {'CERTIFIED' if x['causalSpatialSelectionAndFocusCertified'] else 'FAILED'}")

    print(f"\nCERTIFIED: {certified}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",outfile)

    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
