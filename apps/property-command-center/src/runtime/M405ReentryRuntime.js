import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_4_M4_05_PROVENANCE_AWARE_OPERATIONAL_INGESTION_REENTRY_POLICY';
export const VERSION='4.0-m4.05';
export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_QUALIFIED_ROWS=188;
export const EXPECTED_QUARANTINE_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const MAX_RATE_RECORDS_PER_MINUTE=5;
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));
export function reentryGate(r={}){const quarantined=r.quarantined===true||r.projectionClass==='PROVENANCE_EXCEPTION_QUARANTINED';return {quarantined,eligibleForCandidateQualification:!quarantined,executionAuthorized:false,operationalIngestionAuthorized:false,requiresFreshCanonicalSha:true,requiresFreshTemporalSha:true,requiresUniqueCanonicalTarget:true,requiresUniqueSourceProperty:true,requiresCurrentStateReconciliation:true,requiresFreshSingleUseToken:true,requiresFreshIdempotencyKey:true,requiresExactBeforeState:true,requiresRollbackValue:true};}
