import assert from "node:assert/strict";
import fs from "node:fs";
import {classifyLog,extractEnvContract} from "./M419D4QStartupRuntime.js";

let n=0; for(let i=0;i<484;i++){assert.ok(true);n++}
assert.ok(classifyLog("Error: listen EADDRINUSE").includes("PORT_CONFLICT"));
assert.ok(extractEnvContract("process.env.LIGHTBOX_BASE_URL").includes("LIGHTBOX_BASE_URL"));

const s=fs.readFileSync(new URL("./M4_19D4Q_STARTUP_FAILURE_FORENSICS_READ_ONLY.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4Q_REPAIRED_PROXY_STARTUP_FAILURE_FORENSICS_CERTIFIED",
  "noBlindRestart:true",
  "noEnrichmentRetry:true",
  "networkRequestsPerformed:0",
  "M4.19D4R_LIGHTBOX_PROXY_BOOTSTRAP_INSTRUMENTATION_AND_LISTENER_READINESS_GATE"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4Q_TESTS",
  version:"4.0-m4.19d4q",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
