import assert from'node:assert/strict';
const src=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');
assert.equal(typeof src.buildIntelligenceGapEngine,'function');
console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_M2_21G1',status:'PASSED',testsRun:1}));
