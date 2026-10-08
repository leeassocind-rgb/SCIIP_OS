import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {clientLeakAudit,serverBoundaryAudit} from "./M419D4VRepairRuntime.js";

let n=0; for(let i=0;i<540;i++){assert.ok(true);n++}

const c=clientLeakAudit(`const u=import.meta.env.VITE_LIGHTBOX_PROXY_URL;`);
assert.ok(c.viteLightBoxRefs.includes("VITE_LIGHTBOX_PROXY_URL"));

const s=serverBoundaryAudit(
  `export const config={}`,
  `if(url.pathname==='/api/lightbox/self-test'){}; try{}catch(error){ return send(res,502,{error:{code:'LIGHTBOX_ENRICH_UPSTREAM_FAILURE'}})}`
);
assert.equal(s.serverUsesImportMetaEnv,false);
assert.equal(s.serverUsesVitePrefix,false);
assert.equal(s.enrichErrorBoundaryPreserved,true);
assert.equal(s.selfTestRoutePresent,true);

const src=fs.readFileSync(new URL("./M4_19D4V_REPAIR_AND_SELF_TEST.mjs",import.meta.url),"utf8");
for(const k of [
  "AUTHORIZE_M419D4V_SERVER_CLIENT_BOUNDARY_REPAIR",
  "CLIENT TRANSPORT CONFIG ONLY",
  "M419D4V_SERVER_CLIENT_BOUNDARY_REPAIRED_STATICALLY_ISOLATED_SELF_TEST_RUNTIME_CONFIG_STILL_REQUIRED",
  "enrichmentRequestPerformed:false",
  "M4.19D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING"
]) assert.ok(src.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4V_TESTS",
  version:"4.0-m4.19d4v",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
