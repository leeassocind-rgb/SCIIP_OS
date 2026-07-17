#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..'),base=path.join(repo,'src','applications','relationship-intelligence');
const files=['SCIIP_Enterprise_Portfolio_Strategy_Capital_Allocation_Engine.gs','SCIIP_Enterprise_Portfolio_Strategy_Capital_Allocation_Application.gs','SCIIP_Enterprise_Portfolio_Strategy_Capital_Allocation_Persistence.gs','SCIIP_Epic3_Sprint13_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Sprint 13 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic3Sprint13();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
