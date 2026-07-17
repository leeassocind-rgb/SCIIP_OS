const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'../..');
const wiring=fs.readFileSync(path.join(root,'src/ui/SCIIP_Integration_Sprint3F_Wiring.gs'),'utf8');
const tests=fs.readFileSync(path.join(root,'src/ui/SCIIP_Integration_Sprint3F_Tests.gs'),'utf8');
const failures=[];
[
  ['uses register API',/SCIIP_LIVE_RUNTIME\.register\(/.test(wiring)],
  ['supports object service snapshots',/item\.name===name/.test(wiring)],
  ['verifies service registration',/servicePresent_\(s2,SERVICE_NAME\)/.test(wiring)],
  ['reports hotfix version',/v7\.0-integration-sprint-3f\.1/.test(tests)],
  ['reports live runtime api',/liveRuntimeApi/.test(tests)]
].forEach(([name,ok])=>{if(!ok)failures.push(name);});
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_3F_LIVE_RUNTIME_REGISTRATION_HOTFIX_NODE_TEST',status:failures.length?'FAILED':'PASSED',testsRun:5,failures};
console.log(JSON.stringify(out));
if(failures.length)process.exit(1);
