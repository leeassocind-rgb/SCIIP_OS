'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'src/applications/property-command-center/SCIIP_Epic5_Approved_Commit_Refresh_Engine.gs');
const code=fs.readFileSync(file,'utf8');
const logs=[]; const context={console:{log:x=>logs.push(String(x))},Date,JSON,Math};
vm.createContext(context); vm.runInContext(code,context,{filename:file});
const result=context.sciipTestV7Epic5ApprovedCommitRefresh();
if(!result||result.status!=='PASSED'){console.error(JSON.stringify(result));process.exit(1);} console.log(JSON.stringify(result));
