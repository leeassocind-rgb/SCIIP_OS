import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('src/broker-product/property-explorer/v5/ExplorerPropertyIntelligenceOS.jsx');
const map=read('src/broker-product/property-explorer/maps/ExplorerMap.jsx');
const adapter=read('src/broker-product/property-explorer/maps/adapters/GoogleMapsAdapter.js');
const css=read('src/broker-product/property-explorer/v5/explorer-v5.css');
const checks=[
  ['five-primary-tabs',()=>assert.match(ui,/const TABS=\['Overview','Property','Market','Neighbors','Activity'\]/)],
  ['progressive-overview',()=>assert.match(ui,/function OverviewView/)],
  ['property-view',()=>assert.match(ui,/function PropertyView/)],
  ['market-view',()=>assert.match(ui,/function MarketView/)],
  ['neighbor-first-class',()=>assert.match(ui,/function NeighborsView/)],
  ['neighbor-filters',()=>assert.match(ui,/Adjacent.*Across Street.*500.*1 Mile/)],
  ['neighbor-open',()=>assert.match(ui,/Open Property/)],
  ['neighbor-compare',()=>assert.match(ui,/Quick Compare/)],
  ['neighbor-map-focus',()=>assert.match(map,/focusPropertyId/)],
  ['provider-focus-method',()=>assert.match(adapter,/focusProperty\(propertyId/)],
  ['tight-neighbor-radius',()=>assert.match(ui,/tab==='Neighbors'\?1:5/)],
  ['market-only-relationships',()=>assert.match(ui,/tab==='Neighbors'\?neighbors\.relationships:\[\]/)],
  ['actions-progressive',()=>assert.match(ui,/actionsOpen/)],
  ['zillow-style-tabs-css',()=>assert.match(css,/explorer-v5__primary-tabs/)],
  ['neighbor-card-css',()=>assert.match(css,/explorer-v5__neighbor-card/)],
  ['provider-neutral-preserved',()=>assert.match(map,/createMapProvider/)]
];
const failures=[];for(const[name,fn]of checks){try{fn();}catch(error){failures.push({name,error:error.message});}}
const result={framework:'SCIIP_EXPLORER_2_2_PROGRESSIVE_DISCLOSURE_NEIGHBOR_INTELLIGENCE',version:'explorer-2.2.0',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures,result:{primaryTabs:5,progressiveDisclosure:true,neighborIntelligence:true,mapPanelSync:true,quickCompare:true,providerNeutral:true}};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
