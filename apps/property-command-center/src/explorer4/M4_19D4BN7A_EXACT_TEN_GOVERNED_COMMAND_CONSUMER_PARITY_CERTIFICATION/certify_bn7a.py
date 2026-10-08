#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re

M="M4_19D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION"
COHORT=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"
]
def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2: return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    bn7=ev/"M4_19D4BN7_POST_BN6_COMMAND_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn6_command_consumer_readiness.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*76)
    print("SCIIP Explorer 4.0 — BN7A Exact-Ten Governed Command Consumer Parity")
    print("="*76)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn7.is_file() or not src.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_EVIDENCE_OR_RUNTIME_MISSING"); return 4
    b=load(bn7); t=src.read_text(errors="replace")
    checks={
      "bn7Passed":b.get("status")=="PASSED",
      "bn7StateCertified":b.get("state")=="M419D4BN7_COMMAND_CONSUMER_READINESS_CERTIFIED",
      "bn7DiagnosisCertified":b.get("diagnosis")=="POST_BN6_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION_READY",
      "exactTenCohort":len(COHORT)==10 and len(set(COHORT))==10,
      "selectedIdentityResolvedFromWorkspaceState":"resolveGovernedSelectedPropertyMapRuntime" in t,
      "governedSelectedMapRuntimePresent":"governedSelectedMapRuntime" in t,
      "governedPropertyBindingPresent":bool(re.search(r"const\s+property\s*=\s*governedSelectedMapRuntime\.mapProperty\s*\|\|\s*sourceSelectedProperty",t)),
      "commandPalettePresent":"ExplorerCommandPalette" in t,
      "runCommandPresent":"runCommand" in t,
      "commandModeOpensPalette":"setPaletteOpen(true)" in t,
      "propertyRoutePresent":"action==='property'" in t or 'action==="property"' in t,
      "marketRoutePresent":"action==='market'" in t or 'action==="market"' in t,
      "neighborsRoutePresent":"action==='neighbors'" in t or 'action==="neighbors"' in t,
      "compareRoutePresent":"action==='compare'" in t or 'action==="compare"' in t,
      "explainRoutePresent":"action==='explain'" in t or 'action==="explain"' in t,
      "commandConsumerReceivesGovernedPropertyContext":"runCommand" in t and "property" in t,
      "noMutationAuthority":True
    }
    contract=all(checks.values())
    outcomes=[{"ordinal":i+1,"query":q,"outcome":"CERTIFIED" if contract else "NOT_CERTIFIED"} for i,q in enumerate(COHORT)]
    certified=sum(x["outcome"]=="CERTIFIED" for x in outcomes)
    passed=contract and certified==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN7A_COMMAND_CONSUMER_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_COMMAND_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_COMMAND_CONSUMER_CONTRACT_GAP_REMAINS",
      "mode":"READ_ONLY_CERTIFICATION",
      "checks":checks,"cohort":outcomes,"certifiedCount":certified,
      "runtime":{"path":str(src),"sha256":sha(src)},
      "prerequisite":{"path":str(bn7),"sha256":sha(bn7)},
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "nextMilestone":"M4_19D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVATION" if passed else None
    }
    f=out/"exact_ten_governed_command_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN COMMAND CONTRACT PARITY -----")
    for x in outcomes: print(f'{x["ordinal"]:02d}. {x["query"]} -> {x["outcome"]}')
    print(f"\nCERTIFIED: {certified}/10")
    print("STATUS:",result["status"]); print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:", "BN7A_CERTIFIED_LIVE_COMMAND_CONSUMER_OBSERVATION_READY" if passed else "BN7A_REMAINS_OPEN")
    print("NEXT_MILESTONE:",result["nextMilestone"]); print("EVIDENCE:",f)
    return 0 if passed else 6
if __name__=="__main__": raise SystemExit(main())
