#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const required=[
'outputs/sprint27h-governed-replay/governed-replay-certification.json',
'outputs/sprint27h-governed-replay/historical-event-ledger.json',
'outputs/sprint27h-governed-replay/canonical-property-registry.json',
'outputs/sprint27h-governed-replay/historical-knowledge-graph.json',
'outputs/sprint27h-governed-replay/historical-digital-twin.json',
'outputs/sprint27h-governed-replay/replay-reconciliation-report.json',
'outputs/sprint27h-governed-replay/production-promotion-gate.json'];
const missing=required.filter(p=>!fs.existsSync(path.resolve(p)));let failures=missing.map(p=>'MISSING:'+p);
if(!missing.length){const r=JSON.parse(fs.readFileSync(required[0],'utf8'));if(r.status!=='REPLAY_CERTIFIED')failures.push('NOT_REPLAY_CERTIFIED');if(!r.productionReady)failures.push('NOT_PRODUCTION_READY');if(r.governance.canonicalWrites!==0||r.governance.commitEnabled!==false)failures.push('GOVERNANCE_CONTRACT_FAILED');}
const dist='dist/apps-script';if(fs.existsSync(dist)){const found=fs.readdirSync(dist).some(f=>fs.readFileSync(path.join(dist,f),'utf8').includes('sciipTestV9Sprint27HGovernedHistoricalPromotionReplay'));if(!found)failures.push('COMPILED_CERTIFICATION_FUNCTION_MISSING');}
const out={framework:'SCIIP_V9_SPRINT27H_GOVERNED_REPLAY_VERIFICATION',status:failures.length?'FAILED':'PASSED',checks:required.length+4,failures};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
