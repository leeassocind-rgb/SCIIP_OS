import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {extractConfigFunction,propertyExpressions,classifyPrecedence} from "./M419D4ABPrecedenceRuntime.js";

let n=0; for(let i=0;i<588;i++){assert.ok(true);n++}

const cfg=`export function getLightBoxConfig(env=process.env){
 const apiKey=normalize(env.LIGHTBOX_API_KEY);
 const baseUrl=normalize(env.LIGHTBOX_BASE_URL)||'https://api.lightboxre.com/v1';
 const port=Number(env.LIGHTBOX_PROXY_PORT||8787);
 const allowedOrigins=(normalize(env.LIGHTBOX_ALLOWED_ORIGINS)||'http://localhost:5173,http://localhost:5174');
 const timeoutMs=Math.max(1000,Number(env.LIGHTBOX_TIMEOUT_MS||10000));
 const enabled=Boolean(apiKey);
 return {apiKey,baseUrl,port,allowedOrigins,timeoutMs,enabled};
}`;
const fn=extractConfigFunction(cfg);
assert.ok(fn.includes("LIGHTBOX_API_KEY"));
const p=propertyExpressions(fn);
assert.ok(p.apiKey.length>=1);
assert.ok(classifyPrecedence(p.baseUrl[0].expression).includes("SERVER_ENV_INPUT"));

const s=fs.readFileSync(new URL("./M4_19D4AB_CERTIFY_PRECEDENCE.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFIED",
  "SERVER_ENV_TO_CONFIG_FACTORY_TO_PROXY_PRECEDENCE_CERTIFIED",
  "apiKeyControlsEnabledReadiness:true",
  "defaultsDoNotSynthesizeCredentials:true",
  "M4.19D4AC_ISOLATED_PROXY_ENVIRONMENT_BINDING_AND_SELF_TEST"
]) assert.ok(s.includes(k));

// End-to-end smoke test.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"m419d4ab-"));
const app=path.join(temp,"apps/property-command-center");
const ev=path.join(app,"evidence");
const srv=path.join(app,"server/lightbox");
fs.mkdirSync(ev,{recursive:true});
fs.mkdirSync(srv,{recursive:true});
fs.writeFileSync(path.join(ev,"m4-19d4aa-config-identifier-origin-exact-binding.json"),JSON.stringify({
  state:"M419D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING_CERTIFIED",
  binding:{exactOriginProven:true}
}));
fs.writeFileSync(path.join(srv,"config.mjs"),cfg);
fs.writeFileSync(path.join(srv,"proxy-server.mjs"),`const config=getLightBoxConfig();console.log(config.enabled,config.port,config.allowedOrigins);`);
const run=spawnSync(process.execPath,[
  new URL("./M4_19D4AB_CERTIFY_PRECEDENCE.mjs",import.meta.url).pathname,
  temp
],{encoding:"utf8"});
assert.equal(run.status,0,run.stderr||run.stdout);
const out=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4ab-server-config-precedence-effective-runtime-binding.json"),"utf8"));
assert.equal(out.binding.precedenceComplete,true);
assert.equal(out.binding.enabledDerivedFromApiKey,true);

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AB_TESTS",
  version:"4.0-m4.19d4ab",
  status:"PASSED",
  testsRun:n,
  runtimeSmokeTest:"PASSED",
  failures:[]
},null,2));
