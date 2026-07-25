#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..'),base=path.join(repo,'src','applications','relationship-intelligence');
const files=['SCIIP_Opportunity_Workflow_Execution_Engine.gs','SCIIP_Opportunity_Workflow_Execution_Application.gs','SCIIP_Opportunity_Workflow_Execution_Persistence.gs','SCIIP_Epic3_Sprint10_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Sprint 10 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic3Sprint10();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
