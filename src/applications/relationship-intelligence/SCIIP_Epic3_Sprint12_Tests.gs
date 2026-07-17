/** Sprint 12 Apps Script certification. */
function sciipTestV7Epic3Sprint12(){
  var failures=[],tests=0;function ok(name,value){tests++;if(!value)failures.push(name);}
  var feedback=[
    {feedbackId:'FB-1',opportunityId:'O-1',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:80,executionHealth:90,evidenceQuality:90,expectedValue:100,actualValue:120,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-2',opportunityId:'O-2',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:82,executionHealth:85,evidenceQuality:80,expectedValue:100,actualValue:110,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-3',opportunityId:'O-3',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:78,executionHealth:80,evidenceQuality:85,expectedValue:100,actualValue:105,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-4',opportunityId:'O-4',market:'South Bay',assetType:'Industrial',opportunityType:'Acquisition',predictedScore:70,executionHealth:55,evidenceQuality:60,expectedValue:100,actualValue:80,outcomeStatus:'PARTIAL'}
  ];
  var normalized=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.normalizeFeedback(feedback);ok('Feedback normalization',normalized.length===4&&normalized[0].variancePct===20);
  var cohorts=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.benchmark(feedback);ok('Portfolio cohort benchmarking',cohorts.length===2&&cohorts[0].count>=1);
  var learning=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.learn(feedback,{minimumSampleSize:3});ok('Governed learning proposal',learning.proposals.length===1&&learning.proposals[0].automaticModelMutation===false);
  ok('Minimum sample gate',learning.proposals[0].sampleSize===3);
  var rejected=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.approve(learning.proposals[0],{action:'APPROVE'});ok('Approver gate',rejected.status==='REJECTED');
  var approved=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.approve(learning.proposals[0],{action:'APPROVE',approvedBy:'EXEC-1',approvedAt:'2026-07-17T19:00:00.000Z'});ok('Controlled approval',approved.status==='APPROVED_NOT_APPLIED'&&approved.applicationRequiresControlledRelease===true);
  var app=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_APPLICATION.run({feedback:feedback,policy:{minimumSampleSize:3},decisions:[{proposalId:learning.proposals[0].proposalId,action:'APPROVE',approvedBy:'EXEC-1'}]});ok('Application assembly',app.portfolio.totalOutcomes===4&&app.approvals.length===1&&app.workspace==='executive-opportunity-command');
  var store=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.memory(),p1=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.persist(store,normalized.concat(learning.proposals).concat([approved])),p2=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.persist(store,normalized.concat(learning.proposals).concat([approved]));ok('Append-only duplicate safety',p1.appended===6&&p2.duplicates===6);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_12_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE',version:'v7.0-epic3-sprint12.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{feedbackRecords:normalized.length,cohorts:cohorts.length,learningProposals:learning.proposals.length,approvedProposals:1,persistedEvents:store.all().length,workspace:'executive-opportunity-command',reviewRequired:true,automaticModelMutation:false,destructiveCommitEnabled:false,autonomousExecution:false}};
}
