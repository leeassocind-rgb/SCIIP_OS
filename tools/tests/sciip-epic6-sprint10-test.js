const fs=require('fs'),vm=require('vm'),path=require('path');
const file=path.resolve(__dirname,'../../src/applications/executive-operations/SCIIP_Epic6_Executive_Operations_Command_Center_Release_Certification.gs');
const sandbox={console,Date,Math,JSON,isFinite,Logger:{log:()=>{}},Utilities:{getUuid:()=>Math.random().toString(36).slice(2)+Date.now().toString(36)}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const result=sandbox.sciipTestV7Epic6ExecutiveOperationsIntegrationCommandCenterReleaseCertification();
console.log(JSON.stringify(result));
if(!result||result.status!=='PASSED'||result.testsRun!==10||result.result.releaseStatus!=='CERTIFIED')process.exit(1);
