const freeze = value => Object.freeze({ ...(value || {}) });

export function registerExecutiveSignalOntology(ontology) {
  const terms = [
    { term: 'ExecutiveSignal', description: 'Governed executive signal projected into the enterprise graph.' },
    { term: 'SignalSource', description: 'Domain or runtime that originated an executive signal.' },
    { term: 'SignalType', description: 'Registered executive signal classification.' },
    { term: 'Assignment', description: 'Governed assignment scope.' },
    { term: 'Property', description: 'Governed property scope.' },
    { term: 'EVIDENCED_BY', description: 'Relationship connecting graph knowledge to supporting evidence.' },
    { term: 'EMITTED_BY', description: 'Relationship connecting a signal to its originating source.' },
    { term: 'CLASSIFIED_AS', description: 'Relationship connecting a signal to its registered type.' },
    { term: 'SCOPED_TO', description: 'Relationship connecting a signal to assignment or property scope.' }
  ];
  return Object.freeze(terms.map(term => ontology.register(term)));
}

export function projectExecutiveSignalToKnowledgeGraph(graphRuntime, signal) {
  if (!graphRuntime?.entities || !graphRuntime?.relationships || !graphRuntime?.ontology) {
    throw new Error('Enterprise Knowledge Graph runtime is required');
  }
  if (!signal?.id || !signal?.type || !signal?.source) throw new Error('Valid executive signal is required');

  registerExecutiveSignalOntology(graphRuntime.ontology);

  const entityIds = [];
  const relationshipResults = [];
  const signalEntity = graphRuntime.entities.upsert({
    id: signal.id,
    type: 'ExecutiveSignal',
    signalType: signal.type,
    source: signal.source,
    severity: signal.severity,
    status: signal.status,
    occurredAt: signal.occurredAt,
    title: signal.title,
    summary: signal.summary,
    correlationId: signal.correlationId,
    immutable: true
  });
  entityIds.push(signalEntity.id);

  const sourceId = `signal-source:${signal.source}`;
  graphRuntime.entities.upsert({ id: sourceId, type: 'SignalSource', name: signal.source });
  entityIds.push(sourceId);
  relationshipResults.push(graphRuntime.relationships.append({
    from: signal.id, to: sourceId, type: 'EMITTED_BY', immutable: true
  }));

  const typeId = `signal-type:${signal.type}`;
  graphRuntime.entities.upsert({ id: typeId, type: 'SignalType', name: signal.type });
  entityIds.push(typeId);
  relationshipResults.push(graphRuntime.relationships.append({
    from: signal.id, to: typeId, type: 'CLASSIFIED_AS', immutable: true
  }));

  if (signal.assignmentId) {
    const assignmentId = `assignment:${signal.assignmentId}`;
    graphRuntime.entities.upsert({ id: assignmentId, type: 'Assignment', assignmentId: signal.assignmentId });
    entityIds.push(assignmentId);
    relationshipResults.push(graphRuntime.relationships.append({
      from: signal.id, to: assignmentId, type: 'SCOPED_TO', scope: 'ASSIGNMENT', immutable: true
    }));
  }

  if (signal.propertyId) {
    const propertyId = `property:${signal.propertyId}`;
    graphRuntime.entities.upsert({ id: propertyId, type: 'Property', propertyId: signal.propertyId });
    entityIds.push(propertyId);
    relationshipResults.push(graphRuntime.relationships.append({
      from: signal.id, to: propertyId, type: 'SCOPED_TO', scope: 'PROPERTY', immutable: true
    }));
  }

  for (const item of signal.evidence || []) {
    if (!item?.id) continue;
    const evidenceId = `evidence:${item.id}`;
    graphRuntime.entities.upsert({
      id: evidenceId,
      type: 'EvidenceArtifact',
      evidenceType: item.type || 'UNKNOWN',
      source: item.source || signal.source,
      immutable: true
    });
    entityIds.push(evidenceId);
    relationshipResults.push(graphRuntime.relationships.append({
      from: signal.id, to: evidenceId, type: 'EVIDENCED_BY', immutable: true
    }));
  }

  return freeze({
    signalId: signal.id,
    entitiesProjected: new Set(entityIds).size,
    relationshipsAppended: relationshipResults.filter(result => result.status === 'APPENDED').length,
    duplicateRelationships: relationshipResults.filter(result => result.status === 'DUPLICATE_SAFE').length,
    entityIds: Object.freeze([...new Set(entityIds)]),
    readOnly: true,
    appendOnly: true,
    autonomousConsequentialActions: 'BLOCKED'
  });
}
