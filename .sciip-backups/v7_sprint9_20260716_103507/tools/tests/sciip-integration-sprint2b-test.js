const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const files=['src/ui/SCIIP_ActivityTimeline.gs','src/ui/SCIIP_PresenceService.gs','src/ui/SCIIP_ServiceMonitor.gs','src/ui/SCIIP_Integration_Sprint2B_Wiring.gs','src/ui/SCIIP_Integration_Sprint2B_Tests.gs'];
let failures=[];for(const f of files){const p=path.join(root,f);if(!fs.existsSync(p))failures.push('missing '+f);else{try{new vm.Script(fs.readFileSync(p,'utf8'),{filename:f});}catch(e){failures.push(f+': '+e.message);}}}
for(const token of ['SCIIP_ACTIVITY_TIMELINE','SCIIP_PRESENCE_SERVICE','SCIIP_SERVICE_MONITOR','sciipTestV7IntegrationSprint2B'])if(!files.some(f=>fs.existsSync(path.join(root,f))&&fs.readFileSync(path.join(root,f),'utf8').includes(token)))failures.push('missing contract '+token);
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_2B_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
