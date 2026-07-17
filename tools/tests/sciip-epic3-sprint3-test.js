#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=['src/applications/industrial-data-platform/SCIIP_Industrial_AI_Copilot.gs','src/applications/industrial-data-platform/SCIIP_Epic3_Sprint3_Tests.gs'];
const logs=[];const context={console:{log:v=>logs.push(String(v))}};vm.createContext(context);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
const r=context.sciipTestV7Epic3Sprint3IndustrialAICopilot();if(r.status!=='PASSED'){console.error(JSON.stringify(r,null,2));process.exit(1);}console.log(JSON.stringify({framework:'SCIIP_EPIC_3_SPRINT_3_NODE_TEST',status:'PASSED',testsRun:r.testsRun,failures:r.failures,result:r.result},null,2));
