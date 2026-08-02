const freeze = value => Object.freeze(value);

export function reasonAcrossDomains({ question, domains = [], relationships = [], maximumHops = 4 } = {}) {
  if (!question) throw new Error('question is required');

  const domainMap = new Map(domains.map(domain => [domain.id, domain]));
  const adjacency = new Map();
  for (const relationship of relationships) {
    if (!adjacency.has(relationship.from)) adjacency.set(relationship.from, []);
    adjacency.get(relationship.from).push(relationship);
  }

  const findings = [];
  for (const domain of domains) {
    const queue = [{ id: domain.id, path: [domain.id], evidence: [] }];
    const visited = new Set([domain.id]);

    while (queue.length) {
      const current = queue.shift();
      const hops = current.path.length - 1;
      if (hops > 0) {
        findings.push(freeze({
          sourceDomainId: domain.id,
          targetDomainId: current.id,
          targetDomain: freeze({ ...(domainMap.get(current.id) || {}) }),
          hops,
          path: freeze([...current.path]),
          evidence: freeze(current.evidence.map(item => freeze({ ...item }))),
          confidence: Number(Math.max(0.2, 1 - hops * 0.15).toFixed(2))
        }));
      }
      if (hops >= maximumHops) continue;
      for (const edge of adjacency.get(current.id) || []) {
        if (visited.has(edge.to)) continue;
        visited.add(edge.to);
        queue.push({ id: edge.to, path: [...current.path, edge.to], evidence: [...current.evidence, edge] });
      }
    }
  }

  return freeze({
    question,
    findings: freeze(findings),
    findingCount: findings.length,
    domainCount: domains.length,
    crossDomain: true,
    explainable: true,
    evidenceBacked: true,
    autonomousExecutionAllowed: false
  });
}
