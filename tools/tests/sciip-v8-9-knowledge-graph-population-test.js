#!/usr/bin/env node
'use strict';
const fs=require('fs'); const assert=require('assert');
const p=process.argv[2]||'reports/supersheets/SCIIP_V8_9_KNOWLEDGE_GRAPH_POPULATION_CERTIFICATION.json';
assert.ok(fs.existsSync(p),'Certification output missing: '+p);
const d=JSON.parse(fs.readFileSync(p,'utf8'));
assert.equal(d.status,'PASSED'); assert.equal(d.result.productionWrites,0); assert.equal(d.result.commitEnabled,false);
assert.ok(d.result.nodes>0); assert.ok(d.result.edges>0); assert.equal(d.result.stewardReview,0);
assert.ok(d.result.nodeTypes.PROPERTY>0); assert.ok(d.result.nodeTypes.LISTING>0); assert.ok(d.result.nodeTypes.OBSERVATION>0);
assert.ok(d.result.relationshipTypes.HAS_LISTING>0); assert.ok(d.result.relationshipTypes.DERIVED_FROM>0);
console.log(JSON.stringify({framework:'SCIIP_V8_9_KNOWLEDGE_GRAPH_TEST',status:'PASSED',testsRun:10}));
