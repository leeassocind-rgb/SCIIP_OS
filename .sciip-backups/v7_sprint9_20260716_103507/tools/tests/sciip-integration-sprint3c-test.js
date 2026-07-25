#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const names=['SCIIP_DigitalTwinRegistry.gs','SCIIP_MarketTwin.gs','SCIIP_PortfolioIntelligence.gs','SCIIP_TwinSynchronization.gs','SCIIP_OperationalTwinView.gs','SCIIP_Integration_Sprint3C_Wiring.gs','SCIIP_Integration_Sprint3C_Tests.gs'];
const failures=[];for(const name of names){const f=path.join(root,'src/ui',name);if(!fs.existsSync(f)){failures.push('Missing '+path.relative(root,f));continue;}try{new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});}catch(e){failures.push(name+': '+e.message);}}
const output={framework:'SCIIP_V7_INTEGRATION_SPRINT_3C_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:names.length,failures};console.log(JSON.stringify(output,null,2));if(failures.length)process.exit(1);
