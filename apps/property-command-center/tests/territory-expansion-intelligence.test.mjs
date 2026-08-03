import assert from 'node:assert/strict';
import { evaluateTerritories } from '../src/growth-strategy/territory/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateTerritories({territories:[
  {territoryId:'T1',demandScore:90,clientDensity:80,inventoryDepth:85,competitiveWhitespace:75,executionReadiness:80},
  {territoryId:'T2',demandScore:50,clientDensity:40,inventoryDepth:45,competitiveWhitespace:50,executionReadiness:40}
]});

t(r.total===2);
t(r.candidates===1);
t(r.topTerritory.territoryId==='T1');
t(r.topTerritory.status==='EXPANSION_CANDIDATE');
t(r.evidenceBacked);
t(r.executiveApprovalRequired);
t(!r.autonomousExpansionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT242_TERRITORY_EXPANSION_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
