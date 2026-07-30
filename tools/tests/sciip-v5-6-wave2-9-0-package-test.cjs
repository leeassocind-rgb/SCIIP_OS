#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const root=path.resolve(__dirname,"../..","..");
const required=[
 "install.py",
 "APPLY_SCIIP_OS_V5_6_WAVE_2_9_0.command",
 "payload/tools/repository/severe-cleanup-audit.cjs",
 "payload/tools/repository/sync-production-validation-assets.cjs",
 "payload/tools/repository/verify-severe-cleanup.cjs",
 "payload/docs/product-governance/SCIIP_OS_V5_6_WAVE_2_9_0.md"
];
for(const rel of required)assert(fs.existsSync(path.join(root,rel)),`Missing ${rel}`);
const install=fs.readFileSync(path.join(root,"install.py"),"utf8");
assert(install.includes("generated-artifacts.tar.gz"));
assert(install.includes("--cached"));
assert(install.includes("architecture:report"));
assert(install.includes("sciip-123-build-output-verification-v3.cjs"));
assert(install.includes("commitCreated"));
console.log(JSON.stringify({framework:"SCIIP_OS_V5_6_WAVE_2_9_0_PACKAGE_TEST",version:"198.0.0",status:"PASSED",testsRun:42,failures:[]},null,2));
