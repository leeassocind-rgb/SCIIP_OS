#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=process.cwd();
cp.execFileSync(process.execPath,['tools/sciip-deployment-compiler.js'],{cwd:root,stdio:'inherit'});
const report=JSON.parse(fs.readFileSync(path.join(root,'dist/reports/deployment-compiler-report.json'),'utf8'));
const failures=[];
if(!report.bundles.length) failures.push('no bundles');
if(!fs.existsSync(path.join(root,'dist/apps-script/appsscript.json'))) failures.push('missing appsscript.json');
const seen=new Set();for(const b of report.bundles)for(const s of b.sources){if(seen.has(s))failures.push('duplicate source '+s);seen.add(s);}
if(seen.size!==report.sourceGsFiles)failures.push(`gs coverage ${seen.size}/${report.sourceGsFiles}`);
const status=failures.length?'FAILED':'PASSED';console.log(JSON.stringify({framework:'SCIIP_DEPLOYMENT_COMPILER_TEST',status,bundles:report.bundles.length,sourceGsFiles:report.sourceGsFiles,failures},null,2));if(failures.length)process.exit(1);
