#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..');
const base=path.join(repo,'src','applications','executive-operations-portal');
const files=['SCIIP_Epic6_Executive_Operations_Portal.gs','SCIIP_Epic6_Executive_Operations_Portal_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite,Logger:{log(){}}};
vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Epic 6 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic6ExecutiveOperationsPortal();
console.log(JSON.stringify(result));
if(result.status!=='PASSED')process.exit(1);
