#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');const repo=path.resolve(__dirname,'..','..');
const deps=[path.join(repo,'src','platform','security','SCIIP_Security_Health_Certification.gs'),path.join(repo,'manifests','SCIIP_V7_EPIC4_ENTERPRISE_IDENTITY_SECURITY_MILESTONE.json')];
if(!deps.some(fs.existsSync)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_AI_RUNTIME_MILESTONE',status:'FAILED',reason:'EPIC4_ENTERPRISE_IDENTITY_SECURITY_REQUIRED'}));process.exit(1);}
const base=path.join(repo,'src','platform','ai');const files=['SCIIP_AI_Model_Registry.gs','SCIIP_AI_Prompt_Governance.gs','SCIIP_AI_Context_Memory_Manager.gs','SCIIP_AI_Evidence_Confidence_Service.gs','SCIIP_AI_Cost_Usage_Controller.gs','SCIIP_AI_Approval_Execution_Gateway.gs','SCIIP_AI_Execution_Audit_Persistence.gs','SCIIP_AI_Runtime_Health_Certification.gs','SCIIP_Epic4_AI_Runtime_Application.gs','SCIIP_Epic4_AI_Runtime_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite};vm.createContext(context);for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing AI runtime file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4AIRuntimeMilestone();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
