const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..'); const files=['SCIIP_IDP_Canonical_Industrial_Schema.gs','SCIIP_IDP_Import_Intelligence.gs','SCIIP_IDP_Import_Preview_Service.gs'];
const ctx={console};vm.createContext(ctx);for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,'src/applications/industrial-data-platform',f),'utf8'),ctx,{filename:f});
const values=[['Property Address','City','Building SF','Land Acres','Clear Ht','APN'],['2125 W Lowell St','Rialto','664,859','40.2','42','0132'],['2125 W Lowell St','Rialto','664,859','40.2','42','0132']];
const p=ctx.SCIIP_IDP_PREVIEW_V7.preview(values,{}); const failures=[]; if(p.status!=='READY_FOR_REVIEW')failures.push('status'); if(p.rows!==2)failures.push('rows'); if(p.counts.duplicates!==1)failures.push('duplicate'); if(!p.mapping.mapping.clearHeight)failures.push('mapping');
const out={framework:'SCIIP_EPIC1_FOUNDATION_NODE_TEST',status:failures.length?'FAILED':'PASSED',testsRun:4,failures,preview:{source:p.source.sourceType,rows:p.rows,duplicates:p.counts.duplicates}};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
