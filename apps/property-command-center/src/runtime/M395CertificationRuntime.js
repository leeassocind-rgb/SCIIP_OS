export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_95_POST_622_RECORD_OPERATIONAL_INGESTION_COMMIT_CERTIFICATION';
export const VERSION='3.0-m3.95';

export const EXPECTED_CANONICAL_COUNT=5073;
export const EXPECTED_PUBLIC_COUNT=4451;
export const EXPECTED_PUBLIC_LAG=622;
export const EXPECTED_COHORT_RECORDS=622;
export const EXPECTED_UNIQUE_TARGETS=622;
export const APPROVED_FIELD='availableSf';

export function compareStreams(authoritative, publicEvents){
  let common=0;

  while(
    common<authoritative.length &&
    common<publicEvents.length &&
    JSON.stringify(authoritative[common])===JSON.stringify(publicEvents[common])
  ){
    common++;
  }

  return {
    authoritativeCount:authoritative.length,
    publicCount:publicEvents.length,
    commonPrefixLength:common,
    publicIsExactPrefix:
      common===publicEvents.length &&
      publicEvents.length<=authoritative.length,
    authoritativeOnlyCount:Math.max(0,authoritative.length-common),
    publicOnlyCount:Math.max(0,publicEvents.length-common)
  };
}
