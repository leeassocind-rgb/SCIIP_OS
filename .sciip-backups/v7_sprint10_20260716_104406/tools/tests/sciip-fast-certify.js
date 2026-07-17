const {spawnSync}=require('child_process');
const steps=[['node',['tools/tests/sciip-integration-sprint2a-test.js']],['node',['tools/tests/sciip-integration-sprint2b-test.js']]];
for(const [cmd,args] of steps){const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}console.log(JSON.stringify({framework:'SCIIP_FAST_CERTIFICATION',status:'PASSED',steps:steps.length}));
