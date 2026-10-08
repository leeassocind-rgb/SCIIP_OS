import fs from 'node:fs';
import crypto from 'node:crypto';

export const AUTH_PHRASE='AUTHORIZE_M340_PROPAGATION';
export function sha(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function fileSha(p){return sha(fs.readFileSync(p))}
export function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function atomicCopy(src,dst){
  const tmp=dst+'.m340.tmp';
  fs.copyFileSync(src,tmp);
  fs.renameSync(tmp,dst);
}
export function targetState(canonical,receipts){
  const events=canonical?.events||[];
  return (receipts||[]).map(r=>{
    const e=events.find(x=>x?.eventId===r.eventId);
    const ch=e?.changes?.[0];
    return {canonicalPropertyId:r.canonicalPropertyId,eventId:r.eventId,field:ch?.field??null,before:ch?.before??null,after:ch?.after??null};
  });
}
