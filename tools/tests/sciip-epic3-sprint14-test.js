#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..'),base=path.join(repo,'src','applications','relationship-intelligence');
const dependencies=[
'SCIIP_Relationship_Intelligence_Engine.gs',
'SCIIP_Network_Intelligence_Engine.gs',
'SCIIP_Enterprise_Relationship_Graph_Engine.gs',
'SCIIP_Autonomous_Opportunity_Discovery_Engine.gs',
'SCIIP_Executive_Opportunity_Command_Engine.gs',
'SCIIP_Opportunity_Workflow_Execution_Engine.gs',
'SCIIP_Execution_Monitoring_Outcome_Intelligence_Engine.gs',
'SCIIP_Adaptive_Opportunity_Learning_Portfolio_Intelligence_Engine.gs',
'SCIIP_Enterprise_Portfolio_Strategy_Capital_Allocation_Engine.gs'];
const missing=dependencies.filter(f=>!fs.existsSync(path.join(base,f)));
if(missing.length){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_3_SPRINT_14_PRODUCTION_HARDENING_INTEGRATION_CERTIFICATION',status:'FAILED',reason:'MISSING_EPIC3_DEPENDENCIES',missing}));process.exit(1);}
const files=['SCIIP_Epic3_Production_Hardening_Integration_Engine.gs','SCIIP_Epic3_Production_Hardening_Integration_Application.gs','SCIIP_Epic3_Production_Hardening_Integration_Persistence.gs','SCIIP_Epic3_Sprint14_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Sprint 14 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic3Sprint14();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
