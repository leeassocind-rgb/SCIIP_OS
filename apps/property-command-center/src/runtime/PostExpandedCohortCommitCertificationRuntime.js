import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_39_POST_EXPANDED_COHORT_COMMIT_CERTIFICATION';
export const VERSION='3.0-m3.39';
export function shaBytes(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function fileSha(p){return shaBytes(fs.readFileSync(p))}
export function certifyReceipts(terminal,canonical){
 const events=Array.isArray(canonical?.events)?canonical.events:[];
 const byId=new Map(events.map(e=>[e?.eventId,e]));
 const idemCounts=new Map();
 for(const e of events) if(e?.idempotencyKey) idemCounts.set(e.idempotencyKey,(idemCounts.get(e.idempotencyKey)||0)+1);
 const rows=(terminal?.receipts||[]).map(r=>{
   const e=byId.get(r.eventId);
   const ch=e?.changes?.[0];
   return {
     sequence:r.sequence,
     canonicalPropertyId:r.canonicalPropertyId,
     eventId:r.eventId,
     eventFound:!!e,
     eventTypeMatches:e?.eventType==='GOVERNED_EXPANDED_COHORT_FIELD_UPDATE',
     canonicalPropertyMatches:e?.canonicalPropertyId===r.canonicalPropertyId,
     idempotencyKeyMatches:e?.idempotencyKey===r.idempotencyKey,
     idempotencyKeyCount:idemCounts.get(r.idempotencyKey)||0,
     fieldMatches:ch?.field==='availableSf',
     beforeMatches:Object.is(ch?.before,r.before),
     afterMatches:Object.is(ch?.after,r.after),
     readAfterWriteVerified:r.readAfterWriteVerified===true,
     tokenConsumed:r.tokenConsumed===true
   };
 });
 const ok=rows.length===10 && rows.every(x=>x.eventFound&&x.eventTypeMatches&&x.canonicalPropertyMatches&&x.idempotencyKeyMatches&&x.idempotencyKeyCount===1&&x.fieldMatches&&x.beforeMatches&&x.afterMatches&&x.readAfterWriteVerified&&x.tokenConsumed);
 return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M339_ALL_10_CANONICAL_COMMITS_CERTIFIED':'M339_CANONICAL_COMMIT_CERTIFICATION_FAILED',rows};
}
