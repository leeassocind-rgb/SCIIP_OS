#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_SemanticSearch.gs','SCIIP_EvidenceEngine.gs','SCIIP_RecommendationEngine.gs','SCIIP_IntelligenceEngine.gs','SCIIP_Integration_Sprint3A_Wiring.gs','SCIIP_Integration_Sprint3A_Tests.gs'].map(f=>path.join(root,'src/ui',f));
const failures=[];
for(const file of files){if(!fs.existsSync(file)){failures.push('Missing '+path.relative(root,file));continue;}try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});}catch(e){failures.push(path.basename(file)+': '+e.message);}}
const required=['SCIIP_SEMANTIC_SEARCH','SCIIP_EVIDENCE_ENGINE','SCIIP_RECOMMENDATION_ENGINE','SCIIP_INTELLIGENCE_ENGINE','sciipTestV7IntegrationSprint3A'];
const joined=files.filter(fs.existsSync).map(f=>fs.readFileSync(f,'utf8')).join('\n');for(const token of required)if(!joined.includes(token))failures.push('Missing contract '+token);
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_3A_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
