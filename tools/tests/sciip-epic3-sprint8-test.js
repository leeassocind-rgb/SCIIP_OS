#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..'),base=path.join(repo,'src','applications','relationship-intelligence');
const files=['SCIIP_Autonomous_Opportunity_Discovery_Engine.gs','SCIIP_Autonomous_Opportunity_Discovery_Application.gs','SCIIP_Autonomous_Opportunity_Discovery_Persistence.gs','SCIIP_Epic3_Sprint8_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Sprint 8 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic3Sprint8();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
