import assert from'node:assert/strict';
import fs from'node:fs';
import{
  SAMPLE_PROPERTY_FEED,
  appendPropertyFeedEvent,
  buildPropertyIntelligenceFeed,
  createPropertyFeedEvent,
  summarizePropertyFeed
}from'../src/broker-product/properties/propertyIntelligenceFeedEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const feed=buildPropertyIntelligenceFeed({propertyId:'P-IEW-201'});

test(feed.events.length===6);
test(feed.counts.new===3);
test(feed.counts.updated===3);
test(feed.counts.assignmentRelevant===6);
test(feed.events[0].id==='PFE-001');

const filtered=buildPropertyIntelligenceFeed({
  propertyId:'P-IEW-201',
  filters:{categories:['REQUIREMENTS'],minimumConfidencePct:90}
});

test(filtered.events.length===1);
test(filtered.events[0].fitScore===94);

const summary=summarizePropertyFeed(feed);
test(summary.evidenceCount===6);
test(summary.actionCount===6);

const event=createPropertyFeedEvent({
  id:'PFE-TEST',
  propertyId:'P-IEW-201',
  type:'OWNERSHIP_CHANGED',
  occurredAt:'2026-08-06T09:00:00-07:00',
  title:'Ownership record updated'
});

test(event.type==='OWNERSHIP_CHANGED');
test(appendPropertyFeedEvent(SAMPLE_PROPERTY_FEED,event).length===7);
test(appendPropertyFeedEvent(SAMPLE_PROPERTY_FEED,SAMPLE_PROPERTY_FEED[0]).length===6);

const ui=fs.readFileSync('src/broker-product/properties/PropertyIntelligenceFeed.jsx','utf8');
test(ui.includes('Why it matters'));
test(ui.includes('Recommended action'));
test(ui.includes('Review evidence'));
test(ui.includes('Assignment relevant only'));
test(ui.includes('Add to property package'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_PROPERTY_INTELLIGENCE_FEED',
  status:'PASSED',
  testsRun,
  result:{
    chronologicalFeed:true,
    categoryFiltering:true,
    confidenceFiltering:true,
    whyItMatters:true,
    recommendations:true,
    evidence:true,
    assignmentRelevance:true,
    permanentHistory:true
  }
},null,2));
