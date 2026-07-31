import { createExecutiveSignal } from '../../executive-signals/signalContract.js';
import { KNOWLEDGE_GRAPH_SIGNAL_TYPES } from './knowledgeGraphSignalDefinitions.js';

const evidenceFromProjection = projection => Object.freeze([
  Object.freeze({
    id: `graph-projection:${projection.signalId}`,
    type: 'KNOWLEDGE_GRAPH_PROJECTION',
    source: 'enterprise-knowledge-graph',
    entitiesProjected: projection.entitiesProjected,
    relationshipsAppended: projection.relationshipsAppended
  })
]);

export function mapKnowledgeGraphProjectionToExecutiveSignals({ inputSignal, projection, graphRuntime }) {
  const signals = [];
  const common = {
    source: 'enterprise-knowledge-graph',
    assignmentId: inputSignal.assignmentId,
    propertyId: inputSignal.propertyId,
    correlationId: inputSignal.correlationId || inputSignal.id,
    occurredAt: inputSignal.occurredAt,
    evidence: evidenceFromProjection(projection),
    metadata: {
      sourceSignalId: inputSignal.id,
      graphStatus: graphRuntime.status,
      appendOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    }
  };

  signals.push(createExecutiveSignal({
    ...common,
    id: `knowledge-graph:${inputSignal.id}:relationship-expanded`,
    type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.RELATIONSHIP_EXPANDED,
    severity: 'INFO',
    title: 'Knowledge graph relationship set expanded',
    summary: `${projection.entitiesProjected} entities and ${projection.relationshipsAppended} new relationships were projected.`,
    metrics: {
      entitiesProjected: projection.entitiesProjected,
      relationshipsAppended: projection.relationshipsAppended,
      duplicateRelationships: projection.duplicateRelationships
    }
  }));

  const crossDomain = Boolean(inputSignal.assignmentId && inputSignal.propertyId) ||
    projection.entitiesProjected >= 5;
  if (crossDomain) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `knowledge-graph:${inputSignal.id}:cross-domain-correlation`,
      type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.CROSS_DOMAIN_CORRELATION,
      severity: inputSignal.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      title: 'Cross-domain graph correlation available',
      summary: 'Executive signal evidence now connects source, type, assignment, property, and evidence context.',
      metrics: {
        entitiesProjected: projection.entitiesProjected,
        relationshipsAppended: projection.relationshipsAppended
      },
      actions: [{ type: 'REVIEW_GRAPH_CONTEXT', advisoryOnly: true }]
    }));
  }

  const reviewRequired = inputSignal.severity === 'HIGH' || inputSignal.severity === 'CRITICAL' ||
    projection.duplicateRelationships > 0;
  if (reviewRequired) {
    signals.push(createExecutiveSignal({
      ...common,
      id: `knowledge-graph:${inputSignal.id}:review-required`,
      type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.REVIEW_REQUIRED,
      severity: inputSignal.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      title: 'Knowledge graph review required',
      summary: 'Signal severity or duplicate graph lineage requires human review.',
      metrics: {
        sourceSignalSeverity: inputSignal.severity,
        duplicateRelationships: projection.duplicateRelationships
      },
      actions: [{ type: 'HUMAN_GRAPH_REVIEW', autonomous: false }]
    }));
  }

  return Object.freeze(signals);
}
