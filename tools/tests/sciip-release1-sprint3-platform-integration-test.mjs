import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PROPERTY_COMMAND_CENTER_APP, assertPropertyCommandCenterManifest } from '../../apps/property-command-center/src/platform/appManifest.js';
import { getRegisteredApplication, listRegisteredApplications } from '../../apps/property-command-center/src/platform/applicationRegistry.js';
import { parseWorkspaceRoute, serializeWorkspaceRoute } from '../../apps/property-command-center/src/platform/workspaceRouter.js';
import { PLATFORM_EVENTS, createPlatformBridge } from '../../apps/property-command-center/src/platform/platformBridge.js';

const tests = [];
function test(name, fn) { fn(); tests.push({ test: name, status: 'PASSED' }); }

test('ApplicationManifest', () => {
  const result = assertPropertyCommandCenterManifest();
  assert.equal(result.valid, true, result.errors.join('; '));
  assert.equal(PROPERTY_COMMAND_CENTER_APP.status, 'INTEGRATED');
});

test('ApplicationRegistry', () => {
  assert.equal(getRegisteredApplication('property-command-center')?.id, 'property-command-center');
  assert.equal(listRegisteredApplications().length, 1);
});

test('WorkspaceRouteRoundTrip', () => {
  const query = serializeWorkspaceRoute({ nav: 'GIS', assignmentId: 'ASSIGN-100', tab: 'Competition', propertyId: 'P-100' });
  const parsed = parseWorkspaceRoute({ search: query, hash: '' });
  assert.deepEqual(parsed, { nav: 'GIS', assignmentId: 'ASSIGN-100', tab: 'Competition', propertyId: 'P-100' });
});

test('PlatformBridgeContract', () => {
  const bridge = createPlatformBridge(null);
  assert.equal(typeof bridge.announceReady, 'function');
  assert.equal(typeof bridge.publishContext, 'function');
  assert.equal(PLATFORM_EVENTS.READY, 'sciip:application-ready');
});

test('RootDeveloperCommands', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));
  ['property-command-center:install','property-command-center:dev','property-command-center:build','property-command-center:test','property-command-center:certify'].forEach(name => assert.ok(pkg.scripts[name], `Missing ${name}`));
});

test('StandaloneAppPreserved', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../../apps/property-command-center/package.json', import.meta.url)));
  assert.ok(pkg.scripts.dev);
  assert.ok(pkg.scripts.build);
  assert.equal(pkg.version, '13.0.0');
});

console.log(JSON.stringify({
  framework: 'SCIIP_RELEASE_1_SPRINT_3_PLATFORM_INTEGRATION',
  version: 'release-1-sprint-3.0',
  status: 'PASSED',
  testsRun: tests.length,
  failures: [],
  result: {
    applicationId: PROPERTY_COMMAND_CENTER_APP.id,
    applicationStatus: PROPERTY_COMMAND_CENTER_APP.status,
    registeredApplications: listRegisteredApplications().length,
    capabilities: PROPERTY_COMMAND_CENTER_APP.capabilities.length,
    routing: 'GOVERNED',
    platformBridge: 'AVAILABLE',
    standaloneMode: true
  },
  tests
}, null, 2));
