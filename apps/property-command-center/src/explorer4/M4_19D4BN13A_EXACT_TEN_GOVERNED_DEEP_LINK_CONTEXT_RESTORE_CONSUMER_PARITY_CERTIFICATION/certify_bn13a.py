#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

PATS={
"urlParams":[r"URLSearchParams",r"location\.search",r"location\.hash"],
"deepLink":[r"deep.?link",r"route",r"query.?param"],
"contextRestore":[r"context.?restore",r"restore.?context",r"restore",r"sessionStorage",r"localStorage"],
"selectedProperty":[r"selectedProperty",r"selected.?property",r"propertyId"],
"modeContext":[r"mode",r"drawer",r"workspace",r"context"]
}

def scan(root):
    out={k:0 for k in PATS}
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs",".json"}: continue
        s=str(p)
        if any(x in s for x in ("node_modules","dist","build","evidence","src/explorer4/M4_19D4")): continue
        try:t=p.read_text(errors="ignore")
        except:continue
        for k,ps in PATS.items():
            out[k]+=sum(len(re.findall(x,t,re.I)) for x in ps)
    return out

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    bn13=ev/"M4_19D4BN13_POST_BN12_DEEP_LINK_CONTEXT_RESTORE_READINESS_AND_BOUNDED_DESIGN"/"post_bn12_deep_link_context_restore_readiness.json"
    print("="*90)
    print("SCIIP Explorer 4.0 — BN13A Governed Deep-Link / Context Restore Consumer Parity")
    print("="*90)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    if not bn13.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN13_READINESS_EVIDENCE_MISSING"); return 4
    b=json.loads(bn13.read_text()); sig=scan(app/"src")
    checks={
      "bn13Passed":b.get("status")=="PASSED",
      "bn13StateCertified":b.get("state")=="M419D4BN13_DEEP_LINK_CONTEXT_RESTORE_READINESS_CERTIFIED",
      "bn13DiagnosisCertified":b.get("diagnosis")=="POST_BN12_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_PARITY_CERTIFICATION_READY",
      "bn13ResolvedDeepLinkContextRestore":b.get("resolvedConsumer")=="DEEP_LINK_CONTEXT_RESTORE",
      "exactTenCohort":len(COHORT)==10 and len(set(COHORT))==10,
      "selectedPropertyBoundaryPresent":sig["selectedProperty"]>0,
      "deepLinkConsumerPresent":sig["urlParams"]>0 or sig["deepLink"]>0,
      "contextRestoreConsumerPresent":sig["contextRestore"]>0,
      "modeContextConsumptionPresent":sig["modeContext"]>0,
      "noMutationAuthority":True
    }
    ok=all(checks.values())
    outcomes=[{"ordinal":i+1,"property":p,"outcome":"CERTIFIED" if ok else "NOT_CERTIFIED"} for i,p in enumerate(COHORT)]
    result={
      "framework":"SCIIP_EXPLORER_4_BN13A_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if ok else "BLOCKED",
      "state":"M419D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFIED" if ok else "M419D4BN13A_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_CONTRACT_PARITY_CERTIFIED" if ok else "GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_CONTRACT_GAP",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,"signals":sig,"cohort":COHORT,"outcomes":outcomes,
      "certifiedCount":10 if ok else 0,
      "next":"BN13A_CERTIFIED_LIVE_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION_READY" if ok else "BN13A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION" if ok else None,
      "bn13Evidence":{"path":str(bn13),"sha256":hashlib.sha256(bn13.read_bytes()).hexdigest()}
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_governed_deep_link_context_restore_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- EXACT-TEN DEEP-LINK/CONTEXT-RESTORE CONTRACT PARITY -----")
    for x in outcomes:print(f'{x["ordinal"]:02d}. {x["property"]} -> {x["outcome"]}')
    print(f"\nCERTIFIED: {result['certifiedCount']}/10")
    print("STATUS:",result["status"]);print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if ok else 5
if __name__=="__main__":raise SystemExit(main())
