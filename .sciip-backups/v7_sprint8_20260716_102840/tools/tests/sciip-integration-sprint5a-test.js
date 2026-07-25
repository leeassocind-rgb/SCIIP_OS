'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=['src/ui/SCIIP_AutonomousMarketMonitor.gs','src/ui/SCIIP_AutonomousIndustrialScoring.gs','src/ui/SCIIP_AutonomousMatchingAndSelection.gs','src/ui/SCIIP_AutonomousExecutiveBriefing.gs','src/ui/SCIIP_Integration_Sprint5A_Wiring.gs','src/ui/SCIIP_Integration_Sprint5A_Tests.gs'];
const required=['SCIIP_AUTONOMOUS_MARKET_MONITOR','SCIIP_CONTINUOUS_PORTFOLIO_SCORING','SCIIP_PREDICTIVE_MARKET_INDICATORS','SCIIP_INDUSTRIAL_SITE_SELECTION','SCIIP_TENANT_COMPANY_MATCHING','SCIIP_EXECUTIVE_BRIEFING_ENGINE','SCIIP_SPRINT5A_AUTONOMOUS_ORCHESTRATOR','sciipTestV7IntegrationSprint5A'];
let failures=[],all='';for(const f of files){const p=path.join(root,f);if(!fs.existsSync(p))failures.push('Missing '+f);else all+='\n'+fs.readFileSync(p,'utf8');}
for(const token of required)if(!all.includes(token))failures.push('Missing token '+token);
if(/Processor\.gs|SCIIP_RUNTIME_PROCESSOR_BASE/.test(all))failures.push('Processor creation detected');
if(!all.includes("externalModelInvoked:false"))failures.push('Deterministic grounding disclosure missing');
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_5A_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
