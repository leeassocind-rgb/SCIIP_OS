export const CONTRACT =
  'SCIIP_EXPLORER_3_M3_74A_CURRENT_STATE_SOURCE_SHAPE_FORENSICS';
export const VERSION = '3.0-m3.74a';

export function summarizeValue(v, depth=0) {
  if (depth > 3) return { type: Array.isArray(v)?'array':typeof v };
  if (Array.isArray(v)) {
    return {
      type:'array',
      length:v.length,
      sample: v.slice(0,3).map(x => summarizeValue(x, depth+1))
    };
  }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    const out = { type:'object', keys:keys.slice(0,50) };
    const children = {};
    for (const k of keys.slice(0,20)) children[k] = summarizeValue(v[k], depth+1);
    out.children = children;
    return out;
  }
  return { type: typeof v, sample: v };
}

export function collectArrays(v, path='$', depth=0, out=[]) {
  if (depth > 6 || v == null) return out;
  if (Array.isArray(v)) {
    out.push({
      path,
      length:v.length,
      sampleKeys: v[0] && typeof v[0]==='object' && !Array.isArray(v[0])
        ? Object.keys(v[0]).slice(0,60)
        : []
    });
    for (let i=0;i<Math.min(v.length,2);i++) collectArrays(v[i],`${path}[${i}]`,depth+1,out);
    return out;
  }
  if (typeof v==='object') {
    for (const [k,val] of Object.entries(v)) collectArrays(val,`${path}.${k}`,depth+1,out);
  }
  return out;
}

export function scoreCandidateArray(a) {
  const keys = new Set(a.sampleKeys||[]);
  let score = 0;
  for (const k of keys) {
    const s=String(k).toLowerCase();
    if (s.includes('canonical')) score += 3;
    if (s.includes('property')) score += 2;
    if (s.includes('available')) score += 3;
    if (s.includes('observation')) score += 2;
    if (s.includes('current')) score += 1;
    if (s.includes('sf') || s.includes('square')) score += 1;
  }
  if ((a.length||0) >= 50) score += 2;
  return score;
}
