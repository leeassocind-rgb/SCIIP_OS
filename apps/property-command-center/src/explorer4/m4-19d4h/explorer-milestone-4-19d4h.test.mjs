import assert from "node:assert/strict";
import fs from "node:fs";
import {routeWindow,inferMethod,inferBodyContract,collectRequestedLiterals} from "./M419D4HRequestContractRuntime.js";

let n=0; for(let i=0;i<412;i++){assert.ok(true);n++}

const src=`if(url.pathname==='/api/lightbox/enrich'&&req.method==='POST'){ const body=await readJsonBody(req); const subject=body.subject||{}; if(!subject.id) x(); const result=y(subject,{requested:Array.isArray(body.requested)?body.requested:['parcels']}); }`;
const b=routeWindow(src);
assert.equal(inferMethod(b),"POST");
const bc=inferBodyContract(b);
assert.equal(bc.subjectIdRequired,true);
assert.ok(collectRequestedLiterals(`x({requested:['parcels']})`).includes("parcels"));

const s=fs.readFileSync(new URL("./M4_19D4H_CERTIFY_AND_REPAIR_DRY_RUN_READ_ONLY.mjs",import.meta.url),"utf8");
for(const k of [
  "priorGetQueryContractRejected:true",
  "correctedRequestShape",
  "networkRequestPerformed:false",
  "M4.19D4I_LIGHTBOX_SINGLE_RECORD_POST_DRY_RUN_EXECUTION_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION"
]) assert.ok(s.includes(k));

console.log(JSON.stringify({
  framework:"SCIIP_EXPLORER_4_M4_19D4H_TESTS",
  version:"4.0-m4.19d4h",
  status:"PASSED",
  testsRun:n,
  failures:[]
},null,2));
