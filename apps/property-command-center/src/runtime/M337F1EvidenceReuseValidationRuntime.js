import crypto from 'node:crypto';
export const MAX_RECORDS=10;
export const FIELD='availableSf';
export function sha(v){return crypto.createHash('sha256').update(v).digest('hex')}
export function validateEvidence(e,canonicalSha,temporalSha){
 const c=e?.cohort;
 const ids=new Set((c||[]).map(x=>x.canonicalPropertyId));
 const toks=new Set((c||[]).map(x=>x.singleUseToken));
 const keys=new Set((c||[]).map(x=>x.idempotencyKey));
 const ok=e?.contract==='SCIIP_EXPLORER_3_M3_37F_OBSERVATION_BOUND_CURRENT_STATE_CANDIDATE_PREAUTHORIZATION' &&
   e?.version==='3.0-m3.37f' &&
   e?.status==='PREAUTHORIZED' &&
   e?.state==='M337F_EXPANDED_COHORT_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED' &&
   e?.sourceBinding?.canonicalAuthoritativeSha256===canonicalSha &&
   e?.sourceBinding?.temporalAuthoritativeSha256===temporalSha &&
   e?.sourceBinding?.canonicalPublicByteParity===true &&
   e?.sourceBinding?.temporalPublicByteParity===true &&
   Array.isArray(c) && c.length===MAX_RECORDS &&
   ids.size===MAX_RECORDS && toks.size===MAX_RECORDS && keys.size===MAX_RECORDS &&
   c.every((x,i)=>x.sequence===i+1 && x.field===FIELD &&
     Number.isFinite(x.before) && x.before>0 &&
     Number.isFinite(x.after) && x.after>=0 && x.after<x.before &&
     x.rollbackValue===x.before &&
     typeof x.currentObservationId==='string' && x.currentObservationId.startsWith('OBS-') &&
     typeof x.singleUseToken==='string' && x.singleUseToken.length>=32 &&
     x.tokenState==='ISSUED_NOT_CONSUMED') &&
   e?.authorization?.executionAuthorized===false &&
   e?.authorization?.liveWriteAuthority===false &&
   e?.authorization?.canonicalWriteAuthority===false &&
   e?.authorization?.syncAuthority===false &&
   e?.safety?.canonicalMutationPerformed===false &&
   e?.safety?.temporalMutationPerformed===false &&
   e?.safety?.productionDataWritePerformed===false &&
   e?.safety?.propagationPerformed===false &&
   e?.safety?.canonicalEventsCreated===0 &&
   e?.safety?.tokensConsumed===0;
 return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M337F_EXISTING_EVIDENCE_CERTIFIED_REUSABLE':'M337F_EXISTING_EVIDENCE_INVALID'};
}
