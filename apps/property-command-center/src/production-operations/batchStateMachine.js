export const SOURCE_STATES = Object.freeze([
  'REGISTERED',
  'FINGERPRINTED',
  'EXTRACTED',
  'NORMALIZED',
  'VALIDATED',
  'REVIEW_REQUIRED',
  'CERTIFIED',
  'PROMOTION_READY',
  'PROMOTED'
]);

const TRANSITIONS = Object.freeze({
  REGISTERED: ['FINGERPRINTED', 'FAILED'],
  FINGERPRINTED: ['EXTRACTED', 'DUPLICATE', 'FAILED'],
  EXTRACTED: ['NORMALIZED', 'FAILED'],
  NORMALIZED: ['VALIDATED', 'FAILED'],
  VALIDATED: ['REVIEW_REQUIRED', 'CERTIFIED', 'FAILED'],
  REVIEW_REQUIRED: ['CERTIFIED', 'FAILED'],
  CERTIFIED: ['PROMOTION_READY', 'FAILED'],
  PROMOTION_READY: ['PROMOTED', 'FAILED'],
  PROMOTED: [],
  DUPLICATE: [],
  FAILED: ['REGISTERED']
});

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}

export function transitionSource(source, to, metadata = {}) {
  if (!canTransition(source.status, to)) {
    throw new Error(`Invalid source transition ${source.status} -> ${to}`);
  }
  const occurredAt = metadata.occurredAt || new Date().toISOString();
  const event = Object.freeze({
    eventId: `${source.sourceId}:${source.events.length + 1}`,
    from: source.status,
    to,
    occurredAt,
    actor: metadata.actor || 'SCIIP_SYSTEM',
    reason: metadata.reason || '',
    details: metadata.details || null
  });
  return Object.freeze({
    ...source,
    ...metadata.patch,
    status: to,
    updatedAt: occurredAt,
    events: Object.freeze([...source.events, event])
  });
}
