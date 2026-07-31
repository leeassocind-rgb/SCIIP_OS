const EXTENSION_TYPES = Object.freeze({
  '.pdf':'AIR_CRE_PDF', '.csv':'AIR_CRE_CSV', '.xlsx':'BASELINE_XLSX', '.xls':'BASELINE_XLS',
  '.kmz':'GIS_KMZ', '.kml':'GIS_KML', '.zip':'ARCHIVE', '.json':'JSON', '.txt':'TEXT'
});

export function extensionOf(name='') {
  const clean = String(name).split(/[?#]/)[0].toLowerCase();
  const index = clean.lastIndexOf('.');
  return index >= 0 ? clean.slice(index) : '';
}
export function classifySource(source={}) {
  const ext = extensionOf(source.name || source.filename || source.path || '');
  const type = EXTENSION_TYPES[ext] || 'UNKNOWN';
  const lower = String(source.name || source.filename || source.path || '').toLowerCase();
  const family = lower.includes('supersheet') ? 'SUPERSHEET' : lower.includes('air') ? 'AIR_CRE' : type.startsWith('GIS_') ? 'GIS' : type.includes('XLS') ? 'BASELINE' : 'GENERAL';
  return { type, family, extension: ext, supported: type !== 'UNKNOWN' };
}
export function discoverCorpus(entries=[], {batchId='BATCH-DISCOVERY', discoveredAt=new Date().toISOString()}={}) {
  const seen = new Set();
  const sources = [];
  for (const input of entries) {
    const entry = typeof input === 'string' ? {path:input, name:input.split(/[\\/]/).pop()} : {...input};
    const key = String(entry.path || entry.name || '').toLowerCase();
    if (!key || seen.has(key) || entry.directory) continue;
    seen.add(key);
    const classification = classifySource(entry);
    sources.push({
      discoveryId:`DISC-${String(sources.length+1).padStart(6,'0')}`,
      batchId,
      name:entry.name || key.split(/[\\/]/).pop(),
      path:entry.path || entry.name,
      bytes:Number(entry.bytes || entry.size || 0),
      modifiedAt:entry.modifiedAt || null,
      ...classification,
      discoveredAt
    });
  }
  const counts = sources.reduce((acc,s)=>{acc[s.type]=(acc[s.type]||0)+1; return acc;},{});
  return { batchId, discoveredAt, sourceCount:sources.length, supportedCount:sources.filter(s=>s.supported).length, counts, sources };
}
