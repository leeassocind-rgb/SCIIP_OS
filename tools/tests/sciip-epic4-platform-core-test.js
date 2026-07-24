#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..');
const dependency=path.join(repo,'src','platform','services','SCIIP_Unified_Platform_Service_Registry.gs');
if(!fs.existsSync(dependency)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_PLATFORM_CORE_MILESTONE',status:'FAILED',reason:'EPIC4_SPRINT1_REQUIRED',missing:path.basename(dependency)}));process.exit(1);}
const base=path.join(repo,'src','platform','data');
const files=['SCIIP_Unified_Data_Access_Layer.gs','SCIIP_Repository_Registry.gs','SCIIP_Transaction_Coordinator.gs','SCIIP_Query_Planner.gs','SCIIP_Cache_Manager.gs','SCIIP_Storage_Provider_Abstraction.gs','SCIIP_Cross_Source_Federation_Service.gs','SCIIP_Platform_Core_Health_Certification.gs','SCIIP_Epic4_Platform_Core_Application.gs','SCIIP_Epic4_Platform_Core_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Platform Core file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4PlatformCoreMilestone();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
