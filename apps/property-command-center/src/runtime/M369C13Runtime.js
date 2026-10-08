import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_3_M3_69C13_EXPLICIT_GOVERNED_7_RECORD_RECOVERY_EXECUTION';
export const VERSION='3.0-m3.69c13';
export const shaBytes=b=>crypto.createHash('sha256').update(b).digest('hex');
export const shaFile=(fs,p)=>shaBytes(fs.readFileSync(p));
export function currentValue(events,pid,field,fallback){
 let v=fallback;
 for(const e of events||[]) if(e?.canonicalPropertyId===pid)
  for(const c of e?.changes||[]) if(c?.field===field) v=c.after;
 return v;
}
