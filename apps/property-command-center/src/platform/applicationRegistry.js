import { PROPERTY_COMMAND_CENTER_APP } from './appManifest.js';

export const SCIIP_APPLICATION_REGISTRY = Object.freeze({
  [PROPERTY_COMMAND_CENTER_APP.id]: PROPERTY_COMMAND_CENTER_APP
});

export function getRegisteredApplication(id) {
  return SCIIP_APPLICATION_REGISTRY[id] || null;
}

export function listRegisteredApplications() {
  return Object.values(SCIIP_APPLICATION_REGISTRY);
}
