function fnv1a(value='') {
  let h = 0x811c9dc5;
  for (let i=0;i<value.length;i++) { h ^= value.charCodeAt(i); h = Math.imul(h,0x01000193); }
  return (h>>>0).toString(16).padStart(8,'0');
}
export function canonicalSourceDescriptor(source={}) {
  return [source.name||'',source.bytes||0,source.modifiedAt||'',source.contentHash||'',source.type||''].join('|').toLowerCase();
}
export function fingerprintSource(source={}) {
  const descriptor = canonicalSourceDescriptor(source);
  return source.sha256 || source.contentHash || `fnv1a-${fnv1a(descriptor)}`;
}
export function attachFingerprint(source={}) { return {...source, fingerprint:fingerprintSource(source)}; }


export async function fingerprintFile(file) {
  const source = {
    name: file?.name || '',
    bytes: Number(file?.size || 0),
    modifiedAt: file?.lastModified
      ? new Date(file.lastModified).toISOString()
      : '',
    type: file?.type || ''
  };

  return fingerprintSource(source);
}