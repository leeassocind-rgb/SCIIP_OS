import { PROPERTY_COMMAND_CENTER_APP } from './appManifest.js';

export const PLATFORM_EVENTS = Object.freeze({
  READY: 'sciip:application-ready',
  CONTEXT_CHANGED: 'sciip:context-changed',
  NAVIGATE: 'sciip:navigate',
  COMMAND: 'sciip:command'
});

function dispatch(target, name, detail) {
  if (!target?.dispatchEvent || typeof CustomEvent === 'undefined') return false;
  return target.dispatchEvent(new CustomEvent(name, { detail }));
}

export function createPlatformBridge(target = typeof window !== 'undefined' ? window : null) {
  const listeners = new Map();
  return Object.freeze({
    announceReady(context = {}) {
      return dispatch(target, PLATFORM_EVENTS.READY, { application: PROPERTY_COMMAND_CENTER_APP, context });
    },
    publishContext(context = {}) {
      return dispatch(target, PLATFORM_EVENTS.CONTEXT_CHANGED, { applicationId: PROPERTY_COMMAND_CENTER_APP.id, context });
    },
    navigate(destination = {}) {
      return dispatch(target, PLATFORM_EVENTS.NAVIGATE, { applicationId: PROPERTY_COMMAND_CENTER_APP.id, destination });
    },
    subscribe(eventName, handler) {
      if (!target?.addEventListener || typeof handler !== 'function') return () => {};
      const wrapped = event => handler(event.detail || {});
      target.addEventListener(eventName, wrapped);
      listeners.set(handler, [eventName, wrapped]);
      return () => {
        const current = listeners.get(handler);
        if (current) target.removeEventListener(current[0], current[1]);
        listeners.delete(handler);
      };
    }
  });
}
