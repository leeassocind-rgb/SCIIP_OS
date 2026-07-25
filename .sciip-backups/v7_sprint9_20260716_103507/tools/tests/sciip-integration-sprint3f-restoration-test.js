const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'../..');
const tests=fs.readFileSync(path.join(root,'src/ui/SCIIP_Integration_Sprint3F_Tests.gs'),'utf8');
const wiring=fs.readFileSync(path.join(root,'src/ui/SCIIP_Integration_Sprint3F_Wiring.gs'),'utf8');
const required=[
 'function sciipTestV7AuditTrail',
 'function sciipTestV7ControlAssurance',
 'function sciipTestV7OperationalResilience',
 'function sciipTestV7ReleaseAssurance',
 'function sciipTestV7ResilienceAssuranceWorkspace',
 'function sciipTestV7IntegrationSprint3F'
];
const missing=required.filter(x=>!tests.includes(x));
if(missing.length)throw new Error('Missing test functions: '+missing.join(', '));
if(!wiring.includes('SCIIP_LIVE_RUNTIME.register'))throw new Error('Correct Live Runtime API missing.');
if(!wiring.includes('servicePresent_'))throw new Error('Service descriptor detection missing.');
console.log(JSON.stringify({framework:'SCIIP_V7_INTEGRATION_SPRINT_3F_TEST_RESTORATION_NODE_TEST',status:'PASSED',functions:required.length}));
