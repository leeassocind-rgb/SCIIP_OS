function sciipTestV7Epic1Release2PersistentImportReview(){
  var failures=[];
  var values=[['Property Address','City','Building SF','Owner','Tenant','APN','Latitude','Longitude'],['2125 W Lowell St','Rialto','664859','Prologis LP','Amazon Logistics','0132-101-01','34.1001','-117.3801'],['18012 Slover Ave','Bloomington','300000','Slover Holdings LLC','','','','']];
  var preview=SCIIP_IDP_PREVIEW_V7.preview(values,{'2125 w lowell st|rialto|ca|0132 101 01':true});
  var existing={}; existing[preview.records[0].businessKey]={address:'2125 W Lowell St',city:'Rialto',state:'CA',apn:'0132-101-01',buildingSf:650000,owner:'Prologis'};
  var entities={OWNER:[{id:'OWN-1',label:'Prologis'},{id:'OWN-2',label:'Slover Holdings'}],TENANT:[{id:'TEN-1',label:'Amazon Fulfillment'}]};
  var review=SCIIP_IDP_REVIEW_V7.build(preview,existing,entities);
  if(review.length!==2)failures.push('Review row count failed.');
  if(review[0].changes.length<1)failures.push('Field change detection failed.');
  if(review[0].entityMatches.length<1)failures.push('Entity candidate generation failed.');
  var approved=SCIIP_IDP_REVIEW_V7.applyDecision(review[0],'APPROVE'); var held=SCIIP_IDP_REVIEW_V7.applyDecision(review[1],'HOLD');
  if(approved.reviewStatus!=='APPROVED')failures.push('Approval decision failed.');
  var plan=SCIIP_IDP_REVIEW_V7.prepareCommitPlan('IMPORT-TEST',[approved,held],'tester@example.com');
  if(plan.operationCount!==1||!plan.rollbackToken)failures.push('Commit preparation failed.');
  var ws=sciipIndustrialDataImportReviewWorkspace(); if(ws.destructiveCommitEnabled!==false)failures.push('Release 2 must not execute destructive commits.');
  var result={framework:'SCIIP_V7_EPIC_1_RELEASE_2_PERSISTENT_IMPORT_REVIEW',version:SCIIP_IDP_RELEASE2_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:7,failures:failures,result:{reviewRecords:review.length,fieldChanges:review[0].changes.length,entityMatches:review[0].entityMatches.length,approvedOperations:plan.operationCount,rollbackReady:!!plan.rollbackToken,workspace:ws.workspace,destructiveCommitEnabled:ws.destructiveCommitEnabled}};
  Logger.log(JSON.stringify(result)); if(failures.length)throw new Error(failures.join(' | ')); return result;
}
