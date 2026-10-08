export function buildReconciliationPresentation(model,property){
  const identityConfidence=Number(model?.identityConfidence??model?.matchConfidence??model?.confidence??0)||0;
  const sourceRaw=model?.sourceConfidence??model?.candidateConfidence??null;
  const sourceConfidence=sourceRaw===null||sourceRaw===undefined||sourceRaw===''?null:Number(sourceRaw);
  const identityConflicts=Number(model?.identityConflictCount??0)||0;
  const evidenceConflicts=Number(model?.evidenceConflictCount??0)||0;
  const attributeConflicts=Number(model?.attributeConflictCount??0)||0;
  const resolvedRepresentations=Number(model?.resolvedRepresentationCount??0)||0;
  const conflictDetails=Array.isArray(model?.evidenceConflictDetails)?model.evidenceConflictDetails:[];

  const identityStatus=
    model?.reconciliation?.status==='VERIFIED_IDENTITY'||model?.verifiedMatch
      ?'VERIFIED'
      :model?.reviewRequired
        ?'REVIEW_REQUIRED'
        :'UNRESOLVED';

  return Object.freeze({
    identityStatus,
    identityConfidence,
    sourceConfidence,
    identityConflicts,
    evidenceConflicts,
    evidenceDifferences:evidenceConflicts,
    attributeConflicts,
    resolvedRepresentations,
    conflictDetails:Object.freeze(conflictDetails),
    identityConfidenceLabel:`${Math.round(identityConfidence)}%`,
    sourceConfidenceLabel:Number.isFinite(sourceConfidence)?`${Math.round(sourceConfidence)}%`:'—',
    identityConflictLabel:String(identityConflicts),
    evidenceConflictLabel:String(evidenceConflicts),
    evidenceDifferenceLabel:String(evidenceConflicts),
    attributeConflictLabel:String(attributeConflicts),
    resolvedRepresentationLabel:String(resolvedRepresentations),
    unresolvedEvidenceConflicts:Math.max(0,evidenceConflicts-resolvedRepresentations),
    hasEvidenceDetails:evidenceConflicts>0,
    semanticContract:Object.freeze({difference:'Any SCIIP-vs-LightBox source disagreement',normalized:'Representation variance resolved by normalization',review:'Substantive unresolved source disagreement',identityConflict:'Unresolved identity-bearing disagreement'})
  });
}
