#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=process.cwd(), tool=path.join(root,"tools/sciip-production-certification.js");
if(!fs.existsSync(tool))throw new Error("Missing production certification tool");
cp.execFileSync(process.execPath,[tool,"--profile=foundation"],{cwd:root,stdio:"inherit"});
const report=JSON.parse(fs.readFileSync(path.join(root,"governance/production-certification-foundation.json"),"utf8"));
if(report.status!=="FOUNDATION_CERTIFIED")throw new Error(`Expected FOUNDATION_CERTIFIED, got ${report.status}`);
for(const d of ["runtime","storage","gis","knowledgeGraph","ai","identity","security","deployment"])if(report.domains[d].status!=="CERTIFIED")throw new Error(`${d} not certified`);
for(const d of ["ui","api","performance","recovery"])if(!["CERTIFIED","DEFERRED"].includes(report.domains[d].status))throw new Error(`${d} invalid deferred status`);
console.log(JSON.stringify({status:"PASSED",framework:report.framework,certificateId:report.certificateId,foundationStatus:report.status,productionBlockers:["ui","api","performance","recovery"]},null,2));
