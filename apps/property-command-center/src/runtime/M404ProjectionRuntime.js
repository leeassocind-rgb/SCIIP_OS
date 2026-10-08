import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_4_M4_04_PROVENANCE_AWARE_CURRENT_STATE_PROJECTION_QUALIFICATION_WITH_EXCEPTION_QUARANTINE';
export const VERSION='4.0-m4.04';
export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_REVIEW_ROWS=195;
export const EXPECTED_DETERMINISTIC_ROWS=188;
export const EXPECTED_QUARANTINE_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));
export function qualifyProjectionRecord(r){
 const cls=r?.qualificationClass||r?.priorResolutionClass||'';
 const quarantine=r?.quarantineEligible===true||cls==='SHARED_CANONICAL_TARGETED_SOURCE_PROVENANCE_EVIDENCE_REQUIRED';
 return {canonicalPropertyId:r?.canonicalPropertyId??null,sourcePropertyId:r?.sourcePropertyId??null,projectionClass:quarantine?'PROVENANCE_EXCEPTION_QUARANTINED':'PROVENANCE_AWARE_CURRENT_STATE_QUALIFIED',quarantined:quarantine,readQualificationAllowed:!quarantine,provenanceDependentWriteQualificationAllowed:false,canonicalCurrentStateAuthoritative:true};
}
