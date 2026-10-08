import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_41_EXPANDED_COHORT_LIFECYCLE_CLOSURE_NEXT_EXPANSION_READINESS';
export const VERSION='3.0-m3.41';
export function sha(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function fileSha(p){return sha(fs.readFileSync(p))}
export function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function certifyReplay(manifest,terminal,canonical){
  const events=canonical?.events||[];
  const idemCounts=new Map();
  for(const e of events) if(e?.idempotencyKey) idemCounts.set(e.idempotencyKey,(idemCounts.get(e.idempotencyKey)||0)+1);
  const rows=(manifest?.cohort||[]).map((m,i)=>{
    const r=(terminal?.receipts||[])[i];
    return {
      sequence:m.sequence,
      canonicalPropertyId:m.canonicalPropertyId,
      idempotencyKey:m.idempotencyKey,
      receiptPresent:!!r,
      tokenConsumed:r?.tokenConsumed===true,
      idempotencyCommittedExactlyOnce:(idemCounts.get(m.idempotencyKey)||0)===1,
      receiptMatchesCanonicalProperty:r?.canonicalPropertyId===m.canonicalPropertyId,
      receiptMatchesIdempotency:r?.idempotencyKey===m.idempotencyKey
    };
  });
  const ok=rows.length===10 && rows.every(x=>x.receiptPresent&&x.tokenConsumed&&x.idempotencyCommittedExactlyOnce&&x.receiptMatchesCanonicalProperty&&x.receiptMatchesIdempotency);
  return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M341_REPLAY_AND_IDEMPOTENCY_CLOSURE_CERTIFIED':'M341_REPLAY_AND_IDEMPOTENCY_CLOSURE_FAILED',rows};
}
