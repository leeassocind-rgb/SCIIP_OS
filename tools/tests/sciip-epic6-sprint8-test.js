const fs=require('fs');const vm=require('vm');const path=require('path');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'src/applications/executive-operations/SCIIP_Epic6_Executive_Leasing_Tenant_Pipeline_Revenue_Operations.gs');
const logs=[];const sandbox={console,Date,Math,JSON,isFinite,Logger:{log:v=>logs.push(String(v))},Utilities:{getUuid:(()=>{let i=0;return()=>`00000000-0000-0000-0000-${String(++i).padStart(12,'0')}`;})()}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const out=sandbox.sciipTestV7Epic6ExecutiveLeasingTenantPipelineRevenueOperations();
if(!out||out.status!=='PASSED')throw new Error(JSON.stringify(out));
if(!logs.length||!logs[0].includes('SCIIP_V7_EPIC6_SPRINT8'))throw new Error('Certification Logger output missing.');
console.log(JSON.stringify(out));
