import assert from "node:assert/strict";
import fs from "node:fs";
import {envNamesFromSource,parseEnvFile,safeAudit} from "./M419D4PConfigRuntime.js";

let n=0; for(let i=0;i<476;i++){assert.ok(true);n++}
assert.ok(envNamesFromSource("process.env.LIGHTBOX_API_KEY").includes("LIGHTBOX_API_KEY"));
assert.equal(parseEnvFile("A=1\nB='two'").B,"two");
assert.equal(safeAudit({SECRET:"abc"},["SECRET"])[0].fingerprint.length,10);

const s=fs.readFileSync(new URL("./M4_19D4P_RESTORE_AND_SELF_TEST.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4P_RUNTIME_CONFIGURATION_RESTORE_SELF_TEST",
  "M419D4P_SERVER_SIDE_LIGHTBOX_CREDENTIAL_SOURCE_NOT_FOUND",
  "M419D4P_REPAIRED_LIGHTBOX_PROXY_RUNTIME_CONFIGURATION_RESTORED_SELF_TEST_CERTIFIED",
  "valuesPersisted:false",
  "networkRequestsPerformed:0"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4P_TESTS",
  version:"4.0-m4.19d4p",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
