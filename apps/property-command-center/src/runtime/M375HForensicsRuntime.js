export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_75H_FULL_50_RECORD_COHORT_COMPLETION_FORENSICS';
export const VERSION='3.0-m3.75h';

export function compareStreams(authoritative, publicEvents){
  let common=0;
  while(
    common<authoritative.length &&
    common<publicEvents.length &&
    JSON.stringify(authoritative[common])===JSON.stringify(publicEvents[common])
  ) common++;

  return {
    authoritativeCount:authoritative.length,
    publicCount:publicEvents.length,
    commonPrefixLength:common,
    publicIsExactPrefix:common===publicEvents.length && publicEvents.length<=authoritative.length,
    authoritativeOnlyCount:Math.max(0,authoritative.length-common),
    publicOnlyCount:Math.max(0,publicEvents.length-common)
  };
}
