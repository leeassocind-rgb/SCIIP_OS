const freeze=value=>Object.freeze(value);

export function certifyKnowledgeGraphActivation({
  stitching,
  entityResolution,
  promotion,
  temporal,
  validation
}={}) {
  const checks=freeze([
    freeze({id:'RELATIONSHIP_STITCHING',passed:Boolean(stitching?.edgeCount>0)}),
    freeze({id:'ENTITY_RESOLUTION',passed:Boolean(entityResolution?.newCanonical>=0&&entityResolution?.destructiveMergeAllowed===false)}),
    freeze({id:'GRAPH_PROMOTION',passed:Boolean(promotion?.status==='PROMOTED'||promotion?.status==='PRODUCTION_BLOCKED')}),
    freeze({id:'TEMPORAL_LINKING',passed:Boolean(temporal?.eventCount>=0&&temporal?.duplicateSafe)}),
    freeze({id:'GRAPH_VALIDATION',passed:Boolean(validation?.status==='VALIDATED')}),
    freeze({
      id:'PRODUCTION_DEFAULT_DENIED',
      passed:Boolean(
        promotion?.status!=='PROMOTED' ||
        promotion?.certificate?.stage!=='PRODUCTION' ||
        promotion?.certificate?.productionWritesEnabled===false
      )
    })
  ]);

  const failed=checks.filter(check=>!check.passed).length;

  return freeze({
    framework:'SCIIP_PHASE5_KNOWLEDGE_GRAPH_ACTIVATION_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    productionExecutionAuthorized:false,
    destructiveMergeAllowed:false
  });
}
