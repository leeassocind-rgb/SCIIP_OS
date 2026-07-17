/** SCIIP_OS v7 Epic 3 Sprint 13 certification. */
function sciipTestV7Epic3Sprint13(){
  var failures=[],tests=0;function ok(name,condition){tests++;if(!condition)failures.push(name);}
  var actions=[
    {actionId:'A-1',opportunityId:'O-1',assetId:'P-1',market:'INLAND EMPIRE',assetType:'INDUSTRIAL',actionType:'ACQUIRE',capitalRequired:4000000,expectedValue:5600000,confidence:88,marketScore:85,executionHealth:82,evidenceQuality:92,riskScore:25,strategicFit:94,evidenceIds:['E-1','E-2'],latitude:34.1,longitude:-117.4},
    {actionId:'A-2',opportunityId:'O-2',assetId:'P-2',market:'SOUTH BAY',assetType:'INDUSTRIAL',actionType:'LEASE',capitalRequired:2500000,expectedValue:3400000,confidence:81,marketScore:78,executionHealth:75,evidenceQuality:86,riskScore:32,strategicFit:88,evidenceIds:['E-3'],latitude:33.8,longitude:-118.2},
    {actionId:'A-3',opportunityId:'O-3',assetId:'P-3',market:'INLAND EMPIRE',assetType:'LAND',actionType:'DEVELOP',capitalRequired:5000000,expectedValue:7000000,confidence:58,marketScore:80,executionHealth:70,evidenceQuality:55,riskScore:50,strategicFit:84,evidenceIds:[]}
  ];
  var ranked=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.rank(actions,{minimumEvidenceQuality:60,minimumConfidence:60});
  ok('governed ranking',ranked.eligible.length===2&&ranked.rejected.length===1&&ranked.eligible[0].actionId==='A-1');
  var allocation=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.allocate(actions,{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60,marketCaps:{'INLAND EMPIRE':4500000,'SOUTH BAY':3000000}});
  ok('capital constraints',allocation.selected.length===2&&allocation.allocatedCapital===6500000&&allocation.remainingCapital===0);
  var scenarios=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.scenarios(actions,{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60});
  ok('scenario comparison',scenarios.length===3&&scenarios[1].scenarioId==='BALANCED');
  var rejectedApproval=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.approve(allocation,{action:'APPROVE'});
  ok('approver gate',rejectedApproval.status==='REJECTED');
  var approval=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.approve(allocation,{action:'APPROVE',approvedBy:'EXEC-1',approvedAt:'2026-07-17T12:00:00Z'});
  ok('controlled approval',approval.status==='APPROVED_NOT_DEPLOYED'&&approval.autonomousCapitalDeployment===false);
  SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE.clearForTest();var persisted=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE.append([allocation,approval,approval]);
  ok('append-only duplicate safety',persisted.appended===2&&persisted.total===2);
  var app=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_APPLICATION.run({actions:actions,constraints:{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60}});
  ok('workspace GIS integration',app.mapPoints.length===2&&app.descriptor.workspace==='executive-opportunity-command');
  ok('North Star governance',app.descriptor.northStar.length===4&&app.descriptor.destructiveCommitEnabled===false&&app.summary.reviewRequired===true);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_13_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION',version:'v7.0-epic3-sprint13.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{eligibleActions:ranked.eligible.length,rejectedActions:ranked.rejected.length,selectedActions:allocation.selected.length,allocatedCapital:allocation.allocatedCapital,scenarios:scenarios.length,mapPoints:app.mapPoints.length,persistedEvents:persisted.total,workspace:app.descriptor.workspace,reviewRequired:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false}};
}
