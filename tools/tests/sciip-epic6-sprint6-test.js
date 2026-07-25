const fs = require('fs');
const vm = require('vm');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname,'../../src/applications/executive-operations/SCIIP_Epic6_Executive_Portfolio_Optimization_Capital_Allocation.gs'),'utf8');
let seq=0;
const context = {
  console,
  Date,
  Math,
  JSON,
  isFinite,
  Utilities:{getUuid:()=>`00000000-0000-0000-0000-${String(++seq).padStart(12,'0')}`},
  Logger:{log:(x)=>console.log(x)}
};
vm.createContext(context);
vm.runInContext(source,context);
const out=context.sciipTestV7Epic6ExecutivePortfolioOptimizationCapitalAllocation();
if(out.status!=='PASSED'){
  console.error(JSON.stringify(out,null,2));
  process.exit(1);
}
console.log(JSON.stringify({framework:out.framework,version:out.version,status:out.status,testsRun:out.testsRun,result:out.result}));
