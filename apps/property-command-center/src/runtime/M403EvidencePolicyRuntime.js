import crypto from 'node:crypto';
export const CONTRACT='SCIIP_EXPLORER_4_M4_03_TARGETED_PROVENANCE_EVIDENCE_QUALIFICATION_POLICY';
export const VERSION='4.0-m4.03';
export const EXPECTED_BASELINE_EVENT_COUNT=5073;
export const EXPECTED_PARENT_REVIEW_ROWS=195;
export const EXPECTED_DETERMINISTIC_ROWS=188;
export const EXPECTED_TARGET_ROWS=7;
export const APPROVED_FIELD='availableSf';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
export const fileSha=(fs,p)=>sha256(fs.readFileSync(p));
export const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String))];
export function qualifyEvidence(row){
  const sourceCount=Number(row?.currentCanonicalSourceCount||0);
  const historyCount=Number(row?.availableSfHistoryEvents||0);
  const unattributed=Number(row?.unattributedHistoryEvents||0);
  const same=Number(row?.explicitSameSourceHistoryEvents||0);
  const other=Number(row?.explicitOtherSourceHistoryEvents||0);
  const cls=row?.resolutionClass||null;
  const shared=sourceCount>1;
  const requiredEvidence=[
    'SOURCE_NATIVE_OBSERVATION_WITH_STABLE_SOURCE_PROPERTY_ID',
    'OBSERVED_AT_TIMESTAMP_OR_EQUIVALENT_ORDERING_EVIDENCE',
    'AVAILABLE_SF_VALUE_AT_OBSERVATION',
    'CANONICAL_IDENTITY_BRIDGE_MATCH_AT_QUALIFICATION_TIME'
  ];
  if(shared) requiredEvidence.push('ALIAS_DISAMBIGUATION_EVIDENCE');
  const prohibited=['UNSUPPORTED_SOURCE_GUESS','CURRENT_ALIAS_ORDER_AS_HISTORICAL_PROOF','HISTORICAL_EVENT_REWRITE','AUTOMATIC_IDENTITY_RELINK','CANONICAL_ROLLBACK'];
  let qualificationClass='TARGETED_EXTERNAL_PROVENANCE_EVIDENCE_REQUIRED';
  if(cls==='SHARED_CANONICAL_UNATTRIBUTED_HISTORY_AMBIGUOUS') qualificationClass='SHARED_CANONICAL_TARGETED_SOURCE_PROVENANCE_EVIDENCE_REQUIRED';
  return {qualificationClass,sharedCanonical:shared,currentCanonicalSourceCount:sourceCount,availableSfHistoryEvents:historyCount,unattributedHistoryEvents:unattributed,explicitSameSourceHistoryEvents:same,explicitOtherSourceHistoryEvents:other,requiredEvidence,prohibitedEvidence:prohibited,minimumIndependentEvidenceChannels:shared?2:1,automaticQualificationAllowed:false,writeQualificationAllowed:false,quarantineEligible:true};
}
