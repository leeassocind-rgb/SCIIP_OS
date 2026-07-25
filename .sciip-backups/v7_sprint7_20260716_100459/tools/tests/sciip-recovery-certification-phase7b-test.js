#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,"../..");
const out=cp.execFileSync(process.execPath,[path.join(root,"tools/sciip-recovery-certification.js")],{cwd:root,encoding:"utf8"});
const result=JSON.parse(out);
const evidence=JSON.parse(fs.readFileSync(path.join(root,"governance/recovery-certification.json"),"utf8"));
if(result.status!=="PASSED"||evidence.status!=="PASSED")throw new Error("Recovery certification did not pass");
if(!evidence.checks.restoreRoundTrip.ok)throw new Error("Restore round trip not certified");
console.log(JSON.stringify({status:"PASSED",certificateId:evidence.certificateId,recoverableFiles:evidence.recoverableFiles},null,2));
