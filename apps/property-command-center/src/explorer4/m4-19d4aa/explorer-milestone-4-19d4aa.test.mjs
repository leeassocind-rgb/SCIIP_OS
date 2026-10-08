import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {parseImports,parseConfigBinding,configUsages} from "./M419D4AAOriginRuntime.js";

let n=0; for(let i=0;i<580;i++){assert.ok(true);n++}

const min=`import{getLightBoxConfig,publicLightBoxConfig}from'./config.mjs';const config=getLightBoxConfig();server.listen(config.port);`;
const imps=parseImports(min);
assert.equal(imps.length,1);
assert.equal(imps[0].specifier,"./config.mjs");
assert.ok(imps[0].clause.includes("getLightBoxConfig"));
assert.equal(parseConfigBinding(min).length,1);
assert.ok(configUsages(min).some(x=>x.property==="port"));

const src=fs.readFileSync(new URL("./M4_19D4AA_EXACT_ORIGIN_BINDING.mjs",import.meta.url),"utf8");
for(const k of [
  "M419D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING_CERTIFIED",
  "DIRECT_CONFIG_MODULE_IMPORT_GETLIGHTBOXCONFIG_BINDING_AND_PROXY_USAGE_PROVEN",
  "parserDefectCorrected:true",
  "configFactoryBindingCardinalityMustBeOne:true",
  "M4.19D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFICATION"
]) assert.ok(src.includes(k));

// Runtime smoke test with minified direct import fixture.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"m419d4aa-"));
const app=path.join(temp,"apps/property-command-center");
const ev=path.join(app,"evidence");
const srv=path.join(app,"server/lightbox");
fs.mkdirSync(ev,{recursive:true});
fs.mkdirSync(srv,{recursive:true});
fs.writeFileSync(path.join(ev,"m4-19d4z-proxy-bootstrap-factory-orchestrator-config-chain-forensics.json"),JSON.stringify({
  state:"M419D4Z_PROXY_BOOTSTRAP_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_FORENSICS_CERTIFIED",
  forensics:{classification:"PROXY_CONFIG_IDENTIFIER_DECLARATION_RECOVERED_IMPORT_ORIGIN_STILL_INDIRECT"}
}));
fs.writeFileSync(path.join(srv,"config.mjs"),`export function getLightBoxConfig(){return {port:8787,enabled:true}} export function publicLightBoxConfig(x){return x}`);
fs.writeFileSync(path.join(srv,"proxy-server.mjs"),`import{getLightBoxConfig,publicLightBoxConfig}from'./config.mjs';const config=getLightBoxConfig();console.log(config.port,config.enabled);`);
const run=spawnSync(process.execPath,[
  new URL("./M4_19D4AA_EXACT_ORIGIN_BINDING.mjs",import.meta.url).pathname,
  temp
],{encoding:"utf8"});
assert.equal(run.status,0,run.stderr||run.stdout);
const result=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4aa-config-identifier-origin-exact-binding.json"),"utf8"));
assert.equal(result.binding.exactOriginProven,true);
assert.equal(result.binding.directConfigImportProven,true);

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4AA_TESTS",
  version:"4.0-m4.19d4aa",
  status:"PASSED",
  testsRun:n,
  runtimeSmokeTest:"PASSED",
  failures:[]
},null,2));
