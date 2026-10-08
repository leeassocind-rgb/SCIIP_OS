const FUTURE_STATUSES=new Set([
  'PROPOSED','PROPOSED/PLANNED','PLANNED','UNDER CONSTRUCTION','UNDER_CONSTRUCTION',
  'CONSTRUCTION','DEVELOPMENT','FUTURE'
]);

export function normalizeDevelopmentStatus(value){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,' ');
}

export function classifyDevelopmentTemporalMode(property){
  const status=normalizeDevelopmentStatus(property?.status||property?.buildingStatus||property?.raw?.['Property\nBuilding Status']);
  const future=FUTURE_STATUSES.has(status)||status.includes('UNDER CONSTRUCTION')||status.includes('PROPOSED')||status.includes('PLANNED');
  return Object.freeze({
    status,
    mode:future?'PROJECT_FUTURE_STATE':'STABILIZED_CURRENT_STATE',
    isFutureState:future,
    canonicalRole:future?'PROJECT / FUTURE STATE':'CURRENT PROPERTY RECORD',
    externalRole:future?'CURRENT / ASSESSOR OR PRE-DEVELOPMENT EVIDENCE':'CURRENT EXTERNAL EVIDENCE',
    requiresParcelReview:future
  });
}
