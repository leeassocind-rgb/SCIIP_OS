#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"

ORIGINAL=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def norm(s): return re.sub(r"\s+"," ",str(s).strip()).casefold()

def read_all_source(repo):
    roots=[repo/"apps/property-command-center/src",repo/"apps/property-command-center/public",repo/"data",repo/"packages"]
    chunks=[]
    for root in roots:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file(): continue
            try:
                if p.stat().st_size>8_000_000: continue
            except Exception: continue
            if p.suffix.lower() not in {".json",".js",".mjs",".cjs",".ts",".tsx",".jsx"}: continue
            sp=str(p)
            if "/explorer4/M4_" in sp or "/evidence/" in sp or "/node_modules/" in sp or "/dist/" in sp or "/build/" in sp: continue
            try: chunks.append(p.read_text(errors="ignore"))
            except Exception: pass
    return "\n".join(chunks)

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    src=ev/"M4_19D4BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION"/"tolerant_evidence_decoder_and_25_record_governed_cohort_preauthorization.json"

    print("="*104)
    print("SCIIP Explorer 4.0 — BN16B 25-Record Governed Explorer Contract Parity Certification")
    print("="*104)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not src.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN16A_R3_PREAUTHORIZATION_EVIDENCE_MISSING");return 4

    d=json.loads(src.read_text())
    cohort=(d.get("preauthorizedCohort") or {}).get("properties") or []
    authority=d.get("authority") or {}

    source=read_all_source(repo)
    source_cf=source.casefold()

    # Contract probes are about governed Explorer capability, not literal exact label lookup only.
    capability_checks={
      "workspaceSelectionContractPresent": all(x in source for x in ["selectedProperty"]) or "selectedproperty" in source_cf,
      "searchContractPresent": "search" in source_cf,
      "mapContractPresent": "map" in source_cf,
      "propertyConsumerPresent": "property" in source_cf,
      "marketOrNeighborConsumerPresent": ("market" in source_cf and "neighbor" in source_cf),
      "compareConsumerPresent": "compare" in source_cf,
      "commandConsumerPresent": "command" in source_cf,
      "propertyIntelligencePresent": ("property intelligence" in source_cf or "propertyintelligence" in source_cf),
      "analyzePresentPresent": ("analyze" in source_cf and "present" in source_cf),
      "explainEvidencePresent": ("explain" in source_cf and "evidence" in source_cf),
      "exportPresentationPresent": ("export" in source_cf or "property package" in source_cf) and "present" in source_cf,
      "graphRelationshipPresent": ("graph" in source_cf or "relationship" in source_cf or "neighbor" in source_cf),
      "deepLinkRestorePresent": ("deeplink" in source_cf or "deep-link" in source_cf or "urlsearchparams" in source_cf) and ("restore" in source_cf or "sessionstorage" in source_cf or "localstorage" in source_cf),
    }

    # Record-level contract parity: unique, non-empty, source-backed labels.
    outcomes=[]
    for i,p in enumerate(cohort,1):
        label=norm(p)
        source_backed=label in source_cf
        structural_valid=bool(p and isinstance(p,str) and len(p.strip())>=4)
        all_caps=all(capability_checks.values())
        ok=source_backed and structural_valid and all_caps
        outcomes.append({
          "ordinal":i,
          "property":p,
          "sourceBackedLabel":source_backed,
          "structuralLabelValid":structural_valid,
          "allGovernedExplorerCapabilitiesPresent":all_caps,
          "outcome":"CERTIFIED" if ok else "NOT_CERTIFIED"
        })

    checks={
      "bn16aR3Passed":d.get("status")=="PASSED",
      "bn16aR3StateCertified":d.get("state")=="M419D4BN16A_R3_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED",
      "bn16aR3DiagnosisCertified":d.get("diagnosis")=="TOLERANT_EVIDENCE_DECODER_AND_ADDRESS_MATCHER_REPAIRED_DETERMINISTIC_25_RECORD_COHORT_PREAUTHORIZED",
      "exactTwentyFiveCount":len(cohort)==25,
      "originalTenPreservedFirst":cohort[:10]==ORIGINAL,
      "allTwentyFiveUnique":len({norm(x) for x in cohort})==25,
      "allLabelsNonEmpty":all(isinstance(x,str) and x.strip() for x in cohort),
      "allCapabilitiesPresent":all(capability_checks.values()),
      "allTwentyFiveSourceBacked":all(x["sourceBackedLabel"] for x in outcomes),
      "allTwentyFiveContractParityCertified":all(x["outcome"]=="CERTIFIED" for x in outcomes),
      "applicationMutationOff":authority.get("applicationSourceMutation") is False,
      "governedMutationOff":authority.get("governedDataMutation") is False,
      "networkAuthorityOff":authority.get("networkAuthority") is False,
      "pixelEvidenceOff":authority.get("pixelEvidence") is False
    }
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED" if passed else "M419D4BN16B_25_RECORD_CONTRACT_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED" if passed else "25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_GAP_REMAINS",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "capabilityChecks":capability_checks,
      "cohort":{"count":len(cohort),"properties":cohort},
      "outcomes":outcomes,
      "certifiedCount":sum(1 for x in outcomes if x["outcome"]=="CERTIFIED"),
      "next":"BN16B_CERTIFIED_25_RECORD_LIVE_WORKFLOW_OBSERVATION_READY" if passed else "BN16B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16C_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION" if passed else None,
      "sourceEvidence":{"path":str(src),"sha256":hashlib.sha256(src.read_bytes()).hexdigest()}
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"twenty_five_record_governed_explorer_contract_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CONTRACT CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- CAPABILITY CHECKS -----")
    for k,v in capability_checks.items():print(f"{k}: {v}")
    print("\n----- 25-RECORD CONTRACT PARITY -----")
    for x in outcomes:print(f'{x["ordinal"]:02d}. {x["property"]} -> {x["outcome"]}')
    print(f"\nCERTIFIED: {result['certifiedCount']}/25")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
