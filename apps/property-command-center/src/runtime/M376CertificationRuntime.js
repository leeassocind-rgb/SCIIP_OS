export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_76_POST_50_RECORD_OPERATIONAL_INGESTION_COMMIT_CERTIFICATION';
export const VERSION='3.0-m3.76';
export const EXPECTED_EVENT_COUNT=3751;
export const EXPECTED_COHORT_RECORDS=50;
export const EXPECTED_M375B_RECORDS=21;
export const EXPECTED_M375E_RECORDS=29;

export function uniqueCount(values){
  return new Set(values).size;
}

export function eventMatchesRow(event,row,field='availableSf'){
  if(!event || !row) return false;
  const change=(event.changes||[]).find(c=>c.field===field);
  return (
    event.canonicalPropertyId===row.canonicalPropertyId &&
    event.sourcePropertyId===row.sourcePropertyId &&
    change?.before===row.before &&
    change?.after===row.after
  );
}
