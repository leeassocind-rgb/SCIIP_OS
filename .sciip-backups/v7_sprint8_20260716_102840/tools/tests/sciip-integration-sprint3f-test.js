#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_AuditTrail.gs','SCIIP_ControlAssuranceEngine.gs','SCIIP_OperationalResilienceEngine.gs','SCIIP_ReleaseAssuranceEngine.gs','SCIIP_ResilienceAssuranceWorkspace.gs','SCIIP_Integration_Sprint3F_Wiring.gs','SCIIP_Integration_Sprint3F_Tests.gs'];
const failures=[];
for(const f of files){const p=path.join(root,'src/ui',f);if(!fs.existsSync(p)){failures.push('Missing '+f);continue;}try{new vm.Script(fs.readFileSync(p,'utf8'),{filename:f});}catch(e){failures.push(f+': '+e.message);}}
const forbidden=['SCIIP_RUNTIME_PROCESSOR_BASE','function sciipRun'];
for(const f of files){const p=path.join(root,'src/ui',f);if(!fs.existsSync(p))continue;const t=fs.readFileSync(p,'utf8');for(const token of forbidden)if(t.includes(token))failures.push(f+' contains forbidden processor token '+token);}
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_3F_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};
console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
