const freeze = value => Object.freeze(value);
const clean = value => String(value ?? '').trim().toUpperCase();

export function stitchCrossSuperSheetRelationships({records=[]}={}) {
  const nodes = new Map();
  const edges = new Map();
  const unresolved = [];

  const addNode = (id, type, label, source) => {
    if (!id) return null;
    const key = `${type}:${id}`;
    if (!nodes.has(key)) {
      nodes.set(key, freeze({
        id:key,
        entityId:id,
        type,
        label:label||id,
        sources:freeze([source].filter(Boolean))
      }));
    }
    return key;
  };

  const addEdge = (from, to, type, evidence) => {
    if (!from || !to) return;
    const id = `${from}|${type}|${to}`;
    if (!edges.has(id)) edges.set(id, freeze({id, from, to, type, evidence:freeze(evidence||{})}));
  };

  for (const record of records) {
    const source = record.sourceFile || record.source || 'UNKNOWN';
    const propertyId = clean(record.canonicalPropertyId || record.propertyId);
    const tenantId = clean(record.tenantId || record.companyId || record.tenantName);
    const eventId = clean(record.eventId || record.activityId);
    const compId = clean(record.compId || record.transactionId);

    const propertyNode = addNode(propertyId, 'PROPERTY', record.address || propertyId, source);
    const tenantNode = addNode(tenantId, 'TENANT', record.tenantName || tenantId, source);
    const eventNode = addNode(eventId, 'EVENT', record.eventType || eventId, source);
    const compNode = addNode(compId, 'TRANSACTION', record.compType || compId, source);

    if (tenantNode && propertyNode) addEdge(tenantNode, propertyNode, 'OCCUPIES_OR_TARGETS', {source});
    if (eventNode && propertyNode) addEdge(eventNode, propertyNode, 'AFFECTS_PROPERTY', {source, date:record.eventDate||null});
    if (compNode && propertyNode) addEdge(compNode, propertyNode, 'TRANSACTED_PROPERTY', {source, date:record.transactionDate||null});

    if (!propertyNode && (tenantNode || eventNode || compNode)) {
      unresolved.push(freeze({sourceRecordId:record.id||null, reason:'MISSING_PROPERTY_IDENTITY', source}));
    }
  }

  return freeze({
    nodes:freeze([...nodes.values()]),
    edges:freeze([...edges.values()]),
    unresolved:freeze(unresolved),
    nodeCount:nodes.size,
    edgeCount:edges.size,
    unresolvedCount:unresolved.length,
    duplicateSafe:true,
    sourceMutationAllowed:false
  });
}
