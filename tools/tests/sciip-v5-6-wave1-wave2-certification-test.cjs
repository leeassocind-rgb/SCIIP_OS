
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

const base = path.join(__dirname, '..', 'v5_6');
const processors = [
'sciip-41-capability-registry.cjs','sciip-42-executive-command-center.cjs','sciip-43-global-command-palette.cjs',
'sciip-44-executive-morning-brief.cjs','sciip-45-portfolio-health.cjs','sciip-46-decision-approval-queue.cjs',
'sciip-47-opportunity-risk-feed.cjs','sciip-48-executive-timeline.cjs','sciip-49-property-digital-twin-foundation.cjs',
'sciip-50-executive-experience-certification.cjs','sciip-51-knowledge-graph-explorer.cjs','sciip-52-evidence-inspector.cjs',
'sciip-53-graph-search-filtering.cjs','sciip-54-graph-time-navigation.cjs','sciip-55-gis-intelligence-studio.cjs',
'sciip-56-gis-layer-registry.cjs','sciip-57-industrial-market-workspace.cjs','sciip-58-comparable-event-explorer.cjs',
'sciip-59-frontend-performance-foundation.cjs','sciip-60-wave1-wave2-enterprise-certification.cjs'
];

const repo = fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-'));
fs.mkdirSync(path.join(repo,'reports','release-5.5'),{recursive:true});
fs.writeFileSync(path.join(repo,'reports','release-5.5','fixture.json'), JSON.stringify({
  properties:[
    {propertyId:'P-1',address:'100 Industrial Way',city:'Rialto',latitude:34.1,longitude:-117.3},
    {propertyId:'P-2',address:'200 Logistics Ave',city:'Perris',latitude:33.8,longitude:-117.2}
  ],
  relationships:[
    {edgeId:'E-1',from:'P-1',to:'EV-1',type:'SUPPORTED_BY',evidenceId:'EV-1',confidence:1,temporal:true},
    {edgeId:'E-2',from:'P-2',to:'EV-2',type:'SUPPORTED_BY',evidenceId:'EV-2',confidence:0.9,temporal:true}
  ],
  recommendations:[{recommendationId:'R-1',propertyId:'P-1',score:88,evidenceId:'EV-1'}],
  events:[{eventId:'EV-1',propertyId:'P-1',eventType:'LEASE',generatedAt:'2026-07-29T00:00:00Z'}]
}));

let testsRun = 0;
const failures = [];
for (const file of processors) {
  try {
    const mod = require(path.join(base,file));
    const report = mod.run(repo);
    assert.equal(report.status,'PASSED');
    assert.ok(report.framework);
    assert.ok(report.version);
    assert.ok(report.generatedAt);
    const outDir = path.join(repo,'reports','release-5.6');
    fs.mkdirSync(outDir,{recursive:true});
    fs.writeFileSync(path.join(outDir, report.version+'.json'), JSON.stringify(report));
    testsRun += 5;
  } catch (e) {
    failures.push({file,error:String(e.stack||e)});
  }
}
const ui = path.join(__dirname,'..','..','apps','property-command-center','src','components','v5_6','ExecutiveIntelligencePlatform.jsx');
try {
  const text = fs.readFileSync(ui,'utf8');
  assert.ok(text.includes('Executive Intelligence Platform'));
  assert.ok(text.includes('Human Approval'));
  testsRun += 10;
} catch(e){ failures.push({file:'UI',error:String(e.stack||e)}); }

const result = {framework:'SCIIP_OS_V5_6_WAVE_1_2_CERTIFICATION',version:'196.60.0',status:failures.length?'FAILED':'PASSED',testsRun,failures};
console.log(JSON.stringify(result,null,2));
if (failures.length) process.exit(1);
