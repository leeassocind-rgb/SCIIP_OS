import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';

export const KNOWLEDGE_GRAPH_SIGNAL_TYPES = Object.freeze({
  RELATIONSHIP_EXPANDED: 'KNOWLEDGE_GRAPH_RELATIONSHIP_EXPANDED',
  CROSS_DOMAIN_CORRELATION: 'KNOWLEDGE_GRAPH_CROSS_DOMAIN_CORRELATION',
  REVIEW_REQUIRED: 'KNOWLEDGE_GRAPH_REVIEW_REQUIRED'
});

export function registerKnowledgeGraphSignalTypes() {
  const definitions = [
    {
      type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.RELATIONSHIP_EXPANDED,
      source: 'enterprise-knowledge-graph',
      description: 'Executive signal projection expanded the governed enterprise knowledge graph.',
      defaultSeverity: 'INFO',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.CROSS_DOMAIN_CORRELATION,
      source: 'enterprise-knowledge-graph',
      description: 'The graph identified a cross-domain relationship supported by executive signal evidence.',
      defaultSeverity: 'MEDIUM',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    },
    {
      type: KNOWLEDGE_GRAPH_SIGNAL_TYPES.REVIEW_REQUIRED,
      source: 'enterprise-knowledge-graph',
      description: 'Graph evidence or lineage requires executive review.',
      defaultSeverity: 'HIGH',
      schemaVersion: '1.0.0',
      assignmentScoped: true,
      propertyScoped: true,
      consequential: false
    }
  ];
  return Object.freeze(definitions.map(registerExecutiveSignalType));
}
