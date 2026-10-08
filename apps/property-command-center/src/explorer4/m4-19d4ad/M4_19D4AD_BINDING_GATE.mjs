#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,parseEnvFile,classifyCredentialSources} from "./M419D4ADCredentialRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4ac-isolated-proxy-environment-binding-self-test.json");
const envPath=path.join(app,".env.local");
const resultPath=path.join(ev,"m4-19d4ad-lightbox-api-key-approved-local-source-binding-gate.json");
const helperPath=path.join(ev,"m4-19d4ad-bind-lightbox-api-key-securely.command");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={
    contract:CONTRACT,version:VERSION,status:"BLOCKED",state,
    certifiedAt:new Date().toISOString(),...extra
  };
  write(resultPath,out);
  console.log(JSON.stringify(out,null,2));
  process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4AD_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AC_REQUIRED_SERVER_RUNTIME_CREDENTIAL_NOT_BOUND")
  block("M419D4AD_M419D4AC_MISSING_CREDENTIAL_STATE_REQUIRED",{observed:pdoc?.state??null});

const fileEnv=fs.existsSync(envPath)?parseEnvFile(fs.readFileSync(envPath,"utf8")):{};
const classification=classifyCredentialSources(process.env,fileEnv);

const helper=`#!/bin/bash
set -euo pipefail
APP_ROOT="\${1:-$HOME/Desktop/SCIIP_OS-main-merge/apps/property-command-center}"
ENV_FILE="$APP_ROOT/.env.local"

mkdir -p "$APP_ROOT"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

printf "Enter LightBox API key (input hidden): "
IFS= read -r -s LIGHTBOX_KEY
printf "\\n"

if [[ -z "$LIGHTBOX_KEY" ]]; then
  echo "ERROR: empty key; no changes made."
  exit 2
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

awk '
  BEGIN { replaced=0 }
  /^LIGHTBOX_API_KEY=/ {
    if (!replaced) {
      print "LIGHTBOX_API_KEY=__SCIIP_REPLACEMENT__"
      replaced=1
    }
    next
  }
  { print }
  END {
    if (!replaced) print "LIGHTBOX_API_KEY=__SCIIP_REPLACEMENT__"
  }
' "$ENV_FILE" > "$TMP"

python3 - "$TMP" "$LIGHTBOX_KEY" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
key=sys.argv[2]
text=p.read_text()
# Quote safely without echoing.
escaped=key.replace("\\\\","\\\\\\\\").replace('"','\\\\"')
p.write_text(text.replace("__SCIIP_REPLACEMENT__", f'"{escaped}"'))
PY

chmod 600 "$TMP"
mv "$TMP" "$ENV_FILE"
trap - EXIT
unset LIGHTBOX_KEY

echo "LIGHTBOX_API_KEY bound securely in .env.local (value not displayed)."
`;
if(!fs.existsSync(helperPath)){
  fs.writeFileSync(helperPath,helper,{mode:0o700});
}

if(classification.unsafeClientExposedCandidatePresent && !classification.approvedBound){
  const out={
    contract:CONTRACT,
    version:VERSION,
    status:"BLOCKED",
    state:"M419D4AD_ONLY_VITE_CLIENT_EXPOSED_LIGHTBOX_API_KEY_CANDIDATE_PRESENT_NOT_ACCEPTABLE_AS_SERVER_SECRET",
    certifiedAt:new Date().toISOString(),
    binding:{
      approvedServerCredentialBound:false,
      unsafeClientExposedCandidatePresent:true,
      acceptedNames:["LIGHTBOX_API_KEY"],
      rejectedSubstitutes:["VITE_LIGHTBOX_API_KEY"],
      valueExposed:false
    },
    operatorAction:{
      secureBindingHelper:helperPath,
      rerunMilestone:"M4.19D4AC_ISOLATED_PROXY_ENVIRONMENT_BINDING_AND_SELF_TEST"
    },
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
    },
    safety:{
      sourceMutationPerformed:false,processMutationPerformed:false,networkRequestsPerformed:0,
      enrichmentRequestsPerformed:0,secretValuesExposed:false,secretValuesPersistedInEvidence:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
}

if(!classification.approvedBound){
  const out={
    contract:CONTRACT,
    version:VERSION,
    status:"BLOCKED",
    state:"M419D4AD_OPERATOR_SUPPLIED_LIGHTBOX_API_KEY_REQUIRED",
    certifiedAt:new Date().toISOString(),
    binding:{
      approvedServerCredentialBound:false,
      currentProcessExactCredential:false,
      appEnvLocalExactCredential:false,
      unsafeClientExposedCandidatePresent:classification.unsafeClientExposedCandidatePresent,
      acceptedName:"LIGHTBOX_API_KEY",
      valueExposed:false
    },
    operatorAction:{
      secureBindingHelper:helperPath,
      instruction:"Run the secure binding helper and enter the real LightBox API key when prompted. The key is not echoed.",
      rerunMilestone:"M4.19D4AC_ISOLATED_PROXY_ENVIRONMENT_BINDING_AND_SELF_TEST"
    },
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
    },
    safety:{
      sourceMutationPerformed:false,processMutationPerformed:false,networkRequestsPerformed:0,
      enrichmentRequestsPerformed:0,secretValuesExposed:false,secretValuesPersistedInEvidence:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
}

const source=classification.exactProcess?"CURRENT_PROCESS_ENV":"APP_ENV_LOCAL";
const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AD_LIGHTBOX_API_KEY_APPROVED_LOCAL_SOURCE_BOUND",
  certifiedAt:new Date().toISOString(),
  binding:{
    approvedServerCredentialBound:true,
    source,
    acceptedName:"LIGHTBOX_API_KEY",
    unsafeClientExposedCandidatePresent:classification.unsafeClientExposedCandidatePresent,
    valueExposed:false
  },
  nextMilestone:"M4.19D4AC_ISOLATED_PROXY_ENVIRONMENT_BINDING_AND_SELF_TEST",
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    sourceMutationPerformed:false,processMutationPerformed:false,networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,secretValuesExposed:false,secretValuesPersistedInEvidence:false
  }
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
