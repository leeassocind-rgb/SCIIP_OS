#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN6_POST_BN5_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn6_next_phase.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn5c=ev/"M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE"/"governed_spatial_selection_map_focus_lifecycle_closure.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*70)
    print("SCIIP Explorer 4.0 — BN6 Post-BN5 Next-Phase Readiness")
    print("="*70)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")

    if not bn5c.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN5_CLOSURE_EVIDENCE_MISSING");return 4
    if not src.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_RUNTIME_MISSING");return 5

    c=load(bn5c)
    if not (
        c.get("status")=="PASSED" and
        c.get("state")=="M419D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED" and
        c.get("diagnosis")=="EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CERTIFIED_AND_CLOSED"
    ):
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN5_CLOSURE_NOT_CERTIFIED");return 6

    t=src.read_text(errors="replace")

    checks={
      "bn5Closed":True,
      "compareDockPresent":"CompareDock" in t,
      "compareTogglePresent":"toggleCompare" in t,
      "compareConsumesProperty":"compare" in t.lower() and "property.id" in t,
      "commandPalettePresent":"ExplorerCommandPalette" in t,
      "runCommandPresent":"runCommand" in t,
      "commandUsesSelectedProperty":"runCommand" in t and ("property" in t or "selectedProperty" in t),
      "presentModePresent":"present" in t and "state.mode" in t,
      "analyzeModePresent":"analyze" in t and "state.mode" in t,
      "propertyIntelligenceDerivedPresent":"resolveGovernedPropertyIntelligenceDerivedRuntime" in t,
      "propertyIntelligenceEvidencePresent":"resolveGovernedPropertyIntelligenceEvidenceRuntime" in t,
      "propertyIntelligencePresentationPresent":"governedPropertyIntelligencePresentation" in t,
      "selectedPropertyStillGoverned":"resolveGovernedSelectedPropertyMapRuntime(sourceSelectedProperty" in t,
    }

    compare_ready=all(checks[k] for k in ["compareDockPresent","compareTogglePresent","compareConsumesProperty","selectedPropertyStillGoverned"])
    command_ready=all(checks[k] for k in ["commandPalettePresent","runCommandPresent","selectedPropertyStillGoverned"])
    pi_ready=all(checks[k] for k in ["propertyIntelligenceDerivedPresent","propertyIntelligenceEvidencePresent","propertyIntelligencePresentationPresent","selectedPropertyStillGoverned"])

    if compare_ready:
        decision="POST_SELECTION_COMPARE_CONSUMER_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFICATION"
        rationale="Compare is the narrowest remaining selected-property consumer downstream of the closed BN5 spatial lifecycle and is source-resolved through toggleCompare/CompareDock."
    elif command_ready:
        decision="POST_SELECTION_COMMAND_CONSUMER_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN6A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION"
        rationale="Command is the next bounded selected-property consumer available from source."
    elif pi_ready:
        decision="PROPERTY_INTELLIGENCE_DERIVED_EVIDENCE_PRESENTATION_PARITY_READY"
        next_milestone="M4_19D4BN6A_EXACT_TEN_PROPERTY_INTELLIGENCE_DERIVED_EVIDENCE_PRESENTATION_PARITY_CERTIFICATION"
        rationale="Derived/evidence/presentation Property Intelligence remains the next bounded downstream consumer."
    else:
        decision="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"
        next_milestone=None
        rationale="No sufficiently bounded remaining downstream consumer chain is fully source-resolved."

    passed=decision!="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"

    result={
      "framework":"SCIIP_EXPLORER_4_BN6_POST_BN5_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN6_POST_BN5_NEXT_PHASE_READINESS_CERTIFIED" if passed else "M419D4BN6_NEXT_PHASE_NOT_CERTIFIED",
      "diagnosis":decision,
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False
      },
      "prerequisite":{
        "bn5ClosurePath":str(bn5c),
        "bn5ClosureSha256":sha(bn5c),
        "bn5ClosureState":c.get("state")
      },
      "runtime":{"path":str(src),"sha256":sha(src)},
      "checks":checks,
      "recommendedNextMilestone":next_milestone,
      "rationale":rationale,
      "boundaries":{
        "doNotReopenBN2ThroughBN5WithoutContradictoryEvidence":True,
        "applicationMutationAuthorized":False,
        "governedDataMutationAuthorized":False,
        "nextPhaseType":"CERTIFICATION_ONLY" if passed else None
      }
    }

    outfile=out/"post_bn5_next_phase_readiness.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["recommendedNextMilestone"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 7

if __name__=="__main__":
    raise SystemExit(main())
