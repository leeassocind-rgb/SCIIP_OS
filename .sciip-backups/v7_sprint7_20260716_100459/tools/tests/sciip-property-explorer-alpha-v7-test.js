#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const required=['src/ui/SCIIP_PropertyExplorer.gs','src/ui/SCIIP_PropertyExplorer_Tests.gs','src/ui/SCIIP_UI_App.html','src/ui/SCIIP_PropertyExplorer_Styles.html'];
const failures=[];
for(const f of required){if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f);}
function has(f,s){return fs.existsSync(path.join(root,f))&&fs.readFileSync(path.join(root,f),'utf8').includes(s);}
if(!has('src/ui/SCIIP_PropertyExplorer.gs','sciipPropertyExplorerSearch'))failures.push('Search entry point missing');
if(!has('src/ui/SCIIP_UI_App.html','renderPropertyExplorer'))failures.push('Property Explorer client renderer missing');
if(!has('src/ui/SCIIP_PropertyExplorer_Tests.gs','sciipTestPropertyExplorerAlphaV7'))failures.push('Apps Script test missing');
const result={framework:'SCIIP_PROPERTY_EXPLORER_ALPHA_CERTIFICATION',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
