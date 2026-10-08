#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN3A_EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_PARITY_CERTIFICATION"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]
def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2: return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    bn3=ev/"M4_19D4BN3_POST_BN2_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_bn2_next_phase_readiness.json"
    live=ev/"M4_19D4BN2_R7E_R4_R5_R1_CDP_TARGET_BOOTSTRAP_AND_EXACT_TEN_LIVE_RECERTIFICATION"/"exact_ten_live_recertification.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    print("============================================================")
    print("SCIIP Explorer 4.0 — BN3A Exact-Ten Post-Selection Parity")
    print("============================================================")
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn3,live,src) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_EVIDENCE_OR_RUNTIME_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    b=load(bn3); l=load(live); t=src.read_text(errors="replace")
    rec=l.get("records") or []
    queries=[r.get("query") for r in rec]
    source_checks={
      "bn3Passed":b.get("status")=="PASSED",
      "bn3DecisionCorrect":b.get("diagnosis")=="POST_SELECTION_PROPERTY_DETAIL_PARITY_CERTIFICATION_READY",
      "exactTenPriorLivePassed":l.get("status")=="PASSED" and queries==EXPECTED and len(rec)==10,
      "selectedIdentityResolution":"EXPLORER3_PROPERTIES.find(p=>p.id===state.selectedPropertyId)" in t,
      "governedMapResolution":"resolveGovernedSelectedPropertyMapRuntime(sourceSelectedProperty" in t,
      "propertyUsesGovernedMap":"const property=governedSelectedMapRuntime.mapProperty||sourceSelectedProperty" in t,
      "propertyIntelligenceSelection":"resolveGovernedPropertyIntelligenceSelection({" in t,
      "propertyIntelligenceSelectedProperty":"selectedProperty:property" in t,
      "mapSelectedId":"selectedPropertyId={property.id}" in t,
      "drawerConsumesProperty":"<ContextDrawer" in t and "property={property}" in t,
      "drawerConsumesIntelligence":"propertyIntelligenceProperty={propertyIntelligenceProperty}" in t,
      "drawerConsumesPresentation":"propertyIntelligencePresentation={governedPropertyIntelligencePresentation}" in t,
      "mapSelectionGoverned":"resolveGovernedMarketSpatialSelection(value" in t,
    }

    # This milestone certifies the deterministic source contract plus the exact-ten live
    # selection cohort already observed. It intentionally does not claim pixel equality.
    per_record=[]
    for r in rec:
        per_record.append({
          "query":r.get("query"),
          "priorLiveOutcome":r.get("outcome"),
          "controlledValueMatch":r.get("controlledValueMatch"),
          "explorerMounted":(r.get("snapshot") or {}).get("explorer"),
          "postSelectionContract":{
             "workspaceSelectionToSourceIdentity":source_checks["selectedIdentityResolution"],
             "sourceIdentityToGovernedMapProperty":source_checks["governedMapResolution"] and source_checks["propertyUsesGovernedMap"],
             "governedPropertyToMapSelectedId":source_checks["mapSelectedId"],
             "governedPropertyToPropertyIntelligence":source_checks["propertyIntelligenceSelection"] and source_checks["propertyIntelligenceSelectedProperty"],
             "governedPropertyToContextDrawer":source_checks["drawerConsumesProperty"],
             "governedIntelligenceToContextDrawer":source_checks["drawerConsumesIntelligence"] and source_checks["drawerConsumesPresentation"],
          }
        })

    record_checks=[
      r["priorLiveOutcome"]=="MATCH_AUTO_SELECTED_OR_POST_VISIBLE" and
      r["controlledValueMatch"] is True and r["explorerMounted"] is True and
      all(r["postSelectionContract"].values())
      for r in per_record
    ]
    passed=all(source_checks.values()) and len(record_checks)==10 and all(record_checks)

    result={
      "framework":"SCIIP_EXPLORER_4_BN3A_EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_PARITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN3A_EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN3A_POST_SELECTION_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "POST_SELECTION_PROPERTY_DETAIL_OR_CONSUMER_PARITY_PRECONDITION_FAILED",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"canonicalWriteAuthority":False,"identityWriteAuthority":False,"temporalWriteAuthority":False,"propagationAuthority":False,"networkAuthority":False},
      "source":{"path":str(src),"sha256":sha(src)},
      "sourceChecks":source_checks,
      "records":per_record,
      "recordPassCount":sum(record_checks),
      "recordCount":len(record_checks),
      "certificationBoundary":{
        "pixelEqualityClaimed":False,
        "runtimeContractParityCertified":passed,
        "exactTenSelectionCohortInheritedFromLiveBN2":True,
        "noMutationAuthorized":True
      },
      "nextBoundary":{
        "state":"BN3A_CERTIFIED_NEXT_POST_SELECTION_LIVE_CONSUMER_OBSERVATION_READY" if passed else "BN3A_REMAINS_OPEN",
        "recommendedNextMilestone":"M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION" if passed else None
      }
    }
    outfile=out/"exact_ten_post_selection_parity_certification.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in source_checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN CONTRACT PARITY -----")
    for i,(r,ok) in enumerate(zip(per_record,record_checks),1):
        print(f"{i:02d}. {r['query']} -> {'CERTIFIED' if ok else 'FAILED'}")
    print(f"\nCERTIFIED: {sum(record_checks)}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("NEXT_MILESTONE:",result["nextBoundary"]["recommendedNextMilestone"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
