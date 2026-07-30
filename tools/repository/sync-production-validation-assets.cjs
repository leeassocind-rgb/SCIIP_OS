#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const repo=path.resolve(process.argv[2]||path.resolve(__dirname,"../.."));
const source=path.join(repo,"apps","property-command-center","src","production-validation");
const dest=path.join(repo,"apps","property-command-center","public","production-validation-data");
const names=[
 "temporal-intelligence-data.json",
 "canonical-property-identity-data.json",
 "identity-decision-execution-data.json",
 "property-lifecycle-intelligence-data.json",
 "lifecycle-market-outcome-classification-data.json"
];
fs.mkdirSync(dest,{recursive:true});
const assets=[];
for(const name of names){
 const from=path.join(source,name),to=path.join(dest,name);
 if(!fs.existsSync(from))throw new Error(`Missing authoritative dataset: ${from}`);
 fs.copyFileSync(from,to);
 assets.push({name,bytes:fs.statSync(to).size,sha256:crypto.createHash("sha256").update(fs.readFileSync(to)).digest("hex")});
}
console.log(JSON.stringify({framework:"SCIIP_PRODUCTION_VALIDATION_ASSET_SYNC",version:"198.0.0",status:"PASSED",assets},null,2));
