const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'src/applications/executive-operations/SCIIP_Epic6_Executive_Portfolio_Operations.gs');
const ctx={console,Date,Math,JSON,isFinite};vm.createContext(ctx);vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=ctx.sciipTestV7Epic6ExecutivePortfolioOperations();console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED'||r.testsRun!==10)process.exit(1);
