#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_WorkflowEngine.gs','SCIIP_ApprovalEngine.gs','SCIIP_TaskRouter.gs','SCIIP_WorkflowAutomation.gs','SCIIP_Integration_Sprint3B_Wiring.gs','SCIIP_Integration_Sprint3B_Tests.gs'].map(f=>path.join(root,'src/ui',f));
const failures=[];for(const f of files){if(!fs.existsSync(f)){failures.push('Missing '+path.relative(root,f));continue;}try{new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});}catch(e){failures.push(path.basename(f)+': '+e.message);}}
const output={framework:'SCIIP_V7_INTEGRATION_SPRINT_3B_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(output,null,2));if(failures.length)process.exit(1);
