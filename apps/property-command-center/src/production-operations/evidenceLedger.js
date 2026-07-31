const clone = value => JSON.parse(JSON.stringify(value));
export function createEvidenceLedger(seed=[]) {
  const records = seed.map(clone);
  const ids = new Set(records.map(r=>r.evidenceId));
  return Object.freeze({
    append(input={}) {
      const evidenceId = input.evidenceId || `EVD-${String(records.length+1).padStart(8,'0')}`;
      if (ids.has(evidenceId)) return clone(records.find(r=>r.evidenceId===evidenceId));
      const record = Object.freeze({
        evidenceId, sourceId:input.sourceId, observationId:input.observationId || null,
        field:input.field || null, value:input.value ?? null, locator:input.locator || null,
        extractionMethod:input.extractionMethod || 'DECLARED', confidence:Number(input.confidence ?? 1),
        parserVersion:input.parserVersion || 'v5.6-batch2', recordedAt:input.recordedAt || new Date().toISOString()
      });
      records.push(record); ids.add(evidenceId); return clone(record);
    },
    list(filter={}) { return clone(records.filter(r=>Object.entries(filter).every(([k,v])=>r[k]===v))); },
    trace(evidenceId) { const record=records.find(r=>r.evidenceId===evidenceId); return record?clone(record):null; },
    size() { return records.length; }
  });
}
