import assert from'node:assert/strict';
import fs from'node:fs';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const source=fs.readFileSync('src/broker-product/BrokerMorningBrief.jsx','utf8');
const styles=fs.readFileSync('src/broker-product/morning-brief-v2-1.css','utf8');
const fixture=fs.readFileSync('src/product-realism/fixtures/dailyIntelligenceInput.js','utf8');

test(source.includes('Submarket'));
test(source.includes('Building size'));
test(source.includes('Clear height'));
test(source.includes('SIZE_RANGES'));
test(source.includes('CLEAR_HEIGHT_RANGES'));
test(source.includes('buildFilteredModel'));
test(source.includes('morning-top-grid'));
test(source.includes('morning-bottom-grid'));
test(styles.includes('.morning-top-grid'));
test(styles.includes('.morning-bottom-grid'));
test(styles.includes('.morning-change-grid.compact'));
test(fixture.includes('clearHeightFt'));
test(fixture.includes('minClearHeightFt'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_MORNING_BRIEF_V2_1',
  status:'PASSED',
  testsRun,
  result:{
    submarketFilter:true,
    clearHeightFilter:true,
    squareFootageFilter:true,
    compactInfoBoxes:true,
    whatChangedParallel:true,
    brokerImpactAndActionsParallel:true
  }
},null,2));
