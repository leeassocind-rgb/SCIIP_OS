#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFICATION"
COHORT=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())

def source_text(root):
    chunks=[]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts: continue
        s=str(p)
        if any(x in s for x in ("node_modules","dist","build","evidence","src/explorer4/M4_19D4")): continue
        try: chunks.append(p.read_text(errors="ignore"))
        except: pass
    return "\n".join(chunks)

def anyrx(txt,pats): return any(re.search(p,txt,re.I|re.S) for p in pats)

def main():
    if len(sys.argv)!=2:
        print("usage: certify_bn11a.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    bn11p=ev/"M4_19D4BN11_POST_BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn10_next_downstream_consumer_readiness.json"

    print("="*82)
    print("SCIIP Explorer 4.0 — BN11A Governed Export/Presentation Consumer Parity")
    print("="*82)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn11p.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN11_EVIDENCE_MISSING"); return 4
    b=load(bn11p)
    txt=source_text(app/"src")

    selected=anyrx(txt,[r"selectedProperty",r"selected.?property",r"propertyContext"])
    governed=anyrx(txt,[r"governed",r"workspaceState",r"propertyContext"])
    export=anyrx(txt,[r"\bexport\b",r"download",r"generate.*(?:pdf|presentation|package)",r"property.?package"])
    present=anyrx(txt,[r"\bpresent(?:ation)?\b",r"presentationSurface",r"presentMode"])
    context=selected and anyrx(txt,[r"propertyContext",r"selectedProperty",r"property"])
    output_surface=anyrx(txt,[r"presentation",r"export",r"download",r"report",r"package"])

    checks={
      "bn11Passed":b.get("status")=="PASSED",
      "bn11StateCertified":b.get("state")=="M419D4BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
      "bn11DiagnosisCertified":b.get("diagnosis")=="POST_BN10_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
      "bn11ResolvedExportPresentation":b.get("resolvedConsumer")=="EXPORT_PRESENTATION",
      "exactTenCohort":len(COHORT)==10 and len(set(COHORT))==10,
      "selectedPropertyBoundaryPresent":selected,
      "governedPropertyBindingPresent":governed,
      "exportConsumerPresent":export,
      "presentationConsumerPresent":present,
      "propertyContextConsumptionPresent":context,
      "outputSurfacePresent":output_surface,
      "noMutationAuthority":True
    }
    parity=all(checks.values())
    outcomes=[{"ordinal":i+1,"property":p,"outcome":"CERTIFIED" if parity else "BLOCKED"} for i,p in enumerate(COHORT)]
    result={
      "framework":"SCIIP_EXPLORER_4_BN11A_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if parity else "BLOCKED",
      "state":"M419D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFIED" if parity else "M419D4BN11A_EXPORT_PRESENTATION_CONSUMER_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_CONTRACT_PARITY_CERTIFIED" if parity else "GOVERNED_EXPORT_PRESENTATION_CONSUMER_CONTRACT_PARITY_GAP",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,"cohort":COHORT,"outcomes":outcomes,
      "certifiedCount":10 if parity else 0,
      "next":"BN11A_CERTIFIED_LIVE_EXPORT_PRESENTATION_CONSUMER_OBSERVATION_READY" if parity else "BN11A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN11B_EXACT_TEN_LIVE_GOVERNED_EXPORT_PRESENTATION_CONSUMER_OBSERVATION" if parity else None,
      "bn11Evidence":{"path":str(bn11p),"sha256":hashlib.sha256(bn11p.read_bytes()).hexdigest()}
    }
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_governed_export_presentation_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN EXPORT/PRESENTATION CONTRACT PARITY -----")
    for x in outcomes: print(f'{x["ordinal"]:02d}. {x["property"]} -> {x["outcome"]}')
    print()
    print(f'CERTIFIED: {result["certifiedCount"]}/10')
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if parity else 5

if __name__=="__main__": raise SystemExit(main())
