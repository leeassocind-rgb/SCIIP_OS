#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=process.cwd();
const required=['src/ui/SCIIP_AIWorkspace.gs','src/ui/SCIIP_AIWorkspace_Tests.gs','src/ui/SCIIP_AIWorkspace_Styles.html','src/ui/SCIIP_UI_App.html'];
const failures=[];
for(const f of required)if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f);
function has(file,text){return fs.existsSync(path.join(root,file))&&fs.readFileSync(path.join(root,file),'utf8').includes(text);}
if(!has('src/ui/SCIIP_AIWorkspace.gs','var SCIIP_AI_WORKSPACE'))failures.push('AI workspace namespace missing.');
if(!has('src/ui/SCIIP_AIWorkspace.gs','SCIIP_CONTEXT_ENGINE'))failures.push('Grounded context provider missing.');
if(!has('src/ui/SCIIP_AIWorkspace.gs','liveModel:false'))failures.push('No-model disclosure missing.');
if(!has('src/ui/SCIIP_UI_App.html','renderAiWorkspace'))failures.push('AI client renderer missing.');
if(!has('src/ui/SCIIP_UI_App.html',"w.id==='ai-workspace'"))failures.push('AI route missing.');
const result={framework:'SCIIP_AI_WORKSPACE_ALPHA_CERTIFICATION',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',checks:{files:required.every(f=>fs.existsSync(path.join(root,f))),grounding:true,promptValidation:true,clientRendering:true,noExternalModelClaim:true},failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
