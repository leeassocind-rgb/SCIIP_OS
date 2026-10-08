#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION} from "./M419D4AH3AHelperRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4ah3-operator-external-coordinate-evidence-validation-binding.json");
const template=path.join(ev,"m4-19d4ah2-coordinate-evidence-template.json");
const helper=path.join(ev,"m4-19d4ah3a-complete-coordinate-evidence.command");
const result=path.join(ev,"m4-19d4ah3a-coordinate-evidence-metadata-completion-helper.json");

function write(p,x){fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n")}
function finish(status,state,extra={},code=0){
  const out={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra};
  write(result,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
}
if(!fs.existsSync(prior)) finish("BLOCKED","M419D4AH3A_PREREQUISITE_MISSING",{path:prior},3);
if(!fs.existsSync(template)) finish("BLOCKED","M419D4AH3A_TEMPLATE_MISSING",{path:template},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AH3_COORDINATE_EVIDENCE_INCOMPLETE_OR_INVALID")
  finish("BLOCKED","M419D4AH3A_EXPECTED_INCOMPLETE_EVIDENCE_STATE",{observed:pdoc?.state??null},3);

const failures=pdoc?.validation?.failures||[];
const expected=[
  "VALID_OBSERVATION_TIMESTAMP_REQUIRED",
  "SOURCE_PROVENANCE_REQUIRED",
  "SOURCE_REFERENCE_REQUIRED",
  "SOURCE_SNAPSHOT_EVIDENCE_REQUIRED"
];
const onlyExpected=failures.length===expected.length && expected.every(x=>failures.includes(x));
if(!onlyExpected)
  finish("BLOCKED","M419D4AH3A_UNEXPECTED_VALIDATION_FAILURE_SET",{failures},3);

const tdoc=JSON.parse(fs.readFileSync(template,"utf8"));
const coordsValid=Number.isFinite(Number(tdoc.latitude))&&Number.isFinite(Number(tdoc.longitude));
if(!coordsValid)
  finish("BLOCKED","M419D4AH3A_EXISTING_COORDINATES_REQUIRED");

const script=`#!/bin/bash
set -euo pipefail
TEMPLATE="${template}"
VALIDATOR="${app}/src/explorer4/m4-19d4ah3/M4_19D4AH3_VALIDATE_AND_BIND.mjs"
REPO="${repo}"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "ERROR: evidence template not found: $TEMPLATE"
  exit 2
fi

echo "Existing canonical/source identity and coordinates will be preserved."
echo "Enter only real source-backed metadata. Nothing will be guessed."

read -r -p "Observation timestamp (ISO 8601, e.g. 2026-08-18T23:21:00Z): " OBS_TS
read -r -p "Source provenance (e.g. LightBox property record / assessor / operator source): " PROV
read -r -p "Source reference (URL, record ID, document path, or other stable reference): " REF
read -r -p "Source snapshot evidence (file path, snapshot ID/hash, or concise evidence description): " SNAP

if [[ -z "$OBS_TS" || -z "$PROV" || -z "$REF" || -z "$SNAP" ]]; then
  echo "ERROR: all four fields are required. No changes made."
  exit 3
fi

python3 - "$TEMPLATE" "$OBS_TS" "$PROV" "$REF" "$SNAP" <<'PY'
from pathlib import Path
import json,sys
p=Path(sys.argv[1])
doc=json.loads(p.read_text())
doc["observationTimestamp"]=sys.argv[2]
doc["sourceProvenance"]=sys.argv[3]
doc["sourceReference"]=sys.argv[4]
doc["sourceSnapshotEvidence"]=sys.argv[5]
p.write_text(json.dumps(doc,indent=2)+"\\n")
PY

echo
echo "Coordinate evidence metadata updated. Values entered:"
echo "  observationTimestamp: recorded"
echo "  sourceProvenance: recorded"
echo "  sourceReference: recorded"
echo "  sourceSnapshotEvidence: recorded"
echo
echo "Revalidating M4.19D4AH3..."
node "$VALIDATOR" "$REPO"
`;

fs.writeFileSync(helper,script,{mode:0o700});

finish("PASSED","M419D4AH3A_COORDINATE_EVIDENCE_METADATA_COMPLETION_HELPER_READY",{
  existingEvidence:{
    canonicalPropertyId:tdoc.canonicalPropertyId,
    sourcePropertyId:tdoc.sourcePropertyId,
    latitudePresent:true,
    longitudePresent:true,
    preserved:true
  },
  missingFields:expected,
  helperPath:helper,
  networkRequestsPerformed:0,
  enrichmentRequestsPerformed:0,
  nextMilestone:"M4.19D4AH3_OPERATOR_EXTERNAL_COORDINATE_EVIDENCE_VALIDATION_AND_BINDING"
});
