function sciipTestV7Epic3Sprint6() {
  var input = {
    entities: [
      {id:'OWNER-A', name:'Owner A', type:'COMPANY', attributes:{baseInfluence:3}},
      {id:'BROKER-B', name:'Broker B', type:'PERSON', attributes:{baseInfluence:5}},
      {id:'TENANT-C', name:'Tenant C', type:'COMPANY', attributes:{baseInfluence:2}},
      {id:'ASSET-D', name:'Asset D', type:'PROPERTY', attributes:{baseInfluence:1}}
    ],
    relationships: [
      {id:'R1', sourceId:'OWNER-A', targetId:'BROKER-B', type:'REPRESENTED_BY', strength:90, confidence:95, observedAt:'2026-07-01'},
      {id:'R2', sourceId:'BROKER-B', targetId:'TENANT-C', type:'KNOWS', strength:85, confidence:90, observedAt:'2026-07-01'},
      {id:'R3', sourceId:'BROKER-B', targetId:'ASSET-D', type:'MARKETS', strength:70, confidence:90, observedAt:'2026-07-01', metadata:{decayPerDay:2.5}}
    ]
  };
  var portfolio = [
    {id:'ASSET-D', entityId:'ASSET-D', marketPriority:90, strategicFit:85},
    {id:'OWNER-A', entityId:'OWNER-A', marketPriority:70, strategicFit:75}
  ];
  var options = {asOfDate:'2026-07-17T00:00:00Z', maxDepth:3, iterations:3};
  var traversal = SCIIP_NETWORK_INTELLIGENCE.traverse(input, 'OWNER-A', options);
  var temporal = SCIIP_NETWORK_INTELLIGENCE.temporalSnapshot(input, options.asOfDate);
  var propagation = SCIIP_NETWORK_INTELLIGENCE.propagateInfluence(input, options);
  var portfolioScore = SCIIP_NETWORK_INTELLIGENCE.scorePortfolio(input, portfolio, options);
  var dashboard = SCIIP_NETWORK_INTELLIGENCE.buildDashboard(input, portfolio, options);
  var recommendations = SCIIP_NETWORK_INTELLIGENCE.recommend(input, portfolio, options);
  var persistence = SCIIP_NETWORK_INTELLIGENCE_PERSISTENCE.persist(
    SCIIP_NETWORK_INTELLIGENCE.analyze(input, portfolio, options),
    {commit:false, asOfDate:'2026-07-17'}
  );
  var failures = [];
  if (traversal.reachableEntities !== 3) failures.push('Multi-hop traversal failed.');
  if (temporal.weakening !== 1) failures.push('Temporal weakening detection failed.');
  if (!propagation.top || propagation.top.entityId !== 'BROKER-B') failures.push('Influence propagation failed.');
  if (!portfolioScore.topAsset) failures.push('Portfolio network scoring failed.');
  if (dashboard.kpis.entities !== 4 || dashboard.kpis.relationships !== 3) failures.push('Dashboard KPI assembly failed.');
  if (!recommendations.count) failures.push('Governed recommendations missing.');
  if (persistence.status !== 'PREVIEW' || persistence.destructiveWrite !== false) failures.push('Persistence governance failed.');
  return {
    framework:'SCIIP_V7_EPIC_3_SPRINT_6_NETWORK_INTELLIGENCE',
    version:'v7.0-epic3-sprint6.0',
    status:failures.length ? 'FAILED' : 'PASSED',
    testsRun:7,
    failures:failures,
    result:{
      reachableEntities:traversal.reachableEntities,
      weakeningRelationships:temporal.weakening,
      topInfluencer:propagation.top && propagation.top.entityId,
      topPortfolioAsset:portfolioScore.topAsset && portfolioScore.topAsset.assetId,
      dashboardWorkspace:dashboard.workspace,
      recommendations:recommendations.count,
      reviewRequired:dashboard.reviewRequired,
      destructiveCommitEnabled:dashboard.destructiveCommitEnabled
    }
  };
}
