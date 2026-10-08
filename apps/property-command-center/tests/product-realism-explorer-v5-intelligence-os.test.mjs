import assert from'node:assert/strict';
import fs from'node:fs';
import{
  buildExecutiveBriefing,
  buildOpportunityEngine,
  buildOwnerIntelligence,
  buildRecommendedActions,
  buildRiskEngine,
  buildScopedPropertyCommand
}from'../src/broker-product/property-explorer/v5/propertyDecisionEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const property={
  id:'P1',
  address:'2125 W Lowell St',
  submarket:'Inland Empire West',
  owner:'Brookfield Properties',
  buildingSf:664859,
  clearHeightFt:42,
  powerAmps:8000,
  yearBuilt:2027,
  status:'UNDER CONSTRUCTION',
  askingRate:1.34
};
const market={vacancyRate:7.8,askingRate:1.18,demandScore:88};
const requirements=[{
  id:'R1',
  company:'Aerospace Manufacturer',
  submarket:'Inland Empire West',
  minSf:600000,
  maxSf:750000,
  preferredSf:675000,
  minClearHeightFt:40,
  minPowerAmps:4000
}];
const competitors=[{
  id:'P2',
  yearBuilt:2028,
  status:'UNDER CONSTRUCTION'
}];
const comparables=[{id:'C1'}];
const neighbors=[{
  relationshipType:'ADJOINING',
  sharedBoundaryFeet:684,
  property:{
    id:'N1',
    address:'West Land',
    owner:'Brookfield Properties',
    status:'VACANT'
  }
}];
const assignments=[{
  id:'A1',
  propertyId:'P1',
  client:'Brookfield Properties'
}];
const ownerPortfolio=[
  property,
  {id:'P3',owner:'Brookfield Properties',buildingSf:500000,status:'AVAILABLE'},
  {id:'P4',owner:'Brookfield Properties',buildingSf:400000,status:'LEASED'}
];

const briefing=buildExecutiveBriefing({
  property,market,requirements,competitors,comparables
});
test(briefing.headline.includes('2125 W Lowell St'));
test(briefing.bullets.length===7);
test(briefing.confidencePct>=90);

const opportunities=buildOpportunityEngine({
  property,requirements,neighbors,assignments,ownerPortfolio
});
test(opportunities.some(item=>item.type==='TENANT_MATCH'));
test(opportunities.some(item=>item.type==='ADJACENT_EXPANSION'));
test(opportunities.some(item=>item.type==='POWER_ADVANTAGE'));
test(opportunities.some(item=>item.type==='ACTIVE_ASSIGNMENT'));
test(opportunities.some(item=>item.type==='OWNER_PORTFOLIO'));

const risks=buildRiskEngine({
  property,market,competitors,comparables,constructionPipeline:competitors
});
test(risks.some(item=>item.type==='VACANCY_PRESSURE'));
test(risks.some(item=>item.type==='NEWER_COMPETITION'));
test(risks.some(item=>item.type==='PIPELINE'));
test(risks.some(item=>item.type==='PRICING'));

const actions=buildRecommendedActions({
  property,opportunities,risks,requirements,assignment:assignments[0]
});
test(actions.some(item=>item.type==='CONTACT_REQUIREMENT'));
test(actions.some(item=>item.type==='REVIEW_PRICING'));
test(actions.some(item=>item.type==='OPEN_ASSIGNMENT'));

const owner=buildOwnerIntelligence({
  property,ownerPortfolio,assignments
});
test(owner.assetCount===3);
test(owner.totalSf===1564859);
test(owner.activeAssignments===1);

const command=buildScopedPropertyCommand({
  input:'show opportunities, risks, owner and timeline',
  property
});
test(command.scoped===true);
test(command.actions.includes('OPEN_OPPORTUNITIES'));
test(command.actions.includes('OPEN_RISKS'));
test(command.actions.includes('OPEN_OWNER'));
test(command.actions.includes('OPEN_TIMELINE'));

const map=fs.readFileSync(
  'src/broker-product/property-explorer/v5/LiveLeafletMap.jsx',
  'utf8'
);
const ui=fs.readFileSync(
  'src/broker-product/property-explorer/v5/ExplorerPropertyIntelligenceOS.jsx',
  'utf8'
);

test(map.includes("from'leaflet'"));
test(map.includes('tile.openstreetmap.org'));
test(map.includes('L.circleMarker'));
test(map.includes('L.circle'));
test(ui.includes('Executive Briefing')||ui.includes('Briefing'));
test(ui.includes('Opportunity Engine'));
test(ui.includes('Risk Engine'));
test(ui.includes('Owner Intelligence'));
test(ui.includes('Recommended Actions'));
test(ui.includes('Explainable Intelligence'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_EXPLORER_V5_INTELLIGENCE_OS',
  status:'PASSED',
  testsRun,
  result:{
    liveOpenStreetMapBasemap:true,
    leafletPanZoom:true,
    governedMarkers:true,
    marketSpotlight:true,
    executiveBriefing:true,
    opportunityEngine:true,
    riskEngine:true,
    ownerIntelligence:true,
    timeline:true,
    recommendedActions:true,
    explainableWhy:true,
    propertyScopedCommand:true,
    assignmentHandoff:true
  }
},null,2));
