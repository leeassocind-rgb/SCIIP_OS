#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const names=['SCIIP_ScenarioRegistry.gs','SCIIP_DecisionSimulationEngine.gs','SCIIP_PortfolioOptimizer.gs','SCIIP_ScenarioComparisonEngine.gs','SCIIP_DecisionWorkspace.gs','SCIIP_Integration_Sprint3D_Wiring.gs','SCIIP_Integration_Sprint3D_Tests.gs'];
const failures=[];for(const name of names){const f=path.join(root,'src/ui',name);if(!fs.existsSync(f)){failures.push('Missing '+path.relative(root,f));continue;}try{new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});}catch(e){failures.push(name+': '+e.message);}}
const output={framework:'SCIIP_V7_INTEGRATION_SPRINT_3D_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:names.length,failures};console.log(JSON.stringify(output,null,2));if(failures.length)process.exit(1);
