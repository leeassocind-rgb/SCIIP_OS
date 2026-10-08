#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib,unicodedata

M="M4_19D4BN16A_25_RECORD_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
ORIGINAL=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

BAD_KEYS={"status","state","diagnosis","framework","mode","next","nextMilestone","outcome","candidate","resolvedNextPhase"}

def norm(s):
    s=unicodedata.normalize("NFKC",str(s)).strip()
    return re.sub(r"\s+"," ",s).casefold()

def plausible_label(s):
    if not isinstance(s,str): return False
    s=s.strip()
    if len(s)<4 or len(s)>120: return False
    if "http://" in s or "https://" in s: return False
    if "/" in s and not re.search(r"\d",s): return False
    if s.upper()==s and "_" in s: return False
    if re.fullmatch(r"[A-Fa-f0-9]{24,}",s): return False
    has_digit=bool(re.search(r"\d",s))
    has_street=bool(re.search(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|musick|citrus|carrier|woodruff|vanowen|carmenita|industrial|rex|cedar)\b",s,re.I))
    return has_digit and has_street

def harvest(obj,out,key=None):
    if isinstance(obj,dict):
        for k,v in obj.items():
            if k in BAD_KEYS: continue
            harvest(v,out,k)
    elif isinstance(obj,list):
        for v in obj: harvest(v,out,key)
    elif isinstance(obj,str):
        if key in {"property","name","label","address","query","controlledValue","displayName","title"} and plausible_label(obj):
            out.append(obj.strip())
        elif plausible_label(obj):
            out.append(obj.strip())

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    bn16=ev/"M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS"/"post_end_to_end_recertification_bounded_cohort_expansion_readiness.json"
    print("="*104)
    print("SCIIP Explorer 4.0 — BN16A 25-Record Candidate Selection, Qualification & Preauthorization")
    print("="*104)
    print("Mode: READ_ONLY_COHORT_SELECTION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn16.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN16_READINESS_EVIDENCE_MISSING"); return 4
    b=json.loads(bn16.read_text())
    pol=b.get("expansionPolicy") or {}
    checks={
      "bn16Passed":b.get("status")=="PASSED",
      "bn16StateCertified":b.get("state")=="M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED",
      "bn16DiagnosisCertified":b.get("diagnosis")=="EXACT_TEN_END_TO_END_RECERTIFICATION_CLOSED_BOUNDED_25_RECORD_READ_ONLY_EXPANSION_READY",
      "referenceCohortSizeTen":pol.get("referenceCohortSize")==10,
      "nextCohortCeilingTwentyFive":pol.get("nextCohortCeiling")==25,
      "deterministicSelectionRequired":pol.get("selection")=="DETERMINISTIC",
      "referenceCohortPreserved":pol.get("referenceCohortMustRemainIncluded") is True,
      "readOnlyExecutionRequired":pol.get("executionMode")=="READ_ONLY_CERTIFICATION",
      "mutationAuthorityNotGranted":pol.get("mutationAuthorityGranted") is False,
    }

    raw=[]
    for p in ev.rglob("*.json"):
        if "M4_19D4BN16A" in str(p): continue
        try:
            harvest(json.loads(p.read_text()),raw)
        except Exception:
            continue

    seen={norm(x) for x in ORIGINAL}
    candidates=[]
    for s in sorted(raw,key=lambda x:norm(x)):
        n=norm(s)
        if n in seen: continue
        # avoid obvious variants of originals
        if any(n==norm(o) or n in norm(o) or norm(o) in n for o in ORIGINAL): continue
        seen.add(n)
        candidates.append(s)

    selected_new=candidates[:15]
    cohort=ORIGINAL+selected_new
    checks["atLeastFifteenQualifiedCandidatesFound"]=len(candidates)>=15
    checks["exactlyFifteenNewCandidatesSelected"]=len(selected_new)==15
    checks["exactlyTwentyFiveTotal"]=len(cohort)==25
    checks["originalTenRemainFirstAndUnchanged"]=cohort[:10]==ORIGINAL
    checks["allTwentyFiveUnique"]=len({norm(x) for x in cohort})==25
    checks["selectionDeterministic"]=selected_new==sorted(selected_new,key=lambda x:norm(x))

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN16A_25_RECORD_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16A_25_RECORD_COHORT_SELECTION_QUALIFICATION_PREAUTHORIZED" if passed else "M419D4BN16A_25_RECORD_COHORT_NOT_PREAUTHORIZED",
      "diagnosis":"DETERMINISTIC_25_RECORD_READ_ONLY_EXPANSION_COHORT_SELECTED_QUALIFIED_AND_PREAUTHORIZED" if passed else "25_RECORD_CANDIDATE_SELECTION_OR_QUALIFICATION_GAP",
      "mode":"READ_ONLY_COHORT_SELECTION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "referenceCohort":ORIGINAL,
      "newCandidates":selected_new,
      "qualifiedCandidatePoolCount":len(candidates),
      "preauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "selectionPolicy":{
        "ordering":"NORMALIZED_LABEL_ASCENDING",
        "referenceCohortPinnedFirst":True,
        "newCandidateCount":15,
        "totalCohortCount":25,
        "executionMode":"READ_ONLY_CERTIFICATION",
        "haltOnFirstFailure":True
      },
      "next":"BN16A_PREAUTHORIZED_25_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN16A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None,
      "bn16Evidence":{"path":str(bn16),"sha256":hashlib.sha256(bn16.read_bytes()).hexdigest()}
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"twenty_five_record_candidate_selection_qualification_preauthorization.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- QUALIFICATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- PREAUTHORIZED 25-RECORD COHORT -----")
    for i,p in enumerate(cohort,1): print(f"{i:02d}. {p}")

    print("\nQUALIFIED_CANDIDATE_POOL_COUNT:",len(candidates))
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__":raise SystemExit(main())
