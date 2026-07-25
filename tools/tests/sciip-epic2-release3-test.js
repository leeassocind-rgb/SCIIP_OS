'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=['src/applications/industrial-data-platform/SCIIP_Universal_Industrial_Import_Engine.gs','src/applications/industrial-data-platform/SCIIP_Epic2_Release3_Tests.gs'];
const ctx={console};vm.createContext(ctx);files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f}));
const r=ctx.sciipTestV7Epic2Release3UniversalIndustrialImportEngine();
if(r.status!=='PASSED')process.exit(1);
console.log(JSON.stringify({framework:'SCIIP_EPIC_2_RELEASE_3_NODE_TEST',status:'PASSED',testsRun:r.testsRun,failures:[],result:r.result},null,2));
