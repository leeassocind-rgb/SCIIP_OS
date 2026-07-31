import { createExecutiveSignal } from '../../executive-signals/signalContract.js';
import { DOCUMENT_INTELLIGENCE_SIGNAL_TYPES } from './documentIntelligenceSignalDefinitions.js';

export function mapDocumentIntelligenceToExecutiveSignals({ operationId, assignmentId, propertyId, occurredAt, corpus, classifications, evidenceRecords }) {
  const common = {
    source: 'document-intelligence',
    assignmentId,
    propertyId,
    correlationId: operationId,
    occurredAt,
    metadata: { appendOnlyEvidence: true, graphCommitEnabled: false, autonomousConsequentialActions: 'BLOCKED' }
  };
  const signals = [createExecutiveSignal({
    ...common,
    id: `document-intelligence:${operationId}:corpus`,
    type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.CORPUS_REGISTERED,
    severity: 'INFO',
    title: 'Document corpus registered',
    summary: `${corpus.sourceCount} sources registered; ${corpus.supportedCount} supported.`,
    metrics: { sourceCount: corpus.sourceCount, supportedCount: corpus.supportedCount, duplicates: corpus.duplicates || 0 },
    evidence: [{ id: `corpus:${operationId}`, type: 'CORPUS_REGISTRATION', source: 'document-intelligence' }]
  })];

  if (evidenceRecords.length) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `document-intelligence:${operationId}:evidence-ready`,
      type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.EVIDENCE_READY,
      severity: 'MEDIUM',
      title: 'Document evidence ready',
      summary: `${evidenceRecords.length} append-only evidence records are available.`,
      metrics: { evidenceRecords: evidenceRecords.length },
      evidence: evidenceRecords.map(item => ({ id: item.evidenceId, type: 'DOCUMENT_EVIDENCE', source: 'document-intelligence' }))
    }));
  }

  const reviewCount = classifications.filter(item => item.reviewRequired).length;
  if (reviewCount || corpus.supportedCount < corpus.sourceCount) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `document-intelligence:${operationId}:review`,
      type: DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.REVIEW_REQUIRED,
      severity: 'HIGH',
      title: 'Document intelligence review required',
      summary: `${reviewCount} classifications require human review.`,
      metrics: { reviewCount, unsupportedCount: corpus.sourceCount - corpus.supportedCount },
      evidence: [{ id: `classification:${operationId}`, type: 'CLASSIFICATION_SUMMARY', source: 'document-intelligence' }],
      actions: [{ type: 'HUMAN_DOCUMENT_REVIEW', autonomous: false }]
    }));
  }
  return Object.freeze(signals);
}
