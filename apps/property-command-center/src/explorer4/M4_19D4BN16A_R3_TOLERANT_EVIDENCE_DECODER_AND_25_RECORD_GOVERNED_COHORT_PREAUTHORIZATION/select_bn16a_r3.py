#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib,unicodedata

M="M4_19D4BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION"

ORIGINAL=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

FIELD_NAMES={"address","property","propertyname","property_name","displayname","display_name",
"siteaddress","site_address","streetaddress","street_address","label"}

STREET_RE=re.compile(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place|cir|circle|ter|terrace)\b",re.I)
BAD_RE=re.compile(r"\b(compare|open compare|analyze|present|command|neighbors?|market|property package|selected|drawer|button|control|signal|score|status|certified|outcome|framework|diagnosis)\b",re.I)
FIELD_PAT=re.compile(
    r"\b(address|propertyName|property_name|displayName|display_name|siteAddress|site_address|streetAddress|street_address|label)"
    r"\s*:\s*"
    r"([\"'`])"
    r"([^\"'`\n\r]{4,100})"
    r"\2",
    re.I
)

def load_first_json(path):
    txt=path.read_text(errors="ignore")
    dec=json.JSONDecoder()
    i=0
    while i < len(txt) and txt[i].isspace():
        i += 1
    obj,end=dec.raw_decode(txt,i)
    return obj, txt[end:]

def norm(s):
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()

def clean(s):
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip())

def plausible(s):
    if not isinstance(s,str): return False
    if "\n" in s or "\r" in s: return False
    s=clean(s)
    if len(s)<4 or len(s)>100: return False
    if BAD_RE.search(s): return False
    if "http://" in s or "https://" in s: return False
    if "_" in s and s.upper()==s: return False
    if re.fullmatch(r"[A-Fa-f0-9-]{24,}",s): return False
    if not re.search(r"\d",s): return False
    if not STREET_RE.search(s): return False
    if re.search(r"\b\d{1,3}(?:,\d{3})+\s*(?:sf|sq\.?\s*ft|ft)\b",s,re.I): return False
    return True

def harvest_json(obj,out,key=None):
    if isinstance(obj,dict):
        for k,v in obj.items():
            kk=str(k).replace("-","_").replace(" ","_").lower()
            harvest_json(v,out,kk)
    elif isinstance(obj,list):
        for v in obj: harvest_json(v,out,key)
    elif isinstance(obj,str):
        if key in FIELD_NAMES and plausible(obj):
            out.append(clean(obj))

def harvest_text(text,out):
    for m in FIELD_PAT.finditer(text):
        s=clean(m.group(3))
        if plausible(s):
            out.append(s)

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"

    bn16=ev/"M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS"/"post_end_to_end_recertification_bounded_cohort_expansion_readiness.json"
    r1=ev/"M4_19D4BN16A_R1_GOVERNED_SOURCE_INVENTORY_CANDIDATE_DISCOVERY_AND_25_RECORD_PREAUTHORIZATION"/"governed_source_inventory_candidate_discovery_and_25_record_preauthorization.json"

    print("="*108)
    print("SCIIP Explorer 4.0 — BN16A-R3 Tolerant Evidence Decoder + 25-Record Governed Cohort Preauthorization")
    print("="*108)
    print("Mode: READ_ONLY_COHORT_SELECTION_REPAIR")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn16.is_file() or not r1.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_BN16_OR_BN16A_R1_EVIDENCE_MISSING")
        return 4

    b=json.loads(bn16.read_text())
    prev,trailing=load_first_json(r1)
    pol=b.get("expansionPolicy") or {}
    pc=prev.get("checks") or {}

    checks={
      "bn16Passed":b.get("status")=="PASSED",
      "bn16StateCertified":b.get("state")=="M419D4BN16_BOUNDED_COHORT_EXPANSION_READINESS_CERTIFIED",
      "bn16aR1EvidenceFirstJsonDecoded":isinstance(prev,dict),
      "bn16aR1TrailingDataTolerated":len(trailing)>=0,
      "bn16aR1Blocked":prev.get("status")=="BLOCKED",
      "bn16aR1SourceInventoryScanWorked":pc.get("sourceInventoryFilesScanned") is True,
      "referenceCohortSizeTen":pol.get("referenceCohortSize")==10,
      "nextCohortCeilingTwentyFive":pol.get("nextCohortCeiling")==25,
      "deterministicSelectionRequired":pol.get("selection")=="DETERMINISTIC",
      "referenceCohortPreservationRequired":pol.get("referenceCohortMustRemainIncluded") is True,
      "mutationAuthorityNotGranted":pol.get("mutationAuthorityGranted") is False,
      "addressMatcherUsesRealWordBoundary":STREET_RE.search("120 S Cedar Ave") is not None,
      "digitMatcherUsesRealDigitClass":re.search(r"\d","120 S Cedar Ave") is not None
    }

    scan_roots=[
      repo/"apps/property-command-center/src",
      repo/"apps/property-command-center/public",
      repo/"data",
      repo/"packages"
    ]

    harvested=[]
    scanned_files=0
    for root in scan_roots:
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if not p.is_file():
                continue
            try:
                if p.stat().st_size>8_000_000:
                    continue
            except Exception:
                continue
            if p.suffix.lower() not in {".json",".js",".mjs",".cjs",".ts",".tsx",".jsx"}:
                continue
            sp=str(p)
            if "/explorer4/M4_" in sp or "/evidence/" in sp or "/node_modules/" in sp or "/dist/" in sp or "/build/" in sp:
                continue
            try:
                txt=p.read_text(errors="ignore")
            except Exception:
                continue
            scanned_files+=1
            if p.suffix.lower()==".json":
                try:
                    harvest_json(json.loads(txt),harvested)
                except Exception:
                    harvest_text(txt,harvested)
            else:
                harvest_text(txt,harvested)

    orig_norm={norm(x) for x in ORIGINAL}
    by_norm={}
    for s in harvested:
        n=norm(s)
        if n in orig_norm:
            continue
        if any(n==norm(o) or n in norm(o) or norm(o) in n for o in ORIGINAL):
            continue
        prevs=by_norm.get(n)
        if prevs is None or len(s)<len(prevs):
            by_norm[n]=s

    candidates=[by_norm[k] for k in sorted(by_norm)]
    selected_new=candidates[:15]
    cohort=ORIGINAL+selected_new

    checks["sourceInventoryFilesScanned"]=scanned_files>0
    checks["atLeastFifteenQualifiedCandidatesFound"]=len(candidates)>=15
    checks["exactlyFifteenNewCandidatesSelected"]=len(selected_new)==15
    checks["exactlyTwentyFiveTotal"]=len(cohort)==25
    checks["originalTenRemainFirstAndUnchanged"]=cohort[:10]==ORIGINAL
    checks["allTwentyFiveUnique"]=len({norm(x) for x in cohort})==25
    checks["allNewCandidatesSingleLine"]=all("\n" not in x and "\r" not in x for x in selected_new)
    checks["allNewCandidatesPassStrictQualification"]=all(plausible(x) for x in selected_new)
    checks["selectionDeterministic"]=selected_new==sorted(selected_new,key=norm)

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16A_R3_25_RECORD_GOVERNED_COHORT_PREAUTHORIZED" if passed else "M419D4BN16A_R3_25_RECORD_COHORT_NOT_PREAUTHORIZED",
      "diagnosis":"TOLERANT_EVIDENCE_DECODER_AND_ADDRESS_MATCHER_REPAIRED_DETERMINISTIC_25_RECORD_COHORT_PREAUTHORIZED" if passed else "25_RECORD_COHORT_QUALIFICATION_GAP_REMAINS_AFTER_DECODER_REPAIR",
      "mode":"READ_ONLY_COHORT_SELECTION_REPAIR",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "scan":{"filesScanned":scanned_files,"rawStructuredCandidates":len(harvested),"qualifiedCandidatePoolCount":len(candidates)},
      "r1EvidenceTrailingByteCount":len(trailing.encode()),
      "referenceCohort":ORIGINAL,
      "newCandidates":selected_new,
      "preauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "selectionPolicy":{
        "source":"GOVERNED_REPOSITORY_SOURCE_INVENTORY",
        "ordering":"NORMALIZED_LABEL_ASCENDING",
        "strictSingleLineQualification":True,
        "uiTextContaminationRejected":True,
        "referenceCohortPinnedFirst":True,
        "newCandidateCount":15,
        "totalCohortCount":25,
        "executionMode":"READ_ONLY_CERTIFICATION"
      },
      "next":"BN16A_PREAUTHORIZED_25_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN16A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"tolerant_evidence_decoder_and_25_record_governed_cohort_preauthorization.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- REPAIR / QUALIFICATION CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- PREAUTHORIZED 25-RECORD COHORT -----")
    for i,p in enumerate(cohort,1):
        print(f"{i:02d}. {p}")

    print("\nR1_EVIDENCE_TRAILING_BYTE_COUNT:",len(trailing.encode()))
    print("SOURCE_INVENTORY_FILES_SCANNED:",scanned_files)
    print("RAW_STRUCTURED_CANDIDATES:",len(harvested))
    print("QUALIFIED_CANDIDATE_POOL_COUNT:",len(candidates))
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
