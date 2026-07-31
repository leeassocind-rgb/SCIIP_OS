export const EXECUTIVE_SIGNAL_VERSION = '1.0.0';

export const EXECUTIVE_SIGNAL_SEVERITIES = Object.freeze([
  'INFO',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
]);

export const EXECUTIVE_SIGNAL_STATUSES = Object.freeze([
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'DISMISSED'
]);

const severitySet = new Set(EXECUTIVE_SIGNAL_SEVERITIES);
const statusSet = new Set(EXECUTIVE_SIGNAL_STATUSES);
const requiredText = (value, field) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`Executive signal ${field} is required`);
  return normalized;
};
const optionalText = value => value == null ? null : String(value).trim() || null;
const freezeRecord = value => Object.freeze({ ...(value || {}) });
const freezeArray = value => Object.freeze(Array.isArray(value) ? [...value] : []);

export function createExecutiveSignal(input = {}) {
  const type = requiredText(input.type, 'type').toUpperCase();
  const source = requiredText(input.source, 'source');
  const severity = String(input.severity || 'INFO').toUpperCase();
  const status = String(input.status || 'OPEN').toUpperCase();
  if (!severitySet.has(severity)) throw new Error(`Unsupported executive signal severity: ${severity}`);
  if (!statusSet.has(status)) throw new Error(`Unsupported executive signal status: ${status}`);

  const occurredAt = input.occurredAt || new Date().toISOString();
  if (Number.isNaN(Date.parse(occurredAt))) throw new Error('Executive signal occurredAt must be an ISO-compatible timestamp');

  const id = optionalText(input.id) || `${source}:${type}:${occurredAt}:${Math.random().toString(36).slice(2, 10)}`;
  return Object.freeze({
    version: EXECUTIVE_SIGNAL_VERSION,
    id,
    type,
    source,
    severity,
    status,
    occurredAt: new Date(occurredAt).toISOString(),
    assignmentId: optionalText(input.assignmentId),
    propertyId: optionalText(input.propertyId),
    correlationId: optionalText(input.correlationId),
    title: optionalText(input.title) || type.replaceAll('_', ' '),
    summary: optionalText(input.summary),
    metrics: freezeRecord(input.metrics),
    evidence: freezeArray(input.evidence).map(item => freezeRecord(item)),
    actions: freezeArray(input.actions).map(item => freezeRecord(item)),
    metadata: freezeRecord(input.metadata)
  });
}

export function validateExecutiveSignal(input = {}) {
  try {
    const signal = createExecutiveSignal(input);
    return Object.freeze({ valid: true, errors: Object.freeze([]), signal });
  } catch (error) {
    return Object.freeze({ valid: false, errors: Object.freeze([error.message]), signal: null });
  }
}
