#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..');
const dependencies=[path.join(repo,'src','platform','data','SCIIP_Platform_Core_Health_Certification.gs'),path.join(repo,'manifests','SCIIP_V7_EPIC4_PLATFORM_CORE_MILESTONE.json')];
if(!dependencies.some(fs.existsSync)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_EXECUTION_RUNTIME_MILESTONE',status:'FAILED',reason:'EPIC4_PLATFORM_CORE_REQUIRED'}));process.exit(1);}
const base=path.join(repo,'src','platform','execution');
const files=['SCIIP_Enterprise_Event_Bus.gs','SCIIP_Reliable_Message_Broker.gs','SCIIP_Workflow_Orchestration_Runtime.gs','SCIIP_Governed_Scheduler.gs','SCIIP_Event_Replay_Recovery_Service.gs','SCIIP_Dead_Letter_Recovery_Service.gs','SCIIP_Execution_Audit_Persistence.gs','SCIIP_Execution_Runtime_Health_Certification.gs','SCIIP_Epic4_Execution_Runtime_Application.gs','SCIIP_Epic4_Execution_Runtime_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Execution Runtime file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4ExecutionRuntimeMilestone();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
