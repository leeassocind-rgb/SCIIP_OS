#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_CapabilityBuilder.gs','SCIIP_UnifiedScoringAnalytics.gs','SCIIP_IndustrialKnowledgeEngine.gs','SCIIP_IndustrialIntelligenceEngines.gs','SCIIP_IndustrialIntelligenceWorkspace.gs','SCIIP_Integration_Sprint4A_Wiring.gs','SCIIP_Integration_Sprint4A_Tests.gs'];
const required=['SCIIP_CAPABILITY_BUILDER','SCIIP_SCORING_ENGINE','SCIIP_ANALYTICS_ENGINE','SCIIP_INDUSTRIAL_KNOWLEDGE_ENGINE','SCIIP_INDUSTRIAL_SUITABILITY_ENGINE','SCIIP_INFRASTRUCTURE_INTELLIGENCE','SCIIP_LABOR_INTELLIGENCE','SCIIP_MARKET_COMPETITIVENESS','SCIIP_TENANT_FIT_ENGINE','SCIIP_INDUSTRIAL_INTELLIGENCE_WORKSPACE','sciipTestV7IntegrationSprint4A'];
let source='',failures=[];for(const f of files){const p=path.join(root,'src/ui',f);if(!fs.existsSync(p)){failures.push('missing '+f);continue;}source+='\n'+fs.readFileSync(p,'utf8');}
for(const s of required)if(!source.includes(s))failures.push('missing symbol '+s);
if(/processor/i.test(files.join(' ')))failures.push('unexpected processor artifact');
try{new Function(source);}catch(e){failures.push('syntax '+e.message);}
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_4A_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
