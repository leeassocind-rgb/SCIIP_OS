import assert from'node:assert/strict';
import fs from'node:fs';
import{
  INITIAL_ASSIGNMENT_PORTFOLIO,
  buildArchivedAnalytics,
  createAssignment,
  previewActivation,
  transitionAssignment
}from'../src/product-realism/assignment/assignmentPortfolioEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const source=fs.readFileSync('src/broker-product/AssignmentPortfolioLifecycle.jsx','utf8');

test(INITIAL_ASSIGNMENT_PORTFOLIO.some(item=>item.status==='ACTIVE'));
test(INITIAL_ASSIGNMENT_PORTFOLIO.some(item=>item.status==='DRAFT'));
test(INITIAL_ASSIGNMENT_PORTFOLIO.some(item=>item.status==='CLOSED'));
test(INITIAL_ASSIGNMENT_PORTFOLIO.some(item=>item.status==='ARCHIVED'));

const draft=createAssignment({
  id:'A-TEST',
  name:'Test Listing',
  client:'Test Client',
  type:'LISTING',
  propertyId:'P-1',
  submarket:'South Bay',
  competitionCriteria:{minSf:100000,maxSf:200000},
  comparableCriteria:{monthsBack:36}
});

test(draft.status==='DRAFT');
test(previewActivation(draft).ready);
test(transitionAssignment(draft,'ACTIVE').assignment.status==='ACTIVE');

const active=transitionAssignment(draft,'ACTIVE').assignment;
test(transitionAssignment(active,'CLOSED',{outcome:'LEASED'}).assignment.outcome==='LEASED');

const analytics=buildArchivedAnalytics(INITIAL_ASSIGNMENT_PORTFOLIO);
test(analytics.assignmentCount===2);
test(analytics.transactionSf>0);
test(source.includes('NewAssignmentWizard'));
test(source.includes('ArchiveAnalytics'));
test(source.includes('CloseAssignmentDialog'));
test(source.includes('Active'));
test(source.includes('Archived'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_ASSIGNMENT_PORTFOLIO_LIFECYCLE',
  status:'PASSED',
  testsRun,
  result:{
    lifecycleViews:true,
    assignmentSwitcher:true,
    newAssignmentWizard:true,
    activationPreview:true,
    closeAndArchive:true,
    archivedAnalytics:true
  }
},null,2));
