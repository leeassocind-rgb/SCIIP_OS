#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_PlatformRegistry.gs','SCIIP_PlatformAdapters.gs','SCIIP_PlatformSelfAssembly.gs','SCIIP_PlatformCertifier.gs','SCIIP_Integration_Sprint4B_Wiring.gs','SCIIP_Integration_Sprint4B_Tests.gs'];
const services=[],queries=[];
const context={console,Date,JSON,Math,Array,Object,String,Number,Boolean,Error,isFinite,
 SCIIP_QUERY_ENGINE:{register:(n,h)=>{if(!queries.includes(n))queries.push(n);},snapshot:()=>({registeredQueries:queries.slice()})},
 SCIIP_LIVE_RUNTIME:{register:(n,h,o)=>{if(!services.includes(n))services.push(n);},snapshot:()=>({services:services.map(name=>({name}))})},
 SCIIP_APP_EVENTS:{subscribe:()=> 'event-sub'},SCIIP_APP_STATE:{subscribe:()=> 'state-sub'},
 SCIIP_DESKTOP:{WORKSPACES:[]}};
context.global=context;vm.createContext(context);
const failures=[];
for(const f of files){const p=path.join(root,'src/ui',f);if(!fs.existsSync(p)){failures.push('missing:'+f);continue;}try{vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}catch(e){failures.push('load:'+f+':'+e.message);}}
try{const out=context.sciipTestV7IntegrationSprint4B();if(!out||out.status!=='PASSED'||out.testsRun!==5)failures.push('aggregate test invalid');}catch(e){failures.push('runtime:'+e.stack);}
const output={framework:'SCIIP_V7_INTEGRATION_SPRINT_4B_NODE_TEST',version:'v7.0-integration-sprint-4b',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};
console.log(JSON.stringify(output,null,2));if(failures.length)process.exit(1);
