#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=process.argv[2]||process.cwd();
const required=["governance/repository-governance-policy.json","tools/sciip-repository-governance.js",".github/workflows/sciip-repository-governance.yml"];
for(const f of required){if(!fs.existsSync(path.join(root,f)))throw new Error("Missing Phase 5 file: "+f);}
cp.execFileSync(process.execPath,[path.join(root,"tools/sciip-repository-governance.js")],{cwd:root,stdio:"inherit"});
console.log(JSON.stringify({status:"PASSED",phase:"v6.1 Phase 5 Repository Governance",requiredFiles:required.length},null,2));
