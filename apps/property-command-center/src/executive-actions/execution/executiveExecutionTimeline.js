export function reconstructExecutiveExecutionTimeline(snapshots = [], evidence = []) {
  const ordered = [...snapshots].sort((a,b) => a.sequence-b.sequence || a.occurredAt.localeCompare(b.occurredAt));
  const evidenceById = new Map(evidence.map(item => [item.evidenceId, item]));
  return Object.freeze(ordered.map(snapshot => Object.freeze({
    ...snapshot,
    evidence: Object.freeze(snapshot.evidenceIds.map(id => evidenceById.get(id)).filter(Boolean))
  })));
}
export function executionDurationMs(timeline = []) {
  if (!timeline.length) return 0;
  const first = Date.parse(timeline[0].occurredAt);
  const last = Date.parse(timeline.at(-1).occurredAt);
  return Number.isFinite(first) && Number.isFinite(last) ? Math.max(0,last-first) : 0;
}
