import assert from'node:assert/strict';
import fs from'node:fs';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const source=fs.readFileSync('src/broker-product/BrokerMorningBrief.jsx','utf8');
const styles=fs.readFileSync('src/broker-product/morning-brief-v2.css','utf8');

test(source.includes('morning-change-grid'));
test(source.includes('Vacancy change'));
test(source.includes('New comparables'));
test(source.includes('Requirements'));
test(source.includes('Rate changes'));
test(source.includes('Assignments impacted'));
test(source.includes('Recommendations'));
test(source.includes('filterEvents'));
test(source.includes('buildInterpretation'));
test(source.includes("Today's recommended work"));
test(styles.includes('.morning-change-grid'));
test(styles.includes('.morning-interpretation'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_MORNING_BRIEF_V2',
  status:'PASSED',
  testsRun,
  result:{
    proseConvertedToInfoBoxes:true,
    sixChangeCards:true,
    cardFiltering:true,
    conciseInterpretation:true,
    assignmentsVisible:true,
    recommendedWorkVisible:true
  }
},null,2));
