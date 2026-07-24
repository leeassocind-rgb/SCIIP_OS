#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(__dirname,'..','..');
const deps=[path.join(repo,'src','platform','execution','SCIIP_Execution_Runtime_Health_Certification.gs'),path.join(repo,'manifests','SCIIP_V7_EPIC4_EXECUTION_RUNTIME_MILESTONE.json')];
if(!deps.some(fs.existsSync)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_ENTERPRISE_IDENTITY_SECURITY_MILESTONE',status:'FAILED',reason:'EPIC4_EXECUTION_RUNTIME_REQUIRED'}));process.exit(1);}
const base=path.join(repo,'src','platform','security');
const files=['SCIIP_Identity_Registry.gs','SCIIP_Role_Based_Access_Control.gs','SCIIP_Service_Identity_Manager.gs','SCIIP_Security_Policy_Engine.gs','SCIIP_Approval_Governance_Service.gs','SCIIP_Session_Token_Manager.gs','SCIIP_Security_Audit_Persistence.gs','SCIIP_Security_Health_Certification.gs','SCIIP_Epic4_Enterprise_Identity_Security_Application.gs','SCIIP_Epic4_Enterprise_Identity_Security_Tests.gs'];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite};vm.createContext(context);
for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing security file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4EnterpriseIdentitySecurityMilestone();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
