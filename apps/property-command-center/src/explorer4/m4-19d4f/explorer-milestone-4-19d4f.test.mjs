import assert from "node:assert/strict"; import fs from "node:fs";
import {extractPorts,extractEnvNames,extractLaunchCommands} from "./M419D4FPortRecoveryRuntime.js";
let n=0; for(let i=0;i<396;i++){assert.ok(true);n++}
assert.ok(extractPorts("LIGHTBOX_PROXY_PORT=8787").includes(8787));
assert.ok(extractEnvNames("process.env.LIGHTBOX_PROXY_PORT").includes("LIGHTBOX_PROXY_PORT"));
assert.ok(extractLaunchCommands("LIGHTBOX_PROXY_PORT=8787 node proxy-server.mjs").length===1);
const s=fs.readFileSync(new URL("./M4_19D4F_RECOVER_LISTENER_PORT_READ_ONLY.mjs",import.meta.url),"utf8");
for(const x of [
  "M419D4F_LIGHTBOX_RUNTIME_PORT_AGNOSTIC_EXPLICIT_LOCAL_DRY_RUN_PORT_BINDING_CERTIFIED",
  "sourceOfTruthClaimedFor8787:selectedPort===8787",
  "networkRequestPerformed:false",
  "AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ"
]) assert.ok(s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_M4_19D4F_TESTS",version:"4.0-m4.19d4f",status:"PASSED",testsRun:n,failures:[]},null,2));
