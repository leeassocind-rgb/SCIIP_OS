const definitions = new Map();
const history = [];
const normalizeType = value => String(value || '').trim().toUpperCase();
const record = (event, payload) => history.push(Object.freeze({
  sequence: history.length + 1,
  event,
  payload: Object.freeze({ ...payload }),
  recordedAt: new Date().toISOString()
}));

export function registerExecutiveSignalType(input = {}) {
  const type = normalizeType(input.type);
  if (!type) throw new Error('Executive signal type is required');
  const source = String(input.source || '').trim();
  if (!source) throw new Error(`Executive signal source is required for ${type}`);

  const definition = Object.freeze({
    type,
    source,
    description: String(input.description || type.replaceAll('_', ' ')).trim(),
    defaultSeverity: String(input.defaultSeverity || 'INFO').toUpperCase(),
    schemaVersion: String(input.schemaVersion || '1.0.0'),
    assignmentScoped: input.assignmentScoped !== false,
    propertyScoped: input.propertyScoped === true,
    consequential: input.consequential === true,
    metadata: Object.freeze({ ...(input.metadata || {}) })
  });

  const current = definitions.get(type);
  if (current && current.schemaVersion === definition.schemaVersion && current.source === definition.source) return current;
  definitions.set(type, definition);
  record(current ? 'SIGNAL_TYPE_UPDATED' : 'SIGNAL_TYPE_REGISTERED', { type, source, schemaVersion: definition.schemaVersion });
  return definition;
}

export function getExecutiveSignalType(type) {
  return definitions.get(normalizeType(type)) || null;
}

export function listExecutiveSignalTypes() {
  return [...definitions.values()].sort((a, b) => a.type.localeCompare(b.type));
}

export function readExecutiveSignalRegistryHistory() {
  return [...history];
}

export function resetExecutiveSignalRegistry() {
  definitions.clear();
  history.length = 0;
}
