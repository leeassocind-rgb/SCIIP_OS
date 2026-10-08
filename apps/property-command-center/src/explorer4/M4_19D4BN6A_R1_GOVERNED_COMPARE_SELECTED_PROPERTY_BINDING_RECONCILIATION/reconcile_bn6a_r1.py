#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re

M="M4_19D4BN6A_R1_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_RECONCILIATION"
COHORT=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def line_window(text, needle, radius=5):
    lines=text.splitlines()
    for i,l in enumerate(lines):
        if needle in l:
            a=max(0,i-radius); b=min(len(lines),i+radius+1)
            return {
                "needle":needle,
                "line":i+1,
                "startLine":a+1,
                "endLine":b,
                "text":"\n".join(f"{j+1:5}: {lines[j]}" for j in range(a,b))
            }
    return None

def main():
    if len(sys.argv)!=2:
        print("usage: reconcile_bn6a_r1.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M; out.mkdir(parents=True,exist_ok=True)

    bn6=ev/"M4_19D4BN6_POST_BN5_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_bn5_next_phase_readiness.json"
    bn6a=ev/"M4_19D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_compare_consumer_parity_certification.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*76)
    print("SCIIP Explorer 4.0 — BN6A-R1 Compare Selected-Property Binding Reconciliation")
    print("="*76)
    print("Mode: READ_ONLY_SOURCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn6,bn6a,src) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_OR_RUNTIME_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    b6=load(bn6); a0=load(bn6a); t=src.read_text(errors="replace")

    # Resolve actual assignment identifier for the governed selected map runtime.
    # Accept only an assignment whose RHS calls the certified resolver.
    m_runtime=re.search(
        r"const\s+([A-Za-z_$][\w$]*)\s*=\s*resolveGovernedSelectedPropertyMapRuntime\s*\(\s*sourceSelectedProperty",
        t
    )
    runtime_var=m_runtime.group(1) if m_runtime else None

    # Resolve actual selected property binding. Require the same runtime variable's
    # mapProperty to be primary with sourceSelectedProperty as explicit fallback.
    property_binding=False
    property_binding_text=None
    if runtime_var:
        pat=(
          r"const\s+property\s*=\s*"
          + re.escape(runtime_var)
          + r"\.mapProperty\s*\|\|\s*sourceSelectedProperty"
        )
        m_prop=re.search(pat,t)
        property_binding=bool(m_prop)
        property_binding_text=m_prop.group(0) if m_prop else None

    # Compare must consume property.id, not sourceSelectedProperty.id or an unrelated id.
    compare_toggle="toggleCompare(property.id)" in t
    compare_action=(
        "action==='compare'" in t or
        'action==="compare"' in t
    )
    action_routes_compare=bool(re.search(
        r"(?:if|else\s+if)\s*\(\s*action\s*===\s*['\"]compare['\"]\s*\)\s*workspace\.toggleCompare\(property\.id\)",
        t
    )) or ("else if(action==='compare')workspace.toggleCompare(property.id)" in t)

    compare_dock="CompareDock" in t

    # Ensure the property binding occurs before compare action in source.
    idx_prop=t.find(property_binding_text) if property_binding_text else -1
    idx_toggle=t.find("toggleCompare(property.id)")
    causal_order=idx_prop>=0 and idx_toggle>idx_prop

    checks={
      "bn6Passed":b6.get("status")=="PASSED",
      "bn6DecisionCorrect":b6.get("diagnosis")=="POST_SELECTION_COMPARE_CONSUMER_PARITY_CERTIFICATION_READY",
      "bn6aBlockedOnlyByBindingProbe":
        a0.get("status")=="BLOCKED"
        and (a0.get("checks") or {}).get("governedPropertyUsesMapRuntime") is False
        and all(v is True for k,v in (a0.get("checks") or {}).items() if k!="governedPropertyUsesMapRuntime"),
      "selectedIdentityResolvedFromWorkspaceState":
        "EXPLORER3_PROPERTIES.find(p=>p.id===state.selectedPropertyId)" in t,
      "governedSelectedMapResolverCallResolved":bool(m_runtime),
      "actualGovernedSelectedMapRuntimeVariableResolved":bool(runtime_var),
      "propertyUsesActualGovernedMapRuntime":property_binding,
      "propertyFallbackIsSourceSelectedProperty":property_binding,
      "compareToggleUsesPropertyId":compare_toggle,
      "compareActionPresent":compare_action,
      "compareActionRoutesSelectedPropertyId":action_routes_compare,
      "compareDockPresent":compare_dock,
      "governedPropertyBindingPrecedesCompareConsumption":causal_order,
      "noMutationAuthority":True
    }

    passed=all(checks.values())
    exact=[
      {
        "ordinal":i+1,
        "query":q,
        "status":"CERTIFIED" if passed else "NOT_CERTIFIED",
        "contract":"WORKSPACE_SELECTION_TO_GOVERNED_MAP_PROPERTY_TO_COMPARE_PROPERTY_ID"
      }
      for i,q in enumerate(COHORT)
    ]

    evidence_windows=[]
    for needle in [
        "resolveGovernedSelectedPropertyMapRuntime",
        property_binding_text or "const property=",
        "toggleCompare(property.id)",
        "CompareDock"
    ]:
        w=line_window(t,needle)
        if w: evidence_windows.append(w)

    diagnosis=(
        "BN6A_BINDING_PROBE_IDENTIFIER_MISMATCH_RECONCILED_COMPARE_CONTRACT_CERTIFIED"
        if passed else
        "GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_GAP_REMAINS"
    )

    result={
      "framework":"SCIIP_EXPLORER_4_BN6A_R1_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_RECONCILIATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED" if passed else "M419D4BN6A_R1_BINDING_NOT_CERTIFIED",
      "diagnosis":diagnosis,
      "mode":"READ_ONLY_SOURCE_RECONCILIATION",
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
      "resolvedBinding":{
        "runtimeVariable":runtime_var,
        "propertyBinding":property_binding_text,
        "compareConsumer":"toggleCompare(property.id)" if compare_toggle else None
      },
      "checks":checks,
      "exactTen":exact,
      "certifiedCount":10 if passed else 0,
      "sourceWindows":evidence_windows,
      "runtime":{"path":str(src),"sha256":sha(src)},
      "next":"BN6A_CERTIFIED_LIVE_COMPARE_CONSUMER_OBSERVATION_READY" if passed else "BN6A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVATION" if passed else None
    }

    outfile=out/"governed_compare_selected_property_binding_reconciliation.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- BINDING RECONCILIATION -----")
    print("actualRuntimeVariable:",runtime_var)
    print("propertyBinding:",property_binding_text)
    print("compareConsumer:","toggleCompare(property.id)" if compare_toggle else None)

    print("\n----- RECONCILIATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- EXACT-TEN COMPARE PARITY -----")
    for r in exact:
        print(f'{r["ordinal"]:02}. {r["query"]} -> {r["status"]}')

    print(f"\nCERTIFIED: {10 if passed else 0}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 6

if __name__=="__main__":
    raise SystemExit(main())
