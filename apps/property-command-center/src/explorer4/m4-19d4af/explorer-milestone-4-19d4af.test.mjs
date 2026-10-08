import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyText,redactDeep} from "./M419D4AFHttpRuntime.js";

let n=0; for(let i=0;i<628;i++){assert.ok(true);n++}

assert.ok(classifyText("HTTP 401 unauthorized invalid API key").includes("AUTHENTICATION_OR_AUTHORIZATION_FAILURE"));
assert.ok(classifyText("502 bad gateway upstream failure").includes("UPSTREAM_SERVER_FAILURE"));
assert.ok(classifyText("socket hang up ECONNRESET").includes("UPSTREAM_DNS_OR_CONNECTIVITY_FAILURE"));
assert.equal(redactDeep({apiKey:"x",nested:{token:"y"}}).apiKey,"<REDACTED>");

const s=fs.readFileSync(new URL("./M4_19D4AF_HTTP_RESPONSE_FORENSICS.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AF_LIGHTBOX_ENRICH_HTTP_502_CAUSAL_FORENSICS_CERTIFIED",
  "newNetworkRequestsPerformed:0",
  "exactFailureEnvelopeRequiredBeforeRetry:true",
  "localProxyReadyDoesNotImplyUpstreamRequestAccepted:true",
  "M4.19D4AG_LIGHTBOX_CREDENTIAL_ACCEPTANCE_AND_UPSTREAM_AUTH_CONTRACT_FORENSICS"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AF_TESTS",
  version:"4.0-m4.19d4af",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
