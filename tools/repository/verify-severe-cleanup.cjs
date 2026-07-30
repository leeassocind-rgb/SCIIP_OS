#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const repo=path.resolve(process.argv[2]||process.cwd());
const failures=[];
const forbidden=[
 ".sciip-backups",".sciip_backups","backups","dist","apps/property-command-center/dist",
 "apps/property-command-center/node_modules","reports/supersheets",".sciip-cache","__MACOSX"
];
for(const rel of forbidden)if(fs.existsSync(path.join(repo,rel)))failures.push(`FORBIDDEN_GENERATED_PATH:${rel}`);
const tracked=cp.execFileSync("git",["ls-files"],{cwd:repo,encoding:"utf8"}).split("\n").filter(Boolean);
for(const rel of [".sciip-backups/",".sciip_backups/","backups/","dist/","apps/property-command-center/dist/","apps/property-command-center/public/production-validation-data/"]){
 if(tracked.some(x=>x.startsWith(rel)))failures.push(`GENERATED_PATH_STILL_TRACKED:${rel}`);
}
const required=[
 "apps/property-command-center/src/production-validation/temporal-intelligence-data.json",
 "tools/repository/sync-production-validation-assets.cjs",
 "docs/product-governance/SCIIP_OS_V5_6_WAVE_2_9_0.md"
];
for(const rel of required)if(!fs.existsSync(path.join(repo,rel)))failures.push(`MISSING_REQUIRED_PATH:${rel}`);
const status=failures.length?"FAILED":"PASSED";
const result={framework:"SCIIP_SEVERE_REPOSITORY_CLEANUP_VERIFICATION",version:"198.0.0",status,generatedAt:new Date().toISOString(),result:{failures,certified:!failures.length}};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exit(1);
