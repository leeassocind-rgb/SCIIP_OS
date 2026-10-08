import crypto from 'node:crypto';

export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_74_50_RECORD_OPERATIONAL_INGESTION_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION';
export const VERSION = '3.0-m3.74';

export const sha = v => crypto.createHash('sha256')
  .update(typeof v === 'string' ? v : JSON.stringify(v))
  .digest('hex');

export const freshToken = () => crypto.randomBytes(24).toString('hex');

export function currentValue(events, propertyId, field, fallback = null) {
  let value = fallback;
  for (const e of events || []) {
    if (e?.canonicalPropertyId !== propertyId) continue;
    for (const c of e?.changes || []) {
      if (c?.field === field) value = c.after;
    }
  }
  return value;
}

export function deterministicCandidates(sourceRows) {
  return [...sourceRows]
    .filter(r => r && r.canonicalPropertyId && Number.isFinite(Number(r.availableSf)))
    .sort((a,b) => String(a.canonicalPropertyId).localeCompare(String(b.canonicalPropertyId)));
}
