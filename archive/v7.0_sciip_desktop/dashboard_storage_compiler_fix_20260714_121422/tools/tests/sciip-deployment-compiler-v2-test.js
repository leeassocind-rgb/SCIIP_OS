#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=process.cwd(), p=path.join(root,'dist/apps-script/deployment-manifest.json');
if(!fs.existsSync(p)) throw new Error('deployment manifest missing; run deployment:compile first');
const m=JSON.parse(fs.readFileSync(p));
const failures=[];
if(m.status!=='PASSED') failures.push('compiler status');
if(m.deploymentFiles>108) failures.push('deployment file ceiling');
if(m.sourceGsFiles<1) failures.push('source coverage');
if(!m.bundles.every(b=>b.sha256&&b.sources.length)) failures.push('bundle integrity');
if(failures.length){console.error({status:'FAILED',failures});process.exit(1)}
console.log(JSON.stringify({status:'PASSED',version:m.version,bundleFiles:m.bundleFiles,deploymentFiles:m.deploymentFiles,reductionPercent:m.reductionPercent,rebuiltBundles:m.rebuiltBundles,reusedBundles:m.reusedBundles},null,2));
