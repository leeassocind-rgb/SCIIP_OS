import fs from'node:fs';
import assert from'node:assert/strict';
import{buildImmediateNeighbors}from'../src/broker-product/property-explorer/v4_3/immediateNeighborEngine.js';
import{EXPLORER3_PROPERTIES,EXPLORER3_RELATIONSHIPS}from'../src/broker-product/property-explorer/v6/explorer3Data.js';
import{buildMarketContext,passesMarketFilters}from'../src/broker-product/property-explorer/v6/marketContextEngine.js';

const jsx=fs.readFileSync(new URL('../src/broker-product/property-explorer/v6/Explorer3.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/broker-product/property-explorer/v6/explorer3.css',import.meta.url),'utf8');
const checks=[];
const test=(name,fn)=>{fn();checks.push({name,status:'PASSED'});};

test('neighbor engine survives every current property',()=>{for(const subject of EXPLORER3_PROPERTIES)buildImmediateNeighbors({subject,properties:EXPLORER3_PROPERTIES,parcelRelationships:EXPLORER3_RELATIONSHIPS,maxDistanceMiles:2});});
test('diagonal relationship is normalized to cardinal bucket',()=>{const subject=EXPLORER3_PROPERTIES.find(row=>row.id==='P-IEW-201');const result=buildImmediateNeighbors({subject,properties:EXPLORER3_PROPERTIES,parcelRelationships:EXPLORER3_RELATIONSHIPS,maxDistanceMiles:2});assert.ok(result.relationships.every(row=>['NORTH','EAST','SOUTH','WEST'].includes(row.direction)));});
test('market radius changes cohort',()=>{const subject=EXPLORER3_PROPERTIES.find(row=>row.id==='P-IEW-701');const five=buildMarketContext({subject,properties:EXPLORER3_PROPERTIES,radiusMiles:5});const ten=buildMarketContext({subject,properties:EXPLORER3_PROPERTIES,radiusMiles:10});assert.ok(ten.cohort.length>five.cohort.length);});
test('sf filter is enforced',()=>assert.equal(passesMarketFilters({buildingSf:200000,clearHeightFt:40},{minSf:300000,maxSf:0,minClearHeight:0}),false));
test('clear height filter is enforced',()=>assert.equal(passesMarketFilters({buildingSf:500000,clearHeightFt:32},{minSf:0,maxSf:0,minClearHeight:36}),false));
test('subject remains in cohort',()=>{const subject=EXPLORER3_PROPERTIES[0];const result=buildMarketContext({subject,properties:EXPLORER3_PROPERTIES,radiusMiles:1,filters:{minSf:999999,maxSf:0,minClearHeight:60}});assert.ok(result.cohort.some(row=>row.id===subject.id));});
test('market context exposes six auditable metrics',()=>{const result=buildMarketContext({subject:EXPLORER3_PROPERTIES[0],properties:EXPLORER3_PROPERTIES,radiusMiles:10});assert.equal(result.metrics.length,6);assert.ok(result.metrics.every(metric=>Array.isArray(metric.rows)));});
test('average asking metric exists',()=>{const result=buildMarketContext({subject:EXPLORER3_PROPERTIES[0],properties:EXPLORER3_PROPERTIES,radiusMiles:10});assert.equal(result.metrics.find(row=>row.id==='asking')?.label,'Avg Asking');});
test('average lease comp metric exists',()=>{const result=buildMarketContext({subject:EXPLORER3_PROPERTIES[0],properties:EXPLORER3_PROPERTIES,radiusMiles:10});assert.equal(result.metrics.find(row=>row.id==='comp-rate')?.label,'Avg Lease Comp');});
test('available metric is auditable',()=>{const result=buildMarketContext({subject:EXPLORER3_PROPERTIES[1],properties:EXPLORER3_PROPERTIES,radiusMiles:10});const metric=result.metrics.find(row=>row.id==='available');assert.ok(metric.rows.every(row=>row.propertyId));});
test('market context ribbon replaces executive event ribbon',()=>{assert.ok(jsx.includes('function MarketContextRibbon'));assert.ok(!jsx.includes('function ExecutiveRibbon'));});
test('radius controls are first class',()=>assert.ok(jsx.includes('MARKET_RADII.map')));
test('ribbon metrics are clickable',()=>assert.ok(jsx.includes('onClick={()=>onSelect(item.id)}')));
test('metric drilldown supports show on map',()=>assert.ok(jsx.includes('function MarketMetricDetailPanel')&&jsx.includes('Show on map')));
test('map data retains direct checkboxes',()=>assert.ok(jsx.includes('type="checkbox"')));
test('sf cohort filters are wired',()=>assert.ok(jsx.includes("updateFilter('minSf'")&&jsx.includes("updateFilter('maxSf'")));
test('clear height cohort filter is wired',()=>assert.ok(jsx.includes("updateFilter('minClearHeight'")));
test('market filters affect visible properties',()=>assert.ok(jsx.includes('passesMarketFilters(item,marketFilters)')));
test('market filters affect market context',()=>assert.ok(jsx.includes('filters:marketFilters')));
test('selected property remains visible',()=>assert.ok(jsx.includes('if(item.id===property.id)return true')));
test('spotlight follows selected market radius',()=>assert.ok(jsx.includes("state.drawerSection==='neighbors'?1:marketRadius")));
test('filtered state is surfaced',()=>assert.ok(jsx.includes('context.filtered')&&css.includes('.explorer3__cohort-filtered')));
test('market ribbon has dedicated responsive css',()=>assert.ok(css.includes('.explorer3__market-ribbon')&&css.includes('.explorer3__radius-control')));
test('cohort inputs have dedicated css',()=>assert.ok(css.includes('.explorer3__cohort-fields input')));

console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_MILESTONE_1_4_DYNAMIC_MARKET_CONTEXT_RUNTIME_HOTFIX',version:'explorer-3.0-m1.4',status:'PASSED',testsRun:checks.length,checks},null,2));
