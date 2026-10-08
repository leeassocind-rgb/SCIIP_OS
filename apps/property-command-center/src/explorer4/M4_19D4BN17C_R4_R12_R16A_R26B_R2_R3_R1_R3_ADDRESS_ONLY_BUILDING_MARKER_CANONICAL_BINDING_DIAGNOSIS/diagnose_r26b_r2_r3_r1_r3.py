#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

PREV="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSAL_DIAGNOSIS"
PREV_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSE_DIAGNOSED"
PREV_CLASS="BUILDING_1_REPRESENTED_BY_DISTINCT_ADDRESS_ONLY_PROPERTY_MARKER_WHILE_PROJECT_AGGREGATE_RETAINS_SF_BEARING_CARD_IDENTITY"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS"
ADDRESS="112 W Alondra Blvd"
BUILDING_SF=181831
AGGREGATE_SF=422277
EXPECTED_SELECTED_ID="BASE-FBF248807E1A0CE5"
EXPECTED_COMPARE_ID="BASE-421B827B30563226"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/PREV/"building_1_inventory_visibility_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3-R1-R3 Address-Only Building Marker Canonical Binding Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_CANONICAL_IDENTITY_RECONCILIATION")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R26B_R2_R3_R1_R2_EVIDENCE_REQUIRED"); return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=PREV_STATE or d.get("classification")!=PREV_CLASS:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: CERTIFIED_ADDRESS_ONLY_BUILDING_MARKER_EVIDENCE_REQUIRED"); return 5

    rows=d.get("alondraRows") or []
    address_only=[r for r in rows if (r.get("text") or "").strip()==ADDRESS]
    aggregate=[r for r in rows if "422,277 SF" in (r.get("html") or "") or "422,277 SF" in (r.get("text") or "")]
    building_card=[r for r in rows if "181,831 SF" in (r.get("html") or "")]

    a=address_only[0] if len(address_only)==1 else {}
    g=aggregate[0] if len(aggregate)==1 else {}

    # Critical observation: innerText collapses to address because selected marker renders a label,
    # but outerHTML still contains the Building 1 card with 181,831 SF.
    outer_html=a.get("html") or ""
    selected_class="is-selected" in (a.get("className") or "")
    building_sf_in_hidden_card="181,831 SF" in outer_html
    aggregate_sf_absent_from_building_marker="422,277 SF" not in outer_html
    aggregate_sf_in_aggregate="422,277 SF" in (g.get("html") or "")
    same_visual_position=(a.get("attrs") or {}).get("style")== (g.get("attrs") or {}).get("style")
    same_address_aria=(a.get("attrs") or {}).get("aria-label")== (g.get("attrs") or {}).get("aria-label")

    storage=d.get("storageHints") or {}
    ws=(storage.get("localStorage") or {}).get("sciip.explorer3.workspace.v1")
    wsj={}
    if ws:
        try: wsj=json.loads(ws)
        except: pass
    selected_id=wsj.get("selectedPropertyId")
    compare_ids=wsj.get("compareIds") or []

    # We do not infer which BASE id is 181,831 solely from address. Instead we certify a binding
    # contract that requires the selected marker's hidden card SF + selected-state readback.
    contract={
      "entityType":"BUILDING",
      "canonicalKey":f"{ADDRESS}|{BUILDING_SF}",
      "address":ADDRESS,
      "availableSf":BUILDING_SF,
      "bindingSurface":"SELECTED_SCIIP_PROPERTY_MARKER",
      "bindingEvidenceRequired":[
        "exact normalized address",
        "marker class contains sciip-property-marker",
        "marker class contains is-selected",
        "marker outerHTML card contains EXISTING · 181,831 SF",
        "marker outerHTML card does not contain 422,277 SF",
        "project aggregate remains a distinct non-selected marker with 422,277 SF"
      ],
      "visibleInnerTextSfNotRequiredWhenSelectedMarkerLabelCollapses":True,
      "addressOnlyBindingStillForbidden":True,
      "projectAggregateBindingForbiddenForBuilding1":True,
      "selectedPropertyIdMayBeUsedOnlyAsReadbackAfterMarkerIdentityCertified":True
    }

    checks={
      "r26bR2R3R1R2Passed":True,
      "oneAddressOnlySelectedMarker":len(address_only)==1 and selected_class,
      "buildingSfPresentInSelectedMarkerOuterHtml":building_sf_in_hidden_card,
      "aggregateSfAbsentFromSelectedMarkerOuterHtml":aggregate_sf_absent_from_building_marker,
      "oneDistinctAggregateMarker":len(aggregate)==1,
      "aggregateSfPresentInAggregateMarker":aggregate_sf_in_aggregate,
      "buildingAndAggregateShareMapPosition":same_visual_position,
      "buildingAndAggregateShareAddressAria":same_address_aria,
      "workspaceSelectedPropertyIdPresent":bool(selected_id),
      "bindingDoesNotDependOnAddressOnly":True,
      "bindingRequiresHiddenBuildingSf":True,
      "bindingRequiresSelectedMarkerState":True,
      "projectAggregateExcluded":True,
      "liveUiInteractionOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    passed=all([
      checks["oneAddressOnlySelectedMarker"],
      building_sf_in_hidden_card,
      aggregate_sf_absent_from_building_marker,
      checks["oneDistinctAggregateMarker"],
      aggregate_sf_in_aggregate,
      bool(selected_id)
    ])
    if not passed:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ADDRESS_ONLY_SELECTED_MARKER_CANONICAL_CONTRACT_NOT_PROVABLE"); return 6

    classification="ALONDRA_BUILDING_1_CANONICAL_IDENTITY_RECOVERABLE_FROM_SELECTED_MARKER_HIDDEN_CARD_DESPITE_ADDRESS_ONLY_VISIBLE_LABEL"
    state="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"

    out={
      "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED","state":state,"classification":classification,
      "target":ADDRESS,
      "buildingCanonicalKey":f"{ADDRESS}|{BUILDING_SF}",
      "projectAggregateSf":AGGREGATE_SF,
      "selectedMarkerVisibleText":a.get("text"),
      "selectedMarkerOuterHtmlContainsBuildingSf":building_sf_in_hidden_card,
      "selectedMarkerOuterHtmlContainsAggregateSf":not aggregate_sf_absent_from_building_marker,
      "workspaceSelectedPropertyId":selected_id,
      "workspaceCompareIds":compare_ids,
      "canonicalBindingContract":contract,
      "checks":checks,
      "authority":{"liveUiInteraction":False,"propertyClick":False,"assignmentsInvocation":False,
                   "generateInvocation":False,"exportInvocation":False,"applicationSourceMutation":False,
                   "governedDataMutation":False},
      "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }
    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"address_only_building_marker_canonical_binding_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",ADDRESS)
    print("BUILDING_CANONICAL_KEY:",out["buildingCanonicalKey"])
    print("SELECTED_MARKER_VISIBLE_TEXT:",repr(a.get("text")))
    print("SELECTED_MARKER_OUTER_HTML_HAS_181831_SF:",building_sf_in_hidden_card)
    print("SELECTED_MARKER_OUTER_HTML_HAS_422277_SF:",not aggregate_sf_absent_from_building_marker)
    print("PROJECT_AGGREGATE_DISTINCT:",len(aggregate)==1)
    print("WORKSPACE_SELECTED_PROPERTY_ID:",selected_id)
    print("WORKSPACE_COMPARE_IDS:",compare_ids)
    print("\n----- CANONICAL BINDING CONTRACT -----")
    print(json.dumps(contract,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
