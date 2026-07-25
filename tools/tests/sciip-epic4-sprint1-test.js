#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..');
const dependency=path.join(repo,'src','applications','relationship-intelligence','SCIIP_Epic3_Production_Hardening_Integration_Engine.gs');
if(!fs.existsSync(dependency)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_SPRINT_1_UNIFIED_PLATFORM_SERVICES_FOUNDATION',status:'FAILED',reason:'EPIC3_PRODUCTION_CERTIFICATION_REQUIRED',missing:path.basename(dependency)}));process.exit(1);}
const base=path.join(repo,'src','platform','services');
const files=['SCIIP_Unified_Platform_Service_Registry.gs','SCIIP_Unified_Platform_Command_Query_Bus.gs','SCIIP_Unified_Platform_Context_Evidence_Service.gs','SCIIP_Unified_Platform_Health_Governance_Service.gs','SCIIP_Unified_Platform_Audit_Persistence.gs','SCIIP_Epic4_Sprint1_Unified_Platform_Application.gs','SCIIP_Epic4_Sprint1_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Epic 4 Sprint 1 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4Sprint1();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
