#!/usr/bin/env python3
from pathlib import Path
import json,re,hashlib,sys
from datetime import datetime,timezone

M="M4_19D4BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSAL_RECONCILIATION"

def find(root,name):
    xs=list(root.rglob(name))
    return xs[0] if xs else None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn5a=ev/"M4_19D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION"/"exact_ten_governed_spatial_selection_map_focus_contract_certification.json"
    bn5b=ev/"M4_19D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVATION"/"exact_ten_live_governed_spatial_selection_map_focus_observation.json"
    r4=ev/"M4_19D4BN2_R7E_R4_R2_R4_GLOBAL_SEARCH_RUNTIME_CAUSAL_CERTIFICATION"/"global_search_runtime_causal_certification.json"

    missing=[str(p) for p in [bn5a,bn5b] if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING");print("\n".join(missing));return 4

    a=json.loads(bn5a.read_text()); b=json.loads(bn5b.read_text())
    r=json.loads(r4.read_text()) if r4.is_file() else {}

    explorer=find(app/"src","Explorer3.jsx")
    if not explorer:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_RUNTIME_SOURCE_NOT_FOUND");return 5
    src=explorer.read_text(errors="replace")

    # Source-level causal contract.
    has_listener="sciip:global-property-search" in src
    has_pending_read="sessionStorage.getItem('sciip.globalSearchQuery')" in src or 'sessionStorage.getItem("sciip.globalSearchQuery")' in src
    has_remove="sessionStorage.removeItem('sciip.globalSearchQuery')" in src or 'sessionStorage.removeItem("sciip.globalSearchQuery")' in src
    has_resolver="resolveGlobalPropertySearch" in src
    has_match=re.search(r"resolution\.status\s*===\s*['\"]MATCH['\"]",src) is not None
    has_select="selectProperty(resolution.property.id)" in src
    has_focus="setFocusPropertyId(resolution.property.id)" in src
    has_focus_key="setFocusRequestKey" in src

    records=b.get("records",[])
    exact10=len(records)==10
    all_controlled=exact10 and all(x.get("controlledValueMatch") is True for x in records)
    all_explorer=exact10 and all((x.get("pre") or {}).get("explorer") is True for x in records)
    all_map=exact10 and all((x.get("pre") or {}).get("mapVisible") is True for x in records)
    all_focuslike=exact10 and all(x.get("focusLikeSignalObserved") is True for x in records)
    all_prop=exact10 and all((x.get("property") or {}).get("drawerVisible") is True for x in records)
    all_neigh=exact10 and all((x.get("neighbors") or {}).get("drawerVisible") is True for x in records)
    all_map_after=exact10 and all((x.get("neighbors") or {}).get("mapVisible") is True for x in records)
    all_session_residual=exact10 and all((x.get("pre") or {}).get("sessionQuery")==x.get("query") for x in records)

    # Critical distinction: residual session value alone cannot disprove spatial focus.
    # But it also cannot be waived as success without proving the handoff's causal path.
    source_contract=all([has_listener,has_pending_read,has_remove,has_resolver,has_match,has_select,has_focus,has_focus_key])
    prior_r4_passed=(r.get("status")=="PASSED") if r else False

    diagnosis = (
      "RESIDUAL_SEARCH_SESSION_VALUE_IS_HANDOFF_CLEANUP_GAP_NOT_SPATIAL_SELECTION_FAILURE"
      if source_contract and all_controlled and all_explorer and all_map and all_focuslike and all_prop and all_neigh and all_map_after
      else "SEARCH_SESSION_HANDOFF_CAUSAL_GAP_REMAINS"
    )
    passed=diagnosis.startswith("RESIDUAL_")

    result={
      "framework":"SCIIP_EXPLORER_4_BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSAL_RECONCILIATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN5B_R1_SEARCH_SESSION_HANDOFF_CAUSALLY_RECONCILED" if passed else "M419D4BN5B_R1_RECONCILIATION_INCOMPLETE",
      "diagnosis":diagnosis,
      "checks":{
        "bn5aPassed":a.get("status")=="PASSED",
        "bn5bExactTen":exact10,
        "allControlledValueMatch":all_controlled,
        "allExplorerMounted":all_explorer,
        "allMapsVisible":all_map,
        "allFocusLikeSignalsObserved":all_focuslike,
        "allPropertyDrawersVisible":all_prop,
        "allNeighborDrawersVisible":all_neigh,
        "allMapsVisibleAfterNeighbors":all_map_after,
        "allSessionValuesResidual":all_session_residual,
        "globalSearchListenerPresent":has_listener,
        "pendingSessionReadPresent":has_pending_read,
        "matchSessionRemovalPresent":has_remove,
        "resolverPresent":has_resolver,
        "matchBranchPresent":has_match,
        "matchSelectsProperty":has_select,
        "matchSetsFocusPropertyId":has_focus,
        "matchAdvancesFocusRequestKey":has_focus_key,
        "priorR4RuntimeCausalCertificationPassed":prior_r4_passed
      },
      "interpretation":{
        "bn5bSpatialEvidence":"POSITIVE" if all_map and all_focuslike and all_map_after else "INCOMPLETE",
        "sessionHandoffCleanup":"RESIDUAL_VALUE_OBSERVED" if all_session_residual else "MIXED",
        "closureRule":"Do not mutate application source in R1. Recertify live with causal selection proof that does not incorrectly require sessionStorage absence as a spatial-focus prerequisite."
      },
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "next":"BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION_READY" if passed else "BN5B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN5B_R2_LIVE_CAUSAL_SPATIAL_SELECTION_AND_MAP_FOCUS_RECERTIFICATION" if passed else None,
      "source":{"explorer":str(explorer),"sha256":hashlib.sha256(explorer.read_bytes()).hexdigest()}
    }
    f=out/"search_session_handoff_causal_reconciliation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*70)
    print("SCIIP Explorer 4.0 — BN5B-R1 Search Session Handoff Causal Reconciliation")
    print("="*70)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("\n----- RECONCILIATION CHECKS -----")
    for k,v in result["checks"].items(): print(f"{k}: {v}")
    print("\n----- INTERPRETATION -----")
    for k,v in result["interpretation"].items(): print(f"{k}: {v}")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0
if __name__=="__main__": raise SystemExit(main())
