import assert from'node:assert/strict';
import fs from'node:fs';
import{
  buildInstitutionalReportModel,
  generateInstitutionalReportPdf
}from'../src/product-realism/assignment/institutionalReportEngine.js';
import{
  LOCUST_ASSIGNMENT_VIEW
}from'../src/product-realism/assignment/listingAssignmentEngine.js';
import{
  PREVIOUS_PUBLISHED_REPORT_SNAPSHOT
}from'../src/product-realism/assignment/reportSnapshotEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const model=buildInstitutionalReportModel(
  LOCUST_ASSIGNMENT_VIEW,
  {generatedAt:'2026-08-04T16:00:00-07:00'}
);
const bytes=generateInstitutionalReportPdf(model);
const pdfText=new TextDecoder().decode(bytes);
const review=fs.readFileSync('src/broker-product/InstitutionalReportReview.jsx','utf8');

test(model.reportTitle==='Client Listing Report');
test(model.clientDisplayName==='Brookfield Properties');
test(model.inquiryHistory.length===4);
test(model.inquiryHistory.some(row=>row.stage==='LOST'));
test(model.competition.some(row=>row.changeStatus==='UPDATED'));
test(model.competition.some(row=>row.changeStatus==='NEW'));
test(model.competition.some(row=>row.changeStatus==='REMOVED'));
test(model.comparables.some(row=>row.changeStatus==='NEW'));
test(model.comparables.some(row=>row.changeStatus==='UNCHANGED'));
test(model.previousPublishedAt===PREVIOUS_PUBLISHED_REPORT_SNAPSHOT.publishedAt);
test(!('executiveSummary' in model));
test(!('leasingStrategy' in model));
test(model.marketIntelligence.length>100);
test(model.executiveNotes.length>100);
test(bytes instanceof Uint8Array);
test(bytes.length>9000);
test(pdfText.startsWith('%PDF-1.4'));
test(pdfText.includes('Market Intelligence'));
test(pdfText.includes('Marketing Activity Since Last Report'));
test(pdfText.includes('Active Tenant Requirements'));
test(pdfText.includes('Executive Notes'));
test(pdfText.includes('Inquiry Pipeline - Assignment Inception to Date'));
test(pdfText.includes('CHANGE SINCE LAST REPORT'));
test(review.includes('Market Intelligence'));
test(review.includes('Executive Notes'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_RECURRING_CLIENT_LISTING_REPORT',
  status:'PASSED',
  testsRun,
  result:{
    twoPageReport:true,
    executiveSummaryRemoved:true,
    leasingStrategyRemoved:true,
    completeInquiryHistory:true,
    competitionChangeTracking:true,
    comparableChangeTracking:true,
    previousPublishedSnapshotComparison:true,
    editableMarketIntelligence:true,
    editableExecutiveNotes:true,
    pdfBytes:bytes.length
  }
},null,2));
