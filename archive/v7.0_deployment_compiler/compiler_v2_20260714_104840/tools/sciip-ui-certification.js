#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');const ROOT=process.cwd();
const policy=JSON.parse(fs.readFileSync(path.join(ROOT,'governance/ui-certification-policy.json'),'utf8'));const failures=[];
for(const f of policy.requiredFiles)if(!fs.existsSync(path.join(ROOT,f)))failures.push('missing:'+f);
function read(f){try{return fs.readFileSync(path.join(ROOT,f),'utf8')}catch(_){return''}}
const gs=read('src/ui/SCIIP_UI_Foundation.gs'),html=read('src/ui/SCIIP_UI_Shell.html'),css=read('src/ui/SCIIP_UI_Styles.html'),app=read('src/ui/SCIIP_UI_App.html');
const checks={applicationShell:/app-shell/.test(html),navigation:/Primary navigation/.test(html)&&/data-view/.test(app),apiBinding:/SCIIP_API/.test(gs),authenticationHandoff:/authentication:\{mode:'HANDOFF'/.test(gs),responsive:/@media\(max-width:700px\)/.test(css),accessibility:/skip-link/.test(html)&&/aria-live/.test(html)&&/focus-visible/.test(css),loadingState:/data-state="loading"/.test(html),errorState:/errorState/.test(html),emptyState:/emptyState/.test(html),htmlService:/HtmlService\.createTemplateFromFile/.test(gs),views:(gs.match(/status:'FOUNDATION'/g)||[]).length>=policy.minimumViews};
for(const [k,v] of Object.entries(checks))if(!v)failures.push('check:'+k);
const body={framework:'SCIIP_UI_CERTIFICATION',version:policy.version,status:failures.length?'FAILED':'PASSED',certifiedAt:new Date().toISOString(),checks,failures};body.certificateId=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0,24).toUpperCase();
fs.writeFileSync(path.join(ROOT,'governance/ui-certification.json'),JSON.stringify(body,null,2)+'\n');console.log(JSON.stringify(body,null,2));if(failures.length)process.exit(1);
