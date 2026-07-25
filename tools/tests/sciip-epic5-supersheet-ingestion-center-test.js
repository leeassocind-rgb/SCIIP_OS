const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'src/applications/property-command-center/SCIIP_Epic5_SuperSheet_Ingestion_Center.gs');
if(!fs.existsSync(file)) throw new Error('Missing ingestion center source');
const logs=[]; const ctx={console:{log:x=>logs.push(x)},Date}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=ctx.sciipTestV7Epic5SuperSheetIngestionCenter();
if(r.status!=='PASSED') throw new Error(JSON.stringify(r));
console.log(JSON.stringify(r));
