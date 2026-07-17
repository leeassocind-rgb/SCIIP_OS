const fs=require('fs');
const files=['src/ui/SCIIP_Integration_Sprint4A_Wiring.gs','src/ui/SCIIP_Integration_Sprint4A_Tests.gs'];
const failures=[];
for(const f of files){if(!fs.existsSync(f))failures.push('missing:'+f);}
if(!failures.length){
 const w=fs.readFileSync(files[0],'utf8');
 const t=fs.readFileSync(files[1],'utf8');
 ['registeredQueries','SCIIP_QUERY_ENGINE.register','industrial-intelligence','v7.0-integration-sprint-4a.1'].forEach(x=>{if(!w.includes(x)&&!t.includes(x))failures.push('missing-contract:'+x);});
 if(!t.includes('sciipTestV7IntegrationSprint4A'))failures.push('missing aggregate test');
}
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_4A_QUERY_WIRING_HOTFIX_NODE_TEST',status:failures.length?'FAILED':'PASSED',filesChecked:files.length,failures};
console.log(JSON.stringify(out));if(failures.length)process.exit(1);
