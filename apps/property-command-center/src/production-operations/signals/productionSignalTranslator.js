const STATE_TO_SIGNAL = Object.freeze({
  REGISTERED: 'PRODUCTION_BATCH_STARTED',
  CERTIFIED: 'PRODUCTION_BATCH_CERTIFIED',
  FAILED: 'PRODUCTION_BATCH_FAILED',
  REVIEW_REQUIRED: 'PRODUCTION_BATCH_REVIEW_REQUIRED',
  DUPLICATE: 'PRODUCTION_DUPLICATE_DETECTED',
  PROMOTED: 'PRODUCTION_PROMOTION_APPROVED'
});

const severityFor = type => ({
  PRODUCTION_BATCH_FAILED: 'CRITICAL',
  PRODUCTION_BATCH_REVIEW_REQUIRED: 'HIGH',
  PRODUCTION_DUPLICATE_DETECTED: 'MEDIUM'
}[type] || 'INFO');

const deterministicId = (source, event, type) => [
  source.sourceId || source.batchId || 'production-source',
  event.eventId || `${event.from || 'UNKNOWN'}-${event.to || 'UNKNOWN'}`,
  type,
  event.occurredAt || source.updatedAt || source.createdAt || 'undated'
].join(':');

export function translateProductionEvent(source = {}, event = {}) {
  const type = STATE_TO_SIGNAL[String(event.to || '').toUpperCase()];
  if (!type) return null;
  const occurredAt = event.occurredAt || source.updatedAt || source.createdAt || new Date().toISOString();
  return Object.freeze({
    id: deterministicId(source, event, type),
    type,
    source: 'production-operations',
    severity: severityFor(type),
    occurredAt,
    assignmentId: source.assignmentId || null,
    propertyId: source.propertyId || source.projection?.propertyId || null,
    correlationId: source.batchId || source.sourceId || null,
    title: type.replaceAll('_', ' '),
    summary: event.reason || `${source.fileName || source.sourceId || 'Production source'} transitioned to ${event.to}`,
    metrics: {
      rowCount: Number(source.rowCount || 0),
      exceptionCount: Number(source.exceptionCount || 0),
      sizeBytes: Number(source.sizeBytes || 0)
    },
    evidence: [{
      evidenceId: source.evidenceId || null,
      sourceId: source.sourceId || null,
      fileName: source.fileName || null,
      fingerprint: source.fingerprint || null
    }],
    metadata: {
      adapterVersion: '1.0.0',
      productionEvent: { ...event },
      productionStatus: source.status || event.to || null,
      batchId: source.batchId || null,
      sourceId: source.sourceId || null,
      duplicateOf: source.duplicateOf || null,
      reviewStatus: source.reviewStatus || null,
      promotionStatus: source.promotionStatus || null
    }
  });
}

export function translateProductionSourceHistory(source = {}) {
  return Object.freeze((source.events || []).map(event => translateProductionEvent(source, event)).filter(Boolean));
}
