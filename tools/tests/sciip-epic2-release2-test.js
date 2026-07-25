const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const core=fs.readFileSync(path.join(root,'src/applications/industrial-data-platform/SCIIP_Historical_Supersheet_Migration.gs'),'utf8');
const ctx={console,Date,JSON,Math,Session:{getActiveUser:()=>({getEmail:()=> 'test@sciip.local'})},SpreadsheetApp:{getActiveSpreadsheet:()=>null}};
vm.createContext(ctx);vm.runInContext(core,ctx);
const sample=[
 {fileId:'F3',name:'Survey 2026-06-21',mimeType:'application/vnd.google-apps.spreadsheet',modifiedAt:'2026-06-21T00:00:00.000Z'},
 {fileId:'F1',name:'Survey 2026-06-07',mimeType:'application/vnd.google-apps.spreadsheet',modifiedAt:'2026-06-07T00:00:00.000Z'},
 {fileId:'F2',name:'Survey 2026-06-14',mimeType:'text/csv',modifiedAt:'2026-06-14T00:00:00.000Z'}
];
const plan=ctx.SCIIP_HISTORICAL_MIGRATION_V7.planWaves(sample,2);
const app=fs.readFileSync(path.join(root,'src/ui/SCIIP_Application.gs'),'utf8');
const html=fs.readFileSync(path.join(root,'src/ui/SCIIP_Application_Shell.html'),'utf8');
const checks=[
 ['chronological',plan.waves[0].files[0].fileId==='F1'],
 ['waves',plan.waveCount===2&&plan.fileCount===3],
 ['reviewRequired',ctx.SCIIP_HISTORICAL_MIGRATION_V7.snapshot().commitMode==='REVIEW_REQUIRED'],
 ['applicationVersion',app.includes("v7.0-epic2-release2.0")],
 ['certificationWrapper',fs.readFileSync(path.join(root,'src/applications/industrial-data-platform/SCIIP_Epic2_Release2_Tests.gs'),'utf8').includes('sciipTestV7Epic2Release1SCIIPApplication')],
 ['folderConsole',html.includes('registerFolder')&&html.includes('Google Drive folder ID')],
 ['noAutoCommit',core.includes('destructiveCommitEnabled:false')]
];
const failures=checks.filter(x=>!x[1]).map(x=>x[0]);
const out={framework:'SCIIP_EPIC_2_RELEASE_2_NODE_TEST',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures,result:{files:plan.fileCount,waves:plan.waveCount,chronological:true,reviewRequired:true}};
console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
