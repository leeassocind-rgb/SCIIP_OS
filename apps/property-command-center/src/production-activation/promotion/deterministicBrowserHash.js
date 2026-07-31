const freeze = value => Object.freeze(value);
function fnv1a32(text, seed = 0x811c9dc5) {
  let hash = seed >>> 0;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
export function deterministicBrowserHash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return [0x811c9dc5,0x9e3779b9,0x85ebca6b,0xc2b2ae35]
    .map(seed => fnv1a32(text, seed).toString(16).padStart(8, '0')).join('');
}
export function createDeterministicIdentifier(prefix, value, length = 20) {
  const safeLength = Math.max(8, Number(length) || 20);
  return `${prefix}-${deterministicBrowserHash(value).slice(0, safeLength)}`;
}
export const BROWSER_HASH_CAPABILITIES = freeze({browserSafe:true,synchronous:true,deterministic:true,cryptographic:false,useCase:'NON_SECURITY_IDENTIFIERS'});
