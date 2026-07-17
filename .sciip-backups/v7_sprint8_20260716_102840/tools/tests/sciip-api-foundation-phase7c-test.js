#!/usr/bin/env node
'use strict';
const cp=require('child_process'),path=require('path');
const root=process.cwd();
cp.execFileSync(process.execPath,[path.join(root,'tools/sciip-api-certification.js')],{cwd:root,stdio:'inherit'});
const report=require(path.join(root,'governance/api-certification.json'));
if(report.status!=='PASSED') throw new Error('API certification did not pass.');
console.log(JSON.stringify({status:'PASSED',phase:'7C',apiVersion:'v1',failClosedAuthentication:true},null,2));
