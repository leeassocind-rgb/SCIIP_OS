#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION} from "./M419D4AT1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const atPath=path.join(ev,"m4-19d4at-market-availability-refresh-input-contract-single-record-preauthorization.json");
const inputPath=path.join(ev,"m4-19d4at-single-record-availability-refresh-input.json");
const helperPath=path.join(ev,"m4-19d4at1-complete-single-record-availability-evidence.command");
const resultPath=path.join(ev,"m4-19d4at1-single-record-availability-evidence-completion-helper.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");

if(!fs.existsSync(atPath)||!fs.existsSync(inputPath)){
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state:"M419D4AT1_AT_BLOCKED_INPUT_ARTIFACTS_REQUIRED"};
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(3);
}
const at=JSON.parse(fs.readFileSync(atPath,"utf8"));
if(at.state!=="M419D4AT_SINGLE_RECORD_REFRESH_INPUT_INCOMPLETE_OR_NOT_FRESH"){
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state:"M419D4AT1_AT_INCOMPLETE_INPUT_STATE_REQUIRED",observed:at.state};
  write(resultPath,out);console.log(JSON.stringify(out,null,2));process.exit(3);
}

const script=`#!/bin/bash
set -euo pipefail

INPUT="${inputPath}"

echo "SCIIP Explorer 4.0 — M4.19D4AT1 Availability Evidence Completion Helper"
echo "Existing bound property identity will be preserved."
echo "Enter only real source-backed market availability evidence."
echo "Nothing will be guessed."
echo

read -r -p "Available SF currently marketed (numeric, 0 allowed only if explicitly observed): " AVAILABLE_SF
read -r -p "Provider / source name (e.g. owner, broker, CoStar, internal survey): " PROVIDER
read -r -p "Source type (OWNER_OR_PROPERTY_MANAGER / MARKET_LISTING_PROVIDER / BROKERAGE_INTERNAL_MARKET_INTELLIGENCE / GOVERNED_OPERATOR_OBSERVATION): " SOURCE_TYPE
read -r -p "Stable source record/reference (URL, listing ID, email ref, document path, etc.): " SOURCE_REF
read -r -p "Source-native field path or label (e.g. listing.availableSf or brochure 'Available SF'): " FIELD_PATH
read -r -p "Observation timestamp ISO 8601 (when availability was actually observed): " OBS_TS
read -r -p "Captured-at timestamp ISO 8601 (press Enter to use current UTC time): " CAPTURED_AT
if [[ -z "$CAPTURED_AT" ]]; then
  CAPTURED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

read -r -p "Raw evidence local file path (optional; if supplied SHA-256 is computed automatically): " RAW_FILE
RAW_REF=""
RAW_HASH=""
if [[ -n "$RAW_FILE" ]]; then
  RAW_FILE="\${RAW_FILE/#\\~/$HOME}"
  if [[ ! -f "$RAW_FILE" ]]; then
    echo "ERROR: evidence file not found: $RAW_FILE" >&2
    exit 3
  fi
  RAW_REF="$RAW_FILE"
  RAW_HASH="$(shasum -a 256 "$RAW_FILE" | awk '{print $1}')"
else
  read -r -p "Raw evidence reference (URL, record ID, document path, etc.): " RAW_REF
  read -r -p "Raw evidence SHA-256 (required when no local evidence file supplied): " RAW_HASH
fi

read -r -p "Identity match evidence (how this source is tied to the bound property): " IDENTITY_MATCH
read -r -p "Confidence (HIGH / MEDIUM / LOW): " CONFIDENCE
read -r -p "Status (e.g. ACTIVE_AVAILABLE, CONFIRMED_ZERO_AVAILABLE): " STATUS

python3 - "$INPUT" "$AVAILABLE_SF" "$PROVIDER" "$SOURCE_TYPE" "$SOURCE_REF" "$FIELD_PATH" "$OBS_TS" "$CAPTURED_AT" "$RAW_REF" "$RAW_HASH" "$IDENTITY_MATCH" "$CONFIDENCE" "$STATUS" <<'PY'
import json,sys,datetime
p=sys.argv[1]
d=json.load(open(p))
available=sys.argv[2]
try:
    n=float(available.replace(",",""))
    if n<0: raise ValueError
    if n.is_integer(): n=int(n)
except Exception:
    raise SystemExit("ERROR: Available SF must be a non-negative number.")
obs=sys.argv[7]
cap=sys.argv[8]
for label,val in [("observationTimestamp",obs),("capturedAt",cap)]:
    try:
        datetime.datetime.fromisoformat(val.replace("Z","+00:00"))
    except Exception:
        raise SystemExit(f"ERROR: {label} must be valid ISO 8601.")
vals={
 "availableSf":n,
 "provider":sys.argv[3],
 "sourceType":sys.argv[4],
 "sourceRecordIdOrStableReference":sys.argv[5],
 "sourceNativeFieldPath":sys.argv[6],
 "observationTimestamp":obs,
 "capturedAt":cap,
 "rawEvidenceReference":sys.argv[9],
 "rawEvidenceHash":sys.argv[10],
 "identityMatchEvidence":sys.argv[11],
 "confidence":sys.argv[12].upper(),
 "status":sys.argv[13]
}
missing=[k for k,v in vals.items() if k!="availableSf" and not str(v).strip()]
if missing:
    raise SystemExit("ERROR: required fields missing: "+", ".join(missing))
if vals["confidence"] not in {"HIGH","MEDIUM","LOW"}:
    raise SystemExit("ERROR: confidence must be HIGH, MEDIUM, or LOW.")
d.update(vals)
with open(p,"w") as f:
    json.dump(d,f,indent=2)
    f.write("\\n")
print("Availability evidence written:",p)
print("Property identity preserved.")
print("No canonical/temporal/current-state mutation performed.")
PY

echo
echo "Now rerun M4.19D4AT."
`;
fs.writeFileSync(helperPath,script,{mode:0o755});

const out={
 contract:CONTRACT,version:VERSION,status:"PASSED",
 state:"M419D4AT1_SINGLE_RECORD_AVAILABILITY_EVIDENCE_COMPLETION_HELPER_READY",
 certifiedAt:new Date().toISOString(),
 existingBinding:{
  canonicalPropertyId:JSON.parse(fs.readFileSync(inputPath,"utf8")).canonicalPropertyId??null,
  sourcePropertyId:JSON.parse(fs.readFileSync(inputPath,"utf8")).sourcePropertyId??null,
  address:JSON.parse(fs.readFileSync(inputPath,"utf8")).address??null,
  preserved:true
 },
 missingFields:at?.validation?.failures??[],
 helperPath,
 networkRequestsPerformed:0,
 nextMilestone:"M4.19D4AT_MARKET_AVAILABILITY_REFRESH_INPUT_CONTRACT_AND_SINGLE_RECORD_PREAUTHORIZATION",
 safety:{
  canonicalMutationPerformed:false,temporalMutationPerformed:false,
  identityMutationPerformed:false,operationalIngestionPerformed:false,
  syntheticEvidenceUsed:false
 }
};
write(resultPath,out);console.log(JSON.stringify(out,null,2));
