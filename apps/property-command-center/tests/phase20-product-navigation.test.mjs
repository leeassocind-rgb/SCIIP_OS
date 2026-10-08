import assert from 'node:assert/strict';
import { PRODUCT_NAVIGATION, HIDDEN_ADVANCED_DESTINATIONS, assertProductNavigation } from '../src/product-shell/productNavigation.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=assertProductNavigation();
t(r.valid);
t(r.destinationCount===8);
t(PRODUCT_NAVIGATION[0].id==='Home');
t(PRODUCT_NAVIGATION[1].id==='Morning Brief');
t(PRODUCT_NAVIGATION.at(-1).id==='Copilot');
t(!PRODUCT_NAVIGATION.some(x=>x.id==='Platform Runtime'));
t(HIDDEN_ADVANCED_DESTINATIONS.includes('Platform Runtime'));
console.log(JSON.stringify({framework:'SCIIP_PHASE20_PRODUCT_NAVIGATION',status:'PASSED',testsRun:n,result:r},null,2));
