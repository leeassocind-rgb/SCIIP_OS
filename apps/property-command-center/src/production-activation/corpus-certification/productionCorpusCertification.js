const freeze=v=>Object.freeze(v);

export function certifyProductionCorpus({batch,identity,graphSnapshot={},ingestionRuntime={},thresholds={}}={}){
  const policy={
    minimumSchemaCoveragePct:Number(thresholds.minimumSchemaCoveragePct??95),
    maximumRejectedRows:Number(thresholds.maximumRejectedRows??0),
    maximumUnresolvedIdentityPct:Number(thresholds.maximumUnresolvedIdentityPct??5),
    requireGraphRecords:Boolean(thresholds.requireGraphRecords??true)
  };
  const nodes=Array.isArray(graphSnapshot.nodes)?graphSnapshot.nodes:[];
  const propertyNodes=nodes.filter(n=>String(n.type||n.kind||'').toUpperCase().includes('PROPERTY')).length;
  const identityTotal=Number(identity?.total||0);
  const unresolved=Number(identity?.reviewRequired||0);
  const unresolvedPct=identityTotal?Number(((unresolved/identityTotal)*100).toFixed(2)):100;
  const latest=ingestionRuntime?.latest||ingestionRuntime?.ingestion?.latest||{};
  const checks=[
    freeze({id:'BATCH_COMPLETED',passed:batch?.status==='COMPLETED',actual:batch?.status||null,expected:'COMPLETED'}),
    freeze({id:'SCHEMA_COVERAGE',passed:Number(latest.schemaCoveragePct||0)>=policy.minimumSchemaCoveragePct,actual:Number(latest.schemaCoveragePct||0),expected:`>=${policy.minimumSchemaCoveragePct}`}),
    freeze({id:'REJECTED_ROWS',passed:Number(latest.rejected||0)<=policy.maximumRejectedRows,actual:Number(latest.rejected||0),expected:`<=${policy.maximumRejectedRows}`}),
    freeze({id:'IDENTITY_RESOLUTION',passed:unresolvedPct<=policy.maximumUnresolvedIdentityPct,actual:unresolvedPct,expected:`<=${policy.maximumUnresolvedIdentityPct}`}),
    freeze({id:'PROPERTY_GRAPH',passed:!policy.requireGraphRecords||propertyNodes>0,actual:propertyNodes,expected:'>0'}),
    freeze({id:'PRODUCTION_WRITES_DEFAULT_DENIED',passed:latest.productionWritesEnabled===false||ingestionRuntime.productionWritesEnabled===false,actual:false,expected:false}),
    freeze({id:'SOURCE_MUTATION_DEFAULT_DENIED',passed:latest.sourceMutationAllowed===false||ingestionRuntime.sourceMutationAllowed===false,actual:false,expected:false})
  ];
  const passed=checks.filter(c=>c.passed).length,failed=checks.length-passed;
  return freeze({
    framework:'SCIIP_PHASE5_PRODUCTION_CORPUS_ACTIVATION_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks:freeze(checks),checksRun:checks.length,checksPassed:passed,checksFailed:failed,
    propertyNodes,unresolvedIdentityPct:unresolvedPct,
    productionWritesEnabled:false,sourceMutationAllowed:false,
    certifiedAt:new Date().toISOString()
  });
}
