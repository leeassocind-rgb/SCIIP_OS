#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE"
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
        print("usage: close_bn5_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn5a=ev/"M4_19D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION"/"exact_ten_governed_spatial_selection_map_focus_contract_certification.json"
    bn5r2=ev/"M4_19D4BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION"/"live_causal_spatial_selection_map_focus_recertification.json"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN5C Governed Spatial Selection + Map Focus Closure")
    print("="*72)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn5a,bn5r2) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    a=load(bn5a)
    r=load(bn5r2)
    records=r.get("records") or []
    queries=[x.get("query") for x in records]

    checks={
      "bn5aPassed":a.get("status")=="PASSED",
      "bn5aStateCertified":a.get("state")=="M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED",
      "bn5aDiagnosisCertified":a.get("diagnosis")=="EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_PARITY_CERTIFIED",

      "bn5bR2Passed":r.get("status")=="PASSED",
      "bn5bR2StateCertified":r.get("state")=="M419D4BN5B_R2_EXACT_TEN_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED",
      "bn5bR2DiagnosisCertified":r.get("diagnosis")=="EXACT_TEN_LIVE_CAUSAL_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CERTIFIED",

      "exactTenCount":len(records)==10,
      "exactApprovedCohort":queries==EXPECTED,
      "certifiedCountTen":r.get("certifiedCount")==10,

      "allCausalSpatialFocusCertified":
        all(x.get("causalSpatialSelectionAndFocusCertified") is True for x in records),

      "allControlledValueMatch":
        all(x.get("controlledValueMatch") is True for x in records),

      "allExplorerMounted":
        all(x.get("explorerMounted") is True for x in records),

      "allMapsVisibleAfterSelection":
        all(x.get("mapVisibleAfterSelection") is True for x in records),

      "allFocusLikeSignalsObserved":
        all(x.get("focusLikeSignalObserved") is True for x in records),

      "allPropertyDrawersVisible":
        all(x.get("propertyDrawerVisible") is True for x in records),

      "allNeighborsDrawersVisible":
        all(x.get("neighborsDrawerVisible") is True for x in records),

      "allMapsVisibleAfterNeighbors":
        all(x.get("mapVisibleAfterNeighbors") is True for x in records),

      "allResidualSessionValuesRecorded":
        all(x.get("sessionResidualRecorded") is True for x in records),

      "sessionResidualDoesNotDisqualifySpatialFocus":
        (r.get("recertificationBoundary") or {}).get("sessionStorageResidualDisqualifiesSpatialFocus") is False,

      "sourceFocusContractInherited":
        (r.get("recertificationBoundary") or {}).get("sourceFocusContractInheritedFromBN5A") is True,

      "cleanupGapInherited":
        (r.get("recertificationBoundary") or {}).get("cleanupGapInheritedFromBN5BR1") is True,
    }

    aauth=a.get("authority") or {}
    rauth=r.get("authority") or {}
    checks["bn5aApplicationMutationOff"]=aauth.get("applicationSourceMutation") is False
    checks["bn5aGovernedMutationOff"]=aauth.get("governedDataMutation") is False
    checks["bn5bR2ApplicationMutationOff"]=rauth.get("applicationSourceMutation") is False
    checks["bn5bR2GovernedMutationOff"]=rauth.get("governedDataMutation") is False
    checks["bn5bR2NetworkAuthorityOff"]=rauth.get("networkAuthority") is False
    checks["bn5bR2PixelEvidenceOff"]=rauth.get("pixelEvidence") is False

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED" if passed else "M419D4BN5C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False,
        "pixelEvidence":False
      },
      "evidence":{
        "bn5a":{"path":str(bn5a),"sha256":sha(bn5a)},
        "bn5bR2":{"path":str(bn5r2),"sha256":sha(bn5r2)}
      },
      "checks":checks,
      "cohort":{"count":len(records),"queries":queries},
      "closure":{
        "governedSpatialSelectionAndMapFocusLifecycleClosed":passed,
        "sourceContractParityCertified":passed,
        "liveCausalSpatialSelectionCertified":passed,
        "exactTenMapVisibilityCertified":passed,
        "exactTenFocusSignalCertified":passed,
        "downstreamMapContinuityCertified":passed,
        "sessionCleanupArtifactClassified":passed
      },
      "nextBoundary":{
        "state":"BN5_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN5_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to the next bounded Explorer 4.0 downstream consumer phase; do not reopen BN2/BN3/BN4/BN5 without contradictory evidence." if passed else "Resolve failed BN5 closure preconditions before advancing."
      }
    }

    outfile=out/"governed_spatial_selection_map_focus_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN SPATIAL/FOCUS OUTCOMES -----")
    for i,x in enumerate(records,1):
        print(f"{i:02d}. {x.get('query')} -> {'CERTIFIED' if x.get('causalSpatialSelectionAndFocusCertified') else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
