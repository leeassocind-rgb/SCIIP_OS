export const PROPERTY_COMMAND_CENTER_APP = Object.freeze({
  id: 'property-command-center',
  name: 'Property Command Center',
  version: '13.0.0',
  release: 'Release 1 Sprint 3',
  route: '/apps/property-command-center',
  entrypoint: 'apps/property-command-center/index.html',
  status: 'INTEGRATED',
  standalone: true,
  capabilities: Object.freeze([
    'assignment-context',
    'workspace-routing',
    'property-context',
    'supersheet-review',
    'persistent-workspace-memory',
    'platform-event-bridge'
  ])
});

export function assertPropertyCommandCenterManifest() {
  const errors = [];
  if (!PROPERTY_COMMAND_CENTER_APP.id) errors.push('Missing application id');
  if (!PROPERTY_COMMAND_CENTER_APP.route.startsWith('/')) errors.push('Application route must be absolute');
  if (!PROPERTY_COMMAND_CENTER_APP.entrypoint.endsWith('index.html')) errors.push('Entrypoint must resolve to index.html');
  if (!PROPERTY_COMMAND_CENTER_APP.capabilities.includes('platform-event-bridge')) errors.push('Platform event bridge capability is required');
  return { valid: errors.length === 0, errors, application: PROPERTY_COMMAND_CENTER_APP };
}
