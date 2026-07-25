#!/usr/bin/env node
'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'../..');
const files=[
  'src/applications/industrial-data-platform/SCIIP_Canonical_Industrial_Knowledge_Model.gs',
  'src/applications/industrial-data-platform/SCIIP_Epic2_Release4_Tests.gs'
];
const logs=[];
const context={console:{log:v=>logs.push(String(v))}};
vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const result=context.sciipTestV7Epic2Release4CanonicalIndustrialKnowledgeModel();
if(result.status!=='PASSED')process.exit(1);
console.log(JSON.stringify({framework:'SCIIP_EPIC_2_RELEASE_4_NODE_TEST',status:'PASSED',testsRun:8,failures:[],result:result.result},null,2));
