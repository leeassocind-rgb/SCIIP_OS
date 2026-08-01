import assert from 'node:assert/strict';
import { createEnterpriseCommandBus } from '../src/enterprise-runtime/command-bus/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const bus=createEnterpriseCommandBus();
const received=[];
bus.subscribe({topic:'PROPERTY',workspace:'GIS Intelligence',handler:command=>{received.push(command);return {accepted:true}}});
bus.subscribe({topic:'PROPERTY',workspace:'Property Digital Twin',handler:command=>{received.push(command);return {accepted:true}}});

const first=bus.publish({
  commandKey:'PROPERTY:P1:SELECT',
  topic:'PROPERTY',
  type:'SELECT_PROPERTY',
  payload:{propertyId:'P1'},
  sourceWorkspace:'Unified Executive Command Platform',
  targetWorkspaces:['GIS Intelligence','Property Digital Twin'],
  priority:'HIGH'
});
const duplicate=bus.publish({
  commandKey:'PROPERTY:P1:SELECT',
  topic:'PROPERTY',
  type:'SELECT_PROPERTY',
  payload:{propertyId:'P1'},
  sourceWorkspace:'Unified Executive Command Platform'
});

t(first.status==='PUBLISHED');
t(first.deliveryCount===2);
t(received.length===2);
t(first.command.priority==='HIGH');
t(duplicate.status==='DUPLICATE_SKIPPED');
t(bus.replay({fromSequence:1}).length===1);
t(bus.snapshot().replayable);
t(bus.snapshot().priorityRouting);
t(!bus.snapshot().productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT112_ENTERPRISE_COMMAND_BUS',
  status:'PASSED',
  testsRun:tests,
  result:bus.snapshot()
},null,2));
