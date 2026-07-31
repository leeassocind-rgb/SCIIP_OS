import crypto from 'node:crypto';

const stableId = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

export function createObservation({
  entityId,
  fieldName,
  value,
  observedAt,
  effectiveFrom,
  effectiveTo = null,
  sourceEvidenceId,
  confidence = 0.70,
  unit = null
} = {}) {
  const canonicalObservedAt = observedAt || new Date().toISOString();
  const key = [
    entityId, fieldName, JSON.stringify(value), canonicalObservedAt,
    effectiveFrom || '', effectiveTo || '', sourceEvidenceId || ''
  ].join('|');

  return {
    observationId: stableId('OBS', key),
    entityId: entityId || null,
    fieldName: fieldName || null,
    value: value ?? null,
    unit,
    observedAt: canonicalObservedAt,
    effectiveFrom: effectiveFrom || canonicalObservedAt,
    effectiveTo,
    sourceEvidenceId: sourceEvidenceId || null,
    confidence,
    temporalStatus: 'ACTIVE',
    ledgerMode: 'APPEND_ONLY',
    commitStatus: 'NOT_COMMITTED'
  };
}

export function observationsFromStructuredExtraction(records = [], now = new Date().toISOString()) {
  const observations = [];
  for (const record of records) {
    for (const field of record.fields || []) {
      if (field.normalizedValue === null || field.normalizedValue === undefined) continue;
      observations.push(createObservation({
        entityId: record.candidatePropertyId || null,
        fieldName: field.fieldName,
        value: field.normalizedValue,
        observedAt: now,
        sourceEvidenceId: record.evidenceId,
        confidence: field.confidence
      }));
    }
  }
  return observations;
}
