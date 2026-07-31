export const PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS = Object.freeze([
  { type: 'PRODUCTION_BATCH_STARTED', source: 'production-operations', defaultSeverity: 'INFO', assignmentScoped: true, consequential: false },
  { type: 'PRODUCTION_BATCH_CERTIFIED', source: 'production-operations', defaultSeverity: 'INFO', assignmentScoped: true, consequential: true },
  { type: 'PRODUCTION_BATCH_FAILED', source: 'production-operations', defaultSeverity: 'CRITICAL', assignmentScoped: true, consequential: true },
  { type: 'PRODUCTION_BATCH_REVIEW_REQUIRED', source: 'production-operations', defaultSeverity: 'HIGH', assignmentScoped: true, consequential: true },
  { type: 'PRODUCTION_DUPLICATE_DETECTED', source: 'production-operations', defaultSeverity: 'MEDIUM', assignmentScoped: true, consequential: false },
  { type: 'PRODUCTION_PROMOTION_APPROVED', source: 'production-operations', defaultSeverity: 'INFO', assignmentScoped: true, consequential: true }
].map(definition => Object.freeze({
  description: definition.type.replaceAll('_', ' '),
  schemaVersion: '1.0.0',
  propertyScoped: false,
  metadata: Object.freeze({ domain: 'production-operations', adapter: 'production-signal-adapter' }),
  ...definition
})));
