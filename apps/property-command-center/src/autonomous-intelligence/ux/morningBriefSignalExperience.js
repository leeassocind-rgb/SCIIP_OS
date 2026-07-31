const freeze = value => Object.freeze(value);
const safeArray = value => Array.isArray(value) ? value : [];

const priorityScore = item =>
  Number(item?.priorityScore ?? item?.score ?? item?.urgency ?? item?.impact ?? 0);

export function createMorningBriefSignalExperience({
  brief = {},
  decision = {},
  snapshot = {},
  signalState = {}
} = {}) {
  const sections = brief.sections || {};
  const priorities = [...safeArray(sections.assignmentPriorities)]
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 6)
    .map((item, index) => freeze({
      id: item.assignmentId || item.id || `priority-${index + 1}`,
      name: item.name || item.assignmentName || item.assignmentId || 'Assignment',
      reason: item.reason || 'Executive attention required',
      score: priorityScore(item),
      confidence: Number(item.confidence || 0)
    }));

  const changes = safeArray(sections.marketChanges).slice(0, 6).map((item, index) => freeze({
    id: item.id || `change-${index + 1}`,
    type: item.type || 'MARKET_CHANGE',
    label: String(item.type || 'Market change').replaceAll('_', ' '),
    magnitude: Number(item.magnitude || 0),
    confidence: Number(item.confidence || 0),
    evidenceIds: freeze([...safeArray(item.evidenceIds)])
  }));

  const comparables = safeArray(sections.newComparables).slice(0, 6).map((item, index) => freeze({
    id: item.id || `comparable-${index + 1}`,
    address: item.address || item.name || 'Comparable',
    date: item.date || null,
    evidenceIds: freeze([...safeArray(item.evidenceIds)])
  }));

  const approvals = safeArray(sections.approvalsRequired).slice(0, 6).map((item, index) => freeze({
    id: item.id || `approval-${index + 1}`,
    label: item.title || item.name || item.id || 'Approval',
    status: item.status || 'PENDING'
  }));

  const evidenceIds = [...new Set([
    ...safeArray(brief.evidenceIds),
    ...safeArray(snapshot.evidenceIds),
    ...safeArray(signalState.sourceSignalIds)
  ].filter(Boolean))];

  const reviewRequired = Boolean(
    brief.brokerApprovalRequired ||
    signalState.reviewRequired ||
    approvals.length
  );

  return freeze({
    status: brief.status || 'REVIEW_REQUIRED',
    headline: sections.executiveSummary?.headline || signalState.headline || 'Executive morning brief',
    generatedAt: brief.generatedAt || signalState.generatedAt || new Date().toISOString(),
    priorities: freeze(priorities),
    marketChanges: freeze(changes),
    comparables: freeze(comparables),
    approvals: freeze(approvals),
    evidenceIds: freeze(evidenceIds),
    evidenceCount: evidenceIds.length,
    decisionId: decision.decisionId || null,
    reviewRequired,
    brokerApprovalRequired: true,
    autonomousConsequentialActions: 'BLOCKED',
    factsOnly: sections.executiveSummary?.factsOnly !== false
  });
}
