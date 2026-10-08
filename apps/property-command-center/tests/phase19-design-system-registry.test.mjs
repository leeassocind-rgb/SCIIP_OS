import assert from 'node:assert/strict';
import {
  SCIIP_DESIGN_SYSTEM,
  assertDesignSystemRegistry
} from '../src/design-system/registry/designSystemRegistry.js';

let testsRun = 0;
const test = condition => {
  testsRun += 1;
  assert.ok(condition);
};

const result = assertDesignSystemRegistry();

test(result.valid);
test(result.componentCount === 6);
test(result.layoutPrimitiveCount === 3);
test(SCIIP_DESIGN_SYSTEM.version === '1.0.0-foundations');
test(SCIIP_DESIGN_SYSTEM.accessibility.minimumTouchTargetPx === 44);
test(SCIIP_DESIGN_SYSTEM.status === 'FOUNDATION_READY');

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE19_DESIGN_SYSTEM_REGISTRY',
  status: 'PASSED',
  testsRun,
  result
}, null, 2));
