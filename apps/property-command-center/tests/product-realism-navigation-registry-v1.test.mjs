import assert from'node:assert/strict';
import fs from'node:fs';
import{
  CANONICAL_NAVIGATION,
  HIDDEN_ADVANCED_DESTINATIONS,
  NAVIGATION_REGISTRY_VERSION,
  assertNavigationRegistry,
  createNavigationForSurface,
  resolveNavigationId
}from'../src/product/navigation/NavigationRegistry.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

test(NAVIGATION_REGISTRY_VERSION==='1.0.0');
test(CANONICAL_NAVIGATION.length===5);
test(CANONICAL_NAVIGATION.map(item=>item.label).join('|')==='Home|Morning Brief|Assignments|Explorer|Copilot');
test(CANONICAL_NAVIGATION.find(item=>item.id==='Explorer').icon==='Map');
test(resolveNavigationId('Properties')==='Explorer');
test(resolveNavigationId('Map')==='Explorer');
test(resolveNavigationId('Search')==='Explorer');
test(resolveNavigationId('Assignments')==='Assignments');
test(resolveNavigationId('unknown')==='Home');
test(createNavigationForSurface('broker').length===5);
test(createNavigationForSurface('phase20').length===5);
test(HIDDEN_ADVANCED_DESTINATIONS.includes('Timeline'));
test(HIDDEN_ADVANCED_DESTINATIONS.includes('Search'));

const certification=assertNavigationRegistry();
test(certification.valid===true);
test(certification.destinationCount===5);
test(certification.explorerConsolidated===true);

const registry=fs.readFileSync('src/product/navigation/NavigationRegistry.js','utf8');
test(registry.includes('CANONICAL_NAVIGATION'));
test(registry.includes('NAVIGATION_ALIASES'));
test(registry.includes('createNavigationForSurface'));
test(registry.includes('assertNavigationRegistry'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_NAVIGATION_REGISTRY_V1',
  status:'PASSED',
  testsRun,
  result:{
    singleSourceOfTruth:true,
    fiveBrokerDestinations:true,
    explorerConsolidated:true,
    legacyAliases:true,
    hiddenAdvancedDestinations:true,
    multiSurfaceAdapters:true
  }
},null,2));
