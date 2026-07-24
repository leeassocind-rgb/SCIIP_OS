#!/usr/bin/env node
'use strict';
const fs=require('fs');
const p=process.argv[2]; if(!p) throw new Error('Usage: node test.js <certification.json>');
const d=JSON.parse(fs.readFileSync(p,'utf8'));
const checks=[d.status==='PASSED',d.testsRun===160,d.failures.length===0,d.result.workspacesIntegrated===5,d.result.digitalTwins===4,d.result.synchronizedTwins===4,d.result.aiGroundedResponses===true,d.result.productionWrites===0,d.result.commitEnabled===false,d.gates.every(g=>g.passed)];
if(checks.some(x=>!x)){console.error(JSON.stringify({status:'FAILED',checks}));process.exit(1);} console.log(JSON.stringify({status:'PASSED',tests:checks.length,certification:p}));
