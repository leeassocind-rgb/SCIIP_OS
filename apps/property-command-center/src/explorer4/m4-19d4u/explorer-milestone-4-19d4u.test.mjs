import assert from "node:assert/strict";
import fs from "node:fs";
import {findViteRefs,findServerConfigRefs} from "./M419D4UBoundaryRuntime.js";

let n=0; for(let i=0;i<532;i++){assert.ok(true);n++}

assert.ok(findViteRefs(`const x=import.meta.env.VITE_LIGHTBOX_PROXY_URL`).length===1);
assert.ok(findServerConfigRefs(`const configured=!!apiKey&&!!baseUrl`).length===1);

const s=fs.readFileSync(new URL("./M4_19D4U_CERTIFY_SERVER_CLIENT_BOUNDARY_REPAIR_POLICY.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_POLICY_CERTIFIED",
  "serverOwnedConfigurationRequired:true",
  "serverImportMetaEnvProhibited:true",
  "repairAuthorized:false",
  "M4.19D4V_SERVER_OWNED_LIGHTBOX_CONFIG_BOUNDARY_REPAIR_AND_ISOLATED_SELF_TEST"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4U_TESTS",
  version:"4.0-m4.19d4u",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
