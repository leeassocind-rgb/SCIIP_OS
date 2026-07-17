function sciipTestV7Epic3Sprint5() {
  var input = {
    entities: [
      {id:'COMP-A', name:'Owner A', type:'COMPANY'},
      {id:'PERSON-B', name:'Broker B', type:'PERSON'},
      {id:'COMP-C', name:'Tenant C', type:'COMPANY'}
    ],
    relationships: [
      {sourceId:'COMP-A', targetId:'PERSON-B', type:'REPRESENTED_BY', strength:90, confidence:95, observedAt:'2026-07-17'},
      {sourceId:'PERSON-B', targetId:'COMP-C', type:'KNOWS', strength:85, confidence:90, observedAt:'2026-07-17'},
      {sourceId:'COMP-A', targetId:'PERSON-B', type:'REPRESENTED_BY', strength:80, confidence:80, observedAt:'2026-07-17'}
    ]
  };
  var result = SCIIP_RELATIONSHIP_INTELLIGENCE_APPLICATION.run(input, {commit:false});
  var failures = [];
  if (result.analysis.entities !== 3) failures.push('Expected 3 entities.');
  if (result.analysis.relationships !== 2) failures.push('Duplicate relationship was not suppressed.');
  if (!result.analysis.topInfluencer || result.analysis.topInfluencer.entityId !== 'PERSON-B') failures.push('Influence scoring failed.');
  if (result.analysis.opportunities.length !== 1) failures.push('Warm-introduction opportunity missing.');
  if (result.persistence.status !== 'PREVIEW') failures.push('Default persistence must be preview-only.');
  if (!result.briefing.grounded || !result.briefing.evidenceRequired) failures.push('AI briefing is not evidence governed.');
  return {
    framework:'SCIIP_V7_EPIC_3_SPRINT_5_RELATIONSHIP_INTELLIGENCE',
    version:'v7.0-epic3-sprint5.0',
    status:failures.length ? 'FAILED' : 'PASSED',
    testsRun:6,
    failures:failures,
    result:{
      entities:result.analysis.entities,
      relationships:result.analysis.relationships,
      opportunities:result.analysis.opportunities.length,
      topInfluencer:result.analysis.topInfluencer && result.analysis.topInfluencer.entityId,
      workspace:result.descriptor.workspace,
      reviewRequired:result.descriptor.governance.reviewRequired,
      destructiveCommitEnabled:result.descriptor.governance.destructiveCommitEnabled
    }
  };
}
