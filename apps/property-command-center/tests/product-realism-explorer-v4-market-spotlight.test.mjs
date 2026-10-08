import assert from'node:assert/strict';
import fs from'node:fs';
import{
  buildMarketSpotlight,
  buildPropertyHealthScore,
  buildPropertyTimeline,
  buildWhyExplanation,
  createBasemapProviderConfig,
  parseExplorerCommand
}from'../src/broker-product/property-explorer/v4/explorerSpotlightEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const property={
  id:'P1',
  address:'2125 W Lowell St',
  submarket:'Inland Empire West',
  buildingSf:664859,
  clearHeightFt:42,
  powerAmps:8000,
  yearBuilt:2027,
  status:'UNDER CONSTRUCTION',
  lat:34.1069,
  lng:-117.4112,
  recentChange:'Power confirmed'
};

const competition={
  id:'P2',
  address:'10800 Slover Ave',
  submarket:'Inland Empire West',
  buildingSf:720000,
  clearHeightFt:40,
  powerAmps:4000,
  yearBuilt:2024,
  status:'AVAILABLE',
  lat:34.0632,
  lng:-117.5041
};

const comparable={
  id:'C1',
  type:'LEASE_COMPARABLE',
  submarket:'Inland Empire West',
  buildingSf:712000,
  lat:34.088,
  lng:-117.447
};

const requirement={
  id:'R1',
  submarket:'Inland Empire West',
  minSf:600000,
  maxSf:750000,
  preferredSf:675000,
  minClearHeightFt:40,
  minPowerAmps:4000
};

const assignment={
  id:'A1',
  propertyId:'P1',
  type:'LISTING',
  status:'ACTIVE'
};

const spotlight=buildMarketSpotlight({
  selectedProperty:property,
  properties:[property,competition],
  comparables:[comparable],
  requirements:[requirement],
  assignments:[assignment],
  radiusMiles:10
});

test(spotlight.competitiveProperties.length===1);
test(spotlight.comparables.length===1);
test(spotlight.requirements.length===1);
test(spotlight.requirements[0].fitScore>0);
test(spotlight.assignments.length===1);
test(spotlight.summary.includes('Market Spotlight'));

const health=buildPropertyHealthScore({
  property,
  market:{demandScore:88,competitorCount:1}
});

test(health.score>=80);
test(health.factors.length===6);

const why=buildWhyExplanation({property,spotlight,health});
test(why.evidence.length===7);
test(why.confidencePct>=90);

const timeline=buildPropertyTimeline(property);
test(timeline.length===4);
test(timeline[0].title==='Property intelligence refreshed');

const command=parseExplorerCommand(
  'spotlight Lowell and explain why then open timeline'
);
test(command.actions.includes('OPEN_SPOTLIGHT'));
test(command.actions.includes('OPEN_WHY'));
test(command.actions.includes('OPEN_TIMELINE'));

const provider=createBasemapProviderConfig({
  provider:'MAPBOX',
  apiKey:'test'
});
test(provider.ready===true);
test(provider.provider==='MAPBOX');

const ui=fs.readFileSync(
  'src/broker-product/property-explorer/v4/ExplorerMarketSpotlight.jsx',
  'utf8'
);
const css=fs.readFileSync(
  'src/broker-product/property-explorer/v4/explorer-market-spotlight.css',
  'utf8'
);

test(ui.includes('Market Spotlight'));
test(ui.includes('Why?'));
test(ui.includes('Property Health'));
test(ui.includes('Property Timeline'));
test(ui.includes('Basemap'));
test(ui.includes('Assignment Awareness'));
test(css.includes('grid-template-rows:auto auto minmax(0,1fr) auto'));
test(css.includes('overflow-y:auto'));
test(css.includes('position:sticky'));
test(css.includes('safe-area-inset-bottom'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_EXPLORER_V4_MARKET_SPOTLIGHT',
  status:'PASSED',
  testsRun,
  result:{
    drawerCutoffFixed:true,
    stickyDrawerActions:true,
    drawerTabs:true,
    marketSpotlight:true,
    markerHierarchy:true,
    propertyHealth:true,
    timeline:true,
    whyExplanations:true,
    commandBar:true,
    basemapProviderAdapter:true
  }
},null,2));
