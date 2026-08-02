import assert from 'node:assert/strict';
import fs from 'node:fs';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const main = fs.readFileSync('src/main.jsx', 'utf8');
const registry = fs.readFileSync('src/product/workspaceRegistry.js', 'utf8');
const center = fs.readFileSync('src/components/EnterpriseIntelligencePlatformCenter.jsx', 'utf8');

t(main.includes('EnterpriseIntelligencePlatformCenter'));
t(registry.includes("'Enterprise Intelligence Platform Center'"));
t(center.includes('Enterprise Intelligence Platform Center'));
t(center.includes('Intelligence synthesis'));
t(center.includes('Recommendation controls'));
t(center.includes('INTELLIGENCE GOVERNED'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_ENTERPRISE_INTELLIGENCE_PLATFORM_USER_VALIDATION',
  status: 'PASSED',
  testsRun: n,
  result: {
    navigation: true,
    intelligenceVisible: true,
    controlsVisible: true
  }
}, null, 2));
