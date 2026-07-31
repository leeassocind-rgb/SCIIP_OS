import assert from 'node:assert/strict';
import { stitchCrossSuperSheetRelationships } from '../src/production-activation/graph-stitching/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=stitchCrossSuperSheetRelationships({records:[
  {id:'R1',canonicalPropertyId:'P1',address:'100 Main',tenantId:'T1',tenantName:'Acme',sourceFile:'A.xlsx'},
  {id:'R2',canonicalPropertyId:'P1',eventId:'E1',eventType:'NEW_LISTING',eventDate:'2026-07-31',sourceFile:'B.xlsx'},
  {id:'R3',canonicalPropertyId:'P1',compId:'C1',compType:'LEASE',sourceFile:'C.xlsx'},
  {id:'R4',tenantId:'T2',tenantName:'No Property',sourceFile:'D.xlsx'}
]});

t(result.nodeCount===5);
t(result.edgeCount===3);
t(result.unresolvedCount===1);
t(result.nodes.some(node=>node.type==='PROPERTY'));
t(result.edges.some(edge=>edge.type==='AFFECTS_PROPERTY'));
t(result.duplicateSafe);
t(!result.sourceMutationAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT70_CROSS_SUPERSHEET_RELATIONSHIP_STITCHING',
  status:'PASSED',
  testsRun:tests,
  result:{nodeCount:result.nodeCount,edgeCount:result.edgeCount,unresolvedCount:result.unresolvedCount}
},null,2));
