import assert from 'node:assert/strict';
import {
  PHASE19_PRIMARY_NAVIGATION,
  PHASE19_DISCLOSURE_LEVELS,
  classifyWorkspaceForPhase19,
  assertPhase19NavigationModel
} from '../src/product/navigation/phase19NavigationModel.js';

let testsRun = 0;
const test = condition => {
  testsRun += 1;
  assert.ok(condition);
};

const result = assertPhase19NavigationModel();

test(result.valid);
test(result.primaryDestinationCount === 8);
test(PHASE19_PRIMARY_NAVIGATION[0].label === 'Home');
test(PHASE19_PRIMARY_NAVIGATION.at(-1).label === 'Administration');
test(classifyWorkspaceForPhase19('Production Operations Command Center') === PHASE19_DISCLOSURE_LEVELS.ADMINISTRATIVE);
test(classifyWorkspaceForPhase19('Property Overview') === PHASE19_DISCLOSURE_LEVELS.CONTEXTUAL);
test(classifyWorkspaceForPhase19('Morning Brief') === PHASE19_DISCLOSURE_LEVELS.PRIMARY);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE19_NAVIGATION_MODEL',
  status: 'PASSED',
  testsRun,
  result
}, null, 2));
