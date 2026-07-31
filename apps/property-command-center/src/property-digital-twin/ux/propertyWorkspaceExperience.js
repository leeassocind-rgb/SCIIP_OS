const freeze=value=>Object.freeze(value);
const safe=value=>Array.isArray(value)?value:[];

const number=value=>Number(value||0);

export function createPropertyWorkspaceExperience({twin={},asOf=null}={}){
  const profile=twin.profile||{};
  const physical=profile.physical||{};
  const location=profile.location||{};
  const state=twin.currentState||{};
  const infrastructure=twin.infrastructure||{};
  const dependencies=safe(infrastructure.dependencies||infrastructure.items||infrastructure);
  const claims=safe(twin.evidenceLineage?.claims||twin.evidenceLineage?.items||[]);
  const relationships=safe(twin.relationships);
  const market=twin.marketPosition||null;
  const criticalInfrastructure=dependencies.filter(item=>
    ['CRITICAL','HIGH','AT_RISK','BLOCKED'].includes(String(item.criticality||item.severity||item.status||'').toUpperCase())
  );

  const metrics=freeze([
    freeze({id:'building-sf',label:'Building',value:number(physical.buildingSf),suffix:' SF'}),
    freeze({id:'land-acres',label:'Land',value:number(physical.landAcres),suffix:' acres'}),
    freeze({id:'clear-height',label:'Clear height',value:number(physical.clearHeightFt||physical.clearHeight),suffix:' ft'}),
    freeze({id:'power',label:'Power',value:number(physical.powerAmps),suffix:' A'})
  ]);

  const sections=freeze([
    freeze({id:'overview',label:'Overview',count:4}),
    freeze({id:'operations',label:'Current state',count:Object.keys(state).length}),
    freeze({id:'market',label:'Market position',count:market?1:0}),
    freeze({id:'infrastructure',label:'Infrastructure',count:dependencies.length}),
    freeze({id:'evidence',label:'Evidence',count:claims.length}),
    freeze({id:'relationships',label:'Relationships',count:relationships.length})
  ]);

  return freeze({
    twinId:twin.twinId||null,
    propertyId:profile.propertyId||profile.id||null,
    address:profile.address||'Property',
    city:profile.city||'',
    stateCode:profile.state||'',
    submarket:location.submarket||profile.submarket||'',
    coordinates:freeze({...location.coordinates}),
    healthStatus:twin.health?.status||'UNKNOWN',
    healthScore:number(twin.health?.score),
    projectionStatus:twin.projectionStatus||'CURRENT',
    asOf:asOf||new Date().toISOString(),
    metrics,
    sections,
    currentState:freeze({...state}),
    marketPosition:market?freeze({...market}):null,
    infrastructure:freeze(dependencies.map(item=>freeze({...item}))),
    criticalInfrastructureCount:criticalInfrastructure.length,
    evidenceClaims:freeze(claims.map(item=>freeze({...item}))),
    relationships:freeze(relationships.map(item=>freeze({...item}))),
    evidenceCount:claims.length,
    relationshipCount:relationships.length,
    temporalReconstruction:true,
    appendOnlyStateHistory:true,
    brokerApprovalRequired:true,
    autonomousConsequentialActions:'BLOCKED'
  });
}
