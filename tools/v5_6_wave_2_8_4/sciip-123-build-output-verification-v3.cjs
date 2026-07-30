#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");
const repo=path.resolve(process.argv[2]||process.cwd());
const app=path.join(repo,"apps","property-command-center");
const assets=path.join(app,"dist","assets");
const publicData=path.join(app,"dist","production-validation-data");
const out=path.join(repo,"reports","release-5.6","wave-2.8.4","197.23.0-build-output-verification-v3.json");
const expected=["temporal-intelligence-data.json","canonical-property-identity-data.json","identity-decision-execution-data.json","property-lifecycle-intelligence-data.json","lifecycle-market-outcome-classification-data.json"];
const js=fs.readdirSync(assets).filter(x=>x.endsWith(".js")).map(name=>({name,bytes:fs.statSync(path.join(assets,name)).size})).sort((a,b)=>b.bytes-a.bytes);
const failures=[];
const limit=1.5*1024*1024;
const largest=js[0]?.bytes||0;
if(largest>limit)failures.push("LARGEST_CHUNK_EXCEEDS_1_5_MIB");
if(js.some(x=>x.name.startsWith("domain-production-validation-")&&x.bytes>limit))failures.push("MONOLITHIC_PRODUCTION_VALIDATION_CHUNK_REMAINS");
for(const name of expected)if(!fs.existsSync(path.join(publicData,name)))failures.push(`MISSING_RUNTIME_DATA_ASSET:${name}`);
const result={framework:"SCIIP_V5_6_BUILD_OUTPUT_VERIFICATION_V3",version:"197.23.0",status:failures.length?"FAILED":"PASSED",generatedAt:new Date().toISOString(),result:{javascriptChunks:js.length,largestChunkBytes:largest,largestChunkMiB:Number((largest/1048576).toFixed(3)),policyLimitMiB:1.5,runtimeDataAssets:expected.length,failures,certified:failures.length===0},files:js};
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
