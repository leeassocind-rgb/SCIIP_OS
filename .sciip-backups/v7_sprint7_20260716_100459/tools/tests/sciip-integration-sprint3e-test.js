const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=['SCIIP_RiskRegistry.gs','SCIIP_PolicyDecisionEngine.gs','SCIIP_DecisionLedger.gs','SCIIP_DecisionExecutionEngine.gs','SCIIP_GovernanceAssuranceWorkspace.gs','SCIIP_Integration_Sprint3E_Wiring.gs','SCIIP_Integration_Sprint3E_Tests.gs'];
const failures=[];
for(const f of files){const p=path.join(root,'src/ui',f);if(!fs.existsSync(p)){failures.push('Missing '+f);continue;}const t=fs.readFileSync(p,'utf8');if(!t.includes('v7.0-integration-sprint-3e'))failures.push('Version missing '+f);}
const testText=fs.readFileSync(path.join(root,'src/ui/SCIIP_Integration_Sprint3E_Tests.gs'),'utf8');
['sciipTestV7RiskRegistry','sciipTestV7PolicyDecisionEngine','sciipTestV7DecisionLedger','sciipTestV7DecisionExecution','sciipTestV7GovernanceAssurance','sciipTestV7IntegrationSprint3E'].forEach(x=>{if(!testText.includes('function '+x))failures.push('Missing test '+x);});
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_3E_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
