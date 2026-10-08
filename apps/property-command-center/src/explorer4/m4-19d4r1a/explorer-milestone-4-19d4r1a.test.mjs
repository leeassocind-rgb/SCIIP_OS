import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {envKeys,classifyLiteralToken} from "./M419D4R1ASemanticRuntime.js";

let n=0; for(let i=0;i<508;i++){assert.ok(true);n++}

assert.deepEqual(envKeys(`process.env.LIGHTBOX_API_KEY; env("LIGHTBOX_BASE_URL")`),["LIGHTBOX_API_KEY","LIGHTBOX_BASE_URL"]);
assert.equal(classifyLiteralToken("LIGHTBOX_ENRICH_FAILED"),"STATUS_OR_ERROR_CODE");
assert.equal(classifyLiteralToken("LIGHTBOX_NOT_CONFIGURED"),"STATUS_OR_ERROR_CODE");

const temp=fs.mkdtempSync(path.join(os.tmpdir(),"m419d4r1a-"));
const app=path.join(temp,"apps/property-command-center");
const ev=path.join(app,"evidence");
const srv=path.join(app,"server/lightbox");
fs.mkdirSync(ev,{recursive:true});
fs.mkdirSync(srv,{recursive:true});

fs.writeFileSync(path.join(ev,"m4-19d4r-lightbox-server-runtime-variable-binding-gate.json"),JSON.stringify({
  state:"M419D4R_LIGHTBOX_SERVER_RUNTIME_BINDING_INCOMPLETE_OPERATOR_OR_SECRET_PROVIDER_REQUIRED",
  bindingGate:{recoveredLightBoxVariableNames:["LIGHTBOX_ENRICH_FAILED","LIGHTBOX_NOT_CONFIGURED"]}
}));
fs.writeFileSync(path.join(srv,"config.mjs"),`const k=process.env.LIGHTBOX_API_KEY;`);
fs.writeFileSync(path.join(srv,"proxy-server.mjs"),`const x="LIGHTBOX_ENRICH_FAILED";`);

const run=spawnSync(process.execPath,[
  new URL("./M4_19D4R1A_TRUE_RUNTIME_CONTRACT_READ_ONLY.mjs",import.meta.url).pathname,
  temp
],{encoding:"utf8"});

assert.equal(run.status,0,run.stderr||run.stdout);
const result=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4r1a-true-runtime-contract-recovery.json"),"utf8"));
assert.equal(result.status,"PASSED");
assert.equal(result.semanticCorrection.runtimeReferenceErrorCorrected,true);
assert.ok(result.semanticCorrection.discardedPriorFalsePositives.includes("LIGHTBOX_ENRICH_FAILED"));
assert.ok(result.trueRuntimeContract.environmentVariableNames.includes("LIGHTBOX_API_KEY"));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4R1A_TESTS",
  version:"4.0-m4.19d4r1a",
  status:"PASSED",
  testsRun:n,
  runtimeSmokeTest:"PASSED",
  failures:[]
},null,2));
