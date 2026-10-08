export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_75C_CURRENT_LEDGER_DIVERGENCE_FORENSICS';
export const VERSION='3.0-m3.75c';

export function compareStreams(canonicalEvents, publicEvents){
  let common=0;
  while(
    common<canonicalEvents.length &&
    common<publicEvents.length &&
    JSON.stringify(canonicalEvents[common])===JSON.stringify(publicEvents[common])
  ) common++;

  return {
    authoritativeCount:canonicalEvents.length,
    publicCount:publicEvents.length,
    commonPrefixLength:common,
    publicIsExactPrefix:common===publicEvents.length && publicEvents.length<=canonicalEvents.length,
    authoritativeOnlyCount:Math.max(0,canonicalEvents.length-common),
    publicOnlyCount:Math.max(0,publicEvents.length-common)
  };
}
