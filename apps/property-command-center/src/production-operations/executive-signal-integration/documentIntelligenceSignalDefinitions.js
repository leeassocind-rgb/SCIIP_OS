import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';

export const DOCUMENT_INTELLIGENCE_SIGNAL_TYPES = Object.freeze({
  CORPUS_REGISTERED: 'DOCUMENT_INTELLIGENCE_CORPUS_REGISTERED',
  EVIDENCE_READY: 'DOCUMENT_INTELLIGENCE_EVIDENCE_READY',
  REVIEW_REQUIRED: 'DOCUMENT_INTELLIGENCE_REVIEW_REQUIRED'
});

export function registerDocumentIntelligenceSignalTypes() {
  return Object.freeze([
    { type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.CORPUS_REGISTERED, source: 'document-intelligence', description: 'Document corpus registered and classified.', defaultSeverity: 'INFO', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: false, consequential: false },
    { type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.EVIDENCE_READY, source: 'document-intelligence', description: 'Governed document evidence is ready for executive consumption.', defaultSeverity: 'MEDIUM', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: true, consequential: false },
    { type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.REVIEW_REQUIRED, source: 'document-intelligence', description: 'Document classification or evidence requires human review.', defaultSeverity: 'HIGH', schemaVersion: '1.0.0', assignmentScoped: true, propertyScoped: true, consequential: false }
  ].map(registerExecutiveSignalType));
}
