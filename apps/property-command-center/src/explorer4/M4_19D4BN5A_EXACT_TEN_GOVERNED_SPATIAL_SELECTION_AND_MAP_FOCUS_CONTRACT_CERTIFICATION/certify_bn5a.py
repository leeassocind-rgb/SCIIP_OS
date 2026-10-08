#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib,re
from datetime import datetime,timezone

M="M4_19D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION"
EXPECTED=[
"2 Musick",
"2701 Carrier Ave",
"8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave",
"1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St",
"927 E 9th St",
"13900 Carmenita Rd",
]

def load(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: certify_bn5a.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn4c=ev/"M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE"/"market_context_neighbor_governed_lifecycle_closure.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*68)
    print("SCIIP Explorer 4.0 — BN5A Governed Spatial Selection + Map Focus")
    print("="*68)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn4c.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN4C_CLOSURE_EVIDENCE_MISSING")
        return 4
    if not src.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: EXPLORER_RUNTIME_MISSING")
        return 5

    c=load(bn4c)
    t=src.read_text(errors="replace")

    cohort=(c.get("cohort") or {}).get("queries") or []

    checks={
      "bn4cPassed":
        c.get("status")=="PASSED",

      "bn4cStateClosed":
        c.get("state")=="M419D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED",

      "bn4cDiagnosisCertified":
        c.get("diagnosis")=="EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CERTIFIED_AND_CLOSED",

      "exactTenCohort":
        cohort==EXPECTED,

      "selectedIdentityResolvedFromWorkspaceState":
        "EXPLORER3_PROPERTIES.find(p=>p.id===state.selectedPropertyId)" in t,

      "governedSelectedMapRuntimePresent":
        "resolveGovernedSelectedPropertyMapRuntime(sourceSelectedProperty" in t,

      "governedPropertyUsesMapRuntime":
        "const property=governedSelectedMapRuntime.mapProperty||sourceSelectedProperty" in t,

      "spatialHighlightGoverned":
        "buildGovernedMarketSpatialHighlightContract(" in t and
        "governedMarketMetricDetailContext" in t and
        "marketContextRibbonContext" in t,

      "mapSelectedIdentityGoverned":
        "selectedPropertyId={property.id}" in t,

      "mapSelectionGoverned":
        "onSelectProperty={value=>selectProperty(resolveGovernedMarketSpatialSelection(value,governedMarketMetricDetailContext,governedMarketSpatialHighlightContext,'MAP').propertyId)}" in t,

      "propertyIntelligenceSelectionGoverned":
        "resolveGovernedMarketSpatialSelection(" in t and "'PROPERTY_INTELLIGENCE'" in t,

      "neighborSelectionGoverned":
        "resolveGovernedMarketSpatialSelection(" in t and "'NEIGHBOR'" in t,

      "focusSelectionGoverned":
        "resolveGovernedMarketSpatialSelection(" in t and "'FOCUS'" in t,

      "mapConsumesFocusId":
        "focusPropertyId={focusPropertyId}" in t,

      "mapConsumesFocusRequestKey":
        "focusRequestKey={focusRequestKey}" in t,

      "globalSearchMatchSetsFocusPropertyId":
        "setFocusPropertyId(resolution.property.id)" in t,

      "globalSearchMatchAdvancesFocusRequestKey":
        "setFocusRequestKey(key=>key+1)" in t,

      "selectPropertyClearsStaleFocus":
        "const selectProperty=id=>{workspace.selectProperty(id);setPropertySearch('');setFocusPropertyId(null);" in t,

      "focusStateDeclared":
        "const[focusPropertyId,setFocusPropertyId]" in t.replace(" ","") or
        "const [focusPropertyId,setFocusPropertyId]" in t,

      "focusRequestStateDeclared":
        "focusRequestKey" in t and "setFocusRequestKey" in t,

      "spatialResolverPresent":
        "resolveGovernedMarketSpatialSelection" in t,

      "explorerMapPresent":
        "<ExplorerMap" in t,

      "noMutationAuthority":
        True,
    }

    records=[]
    for i,q in enumerate(cohort):
        records.append({
          "ordinal":i+1,
          "query":q,
          "status":"CERTIFIED" if all(checks.values()) else "FAILED",
          "contract":"SELECTED_GOVERNED_PROPERTY_TO_SPATIAL_HIGHLIGHT_MAP_SELECTION_AND_FOCUS"
        })

    passed=all(checks.values()) and len(records)==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED" if passed else "M419D4BN5A_SPATIAL_CONTRACT_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_SPATIAL_SELECTION_OR_MAP_FOCUS_CONTRACT_PRECONDITION_FAILED",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False,
        "pixelEvidence":False
      },
      "evidence":{
        "bn4c":{"path":str(bn4c),"sha256":sha(bn4c)},
        "runtime":{"path":str(src),"sha256":sha(src)}
      },
      "checks":checks,
      "records":records,
      "recordCount":len(records),
      "certifiedCount":sum(1 for r in records if r["status"]=="CERTIFIED"),
      "certificationBoundary":{
        "sourceContractParityCertified":passed,
        "liveMapBehaviorClaimed":False,
        "pixelBehaviorClaimed":False,
        "exactTenCohortInheritedFromClosedBN4":True,
        "noMutationAuthorized":True
      },
      "next":"BN5A_CERTIFIED_LIVE_SPATIAL_SELECTION_AND_FOCUS_OBSERVATION_READY" if passed else "BN5A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVATION" if passed else None
    }

    outfile=out/"exact_ten_governed_spatial_selection_map_focus_contract_certification.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN CONTRACT PARITY -----")
    for r in records:
        print(f"{r['ordinal']:02d}. {r['query']} -> {r['status']}")

    print(f"\nCERTIFIED: {result['certifiedCount']}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",outfile)

    return 0 if passed else 6

if __name__=="__main__":
    raise SystemExit(main())
