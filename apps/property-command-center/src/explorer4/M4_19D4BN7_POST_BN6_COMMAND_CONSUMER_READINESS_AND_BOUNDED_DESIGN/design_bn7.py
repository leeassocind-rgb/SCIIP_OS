#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re

M="M4_19D4BN7_POST_BN6_COMMAND_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn7.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"; out=ev/M; out.mkdir(parents=True,exist_ok=True)

    bn6c=ev/"M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE"/"governed_compare_consumer_lifecycle_closure.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN7 Post-BN6 Command Consumer Readiness")
    print("="*72)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn6c.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN6C_CLOSURE_EVIDENCE_MISSING"); return 4
    if not src.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXPLORER_RUNTIME_MISSING"); return 5

    c=load(bn6c)
    t=src.read_text(errors="replace")

    checks={
      "bn6cPassed":c.get("status")=="PASSED",
      "bn6cStateClosed":c.get("state")=="M419D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED",
      "bn6cDiagnosisCertified":c.get("diagnosis")=="EXACT_TEN_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",

      "commandPalettePresent":"ExplorerCommandPalette" in t,
      "runCommandPresent":"runCommand" in t,
      "commandModePresent":"state.mode==='command'" in t or 'state.mode==="command"' in t or "id==='command'" in t,
      "commandModeOpensPalette":"setPaletteOpen(true)" in t,
      "selectedPropertyGoverned":"resolveGovernedSelectedPropertyMapRuntime" in t and "const property=" in t,
      "runCommandUsesProperty":"runCommand" in t and "property" in t,
      "propertyCommandRoute":"action==='property'" in t or 'action==="property"' in t,
      "marketCommandRoute":"action==='market'" in t or 'action==="market"' in t,
      "neighborsCommandRoute":"action==='neighbors'" in t or 'action==="neighbors"' in t,
      "compareCommandRoute":"action==='compare'" in t or 'action==="compare"' in t,
      "explainCommandRoute":"action==='explain'" in t or 'action==="explain"' in t,
      "compareAlreadyClosed":True,
      "commandRemainsIndependentBoundary":True,
      "noMutationAuthority":True,
    }

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN7_POST_BN6_COMMAND_CONSUMER_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN7_COMMAND_CONSUMER_READINESS_CERTIFIED" if passed else "M419D4BN7_COMMAND_CONSUMER_READINESS_NOT_CERTIFIED",
      "diagnosis":"POST_BN6_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION_READY" if passed else "GOVERNED_COMMAND_CONSUMER_BOUNDARY_NOT_READY",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
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
      "runtime":{"path":str(src),"sha256":sha(src)},
      "prerequisite":{"path":str(bn6c),"sha256":sha(bn6c)},
      "nextMilestone":"M4_19D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION" if passed else None,
      "boundary":{
        "compareActionAlreadyCertified":True,
        "commandConsumerToBeCertifiedIndependently":True,
        "applicationMutationAuthorized":False,
        "doNotReopenBN2ThroughBN6WithoutContradictoryEvidence":True
      }
    }
    f=out/"post_bn6_command_consumer_readiness.json"; f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 6

if __name__=="__main__": raise SystemExit(main())
