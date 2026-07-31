import { createExecutiveSignal } from './signalContract.js';

export function createExecutiveSignalBus(options = {}) {
  const maxHistory = Math.max(1, Number(options.maxHistory || 500));
  const subscribers = new Map();
  const history = [];
  let sequence = 0;
  let subscriptionSequence = 0;

  const matches = (filter, signal) => {
    if (!filter) return true;
    if (typeof filter === 'function') return filter(signal);
    if (filter.type && String(filter.type).toUpperCase() !== signal.type) return false;
    if (filter.source && String(filter.source) !== signal.source) return false;
    if (filter.assignmentId && String(filter.assignmentId) !== signal.assignmentId) return false;
    if (filter.severity && String(filter.severity).toUpperCase() !== signal.severity) return false;
    return true;
  };

  const publish = input => {
    const signal = createExecutiveSignal(input);
    const envelope = Object.freeze({ sequence: ++sequence, publishedAt: new Date().toISOString(), signal });
    history.push(envelope);
    if (history.length > maxHistory) history.splice(0, history.length - maxHistory);

    const deliveryErrors = [];
    for (const subscription of subscribers.values()) {
      if (!matches(subscription.filter, signal)) continue;
      try { subscription.handler(signal, envelope); }
      catch (error) { deliveryErrors.push(Object.freeze({ subscriptionId: subscription.id, message: error.message })); }
    }
    return Object.freeze({ envelope, delivered: subscribers.size - deliveryErrors.length, deliveryErrors: Object.freeze(deliveryErrors) });
  };

  const subscribe = (handler, options = {}) => {
    if (typeof handler !== 'function') throw new Error('Executive signal subscriber must be a function');
    const id = options.id || `executive-signal-subscriber-${++subscriptionSequence}`;
    if (subscribers.has(id)) throw new Error(`Executive signal subscriber already exists: ${id}`);
    subscribers.set(id, Object.freeze({ id, handler, filter: options.filter || null }));
    if (options.replay === true) {
      for (const envelope of history) if (matches(options.filter, envelope.signal)) handler(envelope.signal, envelope);
    }
    return () => subscribers.delete(id);
  };

  return Object.freeze({
    publish,
    subscribe,
    readHistory: filter => history.filter(envelope => matches(filter, envelope.signal)),
    metrics: () => Object.freeze({ published: sequence, retained: history.length, subscribers: subscribers.size, maxHistory }),
    clearHistory: () => { history.length = 0; }
  });
}
