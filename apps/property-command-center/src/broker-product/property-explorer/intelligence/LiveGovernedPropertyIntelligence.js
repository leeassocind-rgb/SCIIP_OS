import{classifyDevelopmentTemporalMode}from'./DevelopmentTemporalPolicy.js';
export function buildLiveGovernedPropertyIntelligence(property,lightBoxState){
  const result=lightBoxState?.result||null;
  const resolution=result?.resolution||null;
  const conflict=result?.conflictReport||null;
  const top=resolution?.top||null;
  const verified=resolution?.status==='VERIFIED_MATCH';
  const canonicalVerified=(property?.provenance?.gateStatus||property?.provenance?.status)==='VERIFIED';
  const temporal=classifyDevelopmentTemporalMode(property);

  return Object.freeze({
    propertyId:property?.id||null,
    canonicalVerified,
    temporalMode:temporal.mode,
    temporalStatus:temporal.status,
    externalEvidenceRole:temporal.externalRole,
    temporalReviewRequired:temporal.requiresParcelReview,
    enrichmentPhase:lightBoxState?.phase||'DISABLED',
    liveEnabled:Boolean(lightBoxState?.clientStatus?.enabled),
    provider:'LightBox',
    resolutionStatus:resolution?.status||null,
    resolutionConfidence:resolution?.confidence??null,
    candidateCount:result?.recordCount??0,
    matchedParcelId:top?.parcel?.id||top?.parcel?.uuaid||top?.parcel?.uaid||null,
    matchedApn:top?.apn||null,
    verifiedMatch:verified,
    conflictCount:conflict?.conflictCount||0,
    evidenceStatus:conflict?.status||null,
    cacheHit:Boolean(result?.cache?.hit),
    canAdoptParcelIdentity:Boolean(
      canonicalVerified &&
      verified &&
      !temporal.requiresParcelReview &&
      !property?.parcelId &&
      top?.apn
    ),
    canonicalOverwriteAllowed:false
  });
}

export function liveGovernedPropertyBadge(model){
  if(!model?.liveEnabled)return{tone:'neutral',label:'LightBox offline'};
  if(model.enrichmentPhase==='LOADING')return{tone:'neutral',label:'Resolving parcel'};
  if(model.enrichmentPhase==='ERROR')return{tone:'warning',label:'Enrichment unavailable'};
  if(model.verifiedMatch&&model.conflictCount===0)return{tone:'success',label:'Verified external match'};
  if(model.verifiedMatch&&model.conflictCount>0)return{tone:'warning',label:'Verified · review evidence'};
  if(model.resolutionStatus==='REVIEW_REQUIRED')return{tone:'warning',label:'Parcel review required'};
  if(model.resolutionStatus==='NO_MATCH'&&model.temporalMode==='PROJECT_FUTURE_STATE')return{tone:'warning',label:'Project site · parcel review'};
  if(model.resolutionStatus==='NO_MATCH')return{tone:'warning',label:'No parcel match'};
  return{tone:'neutral',label:'Awaiting enrichment'};
}
