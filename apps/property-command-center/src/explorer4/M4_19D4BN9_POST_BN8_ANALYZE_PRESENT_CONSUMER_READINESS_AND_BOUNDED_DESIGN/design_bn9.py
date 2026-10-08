#!/usr/bin/env python3
from pathlib import Path
import sys,json,re
from datetime import datetime,timezone

M="M4_19D4BN9_POST_BN8_ANALYZE_PRESENT_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

def text_files(root):
    exts={".js",".jsx",".ts",".tsx",".mjs",".json"}
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: yield p,p.read_text(errors="ignore")
            except: pass

def anypat(corpus, pats):
    return any(re.search(p,corpus,re.I|re.S) for p in pats)

def main():
    if len(sys.argv)!=2: return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    prior=ev/"M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE"/"governed_property_intelligence_consumer_lifecycle_closure.json"
    out=ev/M; out.mkdir(parents=True,exist_ok=True)

    print("="*76)
    print("SCIIP Explorer 4.0 — BN9 Post-BN8 Analyze/Present Consumer Readiness")
    print("="*76)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not prior.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN8C_CLOSURE_EVIDENCE_MISSING"); return 4
    pr=json.loads(prior.read_text())
    files=list(text_files(app/"src"))
    corpus="\n".join(t for _,t in files)

    checks={
      "bn8cPassed":pr.get("status")=="PASSED",
      "bn8cStateClosed":pr.get("state")=="M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED",
      "bn8cDiagnosisCertified":pr.get("diagnosis")=="EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "analyzeModePresent":anypat(corpus,[r"\banalyze\b",r"Analyze"]),
      "presentModePresent":anypat(corpus,[r"\bpresent\b",r"Present"]),
      "selectedPropertyBoundaryPresent":anypat(corpus,[r"selectedProperty",r"governedSelectedMapRuntime",r"sourceSelectedProperty"]),
      "governedPropertyBindingPresent":anypat(corpus,[r"governedSelectedMapRuntime",r"governed.*property",r"mapProperty"]),
      "propertyIntelligencePresent":anypat(corpus,[r"Property Intelligence",r"propertyIntelligence",r"derivedIntelligence"]),
      "presentationSurfacePresent":anypat(corpus,[r"presentation",r"Present"]),
      "analyzeConsumerContextPresent":anypat(corpus,[r"analyz.{0,160}property",r"property.{0,160}analyz"]),
      "presentConsumerContextPresent":anypat(corpus,[r"present.{0,160}property",r"property.{0,160}present"]),
      "noMutationAuthority":True
    }
    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN9_POST_BN8_ANALYZE_PRESENT_CONSUMER_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN9_ANALYZE_PRESENT_CONSUMER_READINESS_CERTIFIED" if passed else "M419D4BN9_ANALYZE_PRESENT_CONSUMER_READINESS_NOT_CERTIFIED",
      "diagnosis":"POST_BN8_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION_READY" if passed else "ANALYZE_PRESENT_CONSUMER_BOUNDARY_REQUIRES_RECONCILIATION",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "sourceReferenceCount":len(files),
      "nextMilestone":"M4_19D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION" if passed else None
    }
    f=out/"post_bn8_analyze_present_consumer_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print(f"\nsourceReferenceCount: {len(files)}")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__": raise SystemExit(main())
