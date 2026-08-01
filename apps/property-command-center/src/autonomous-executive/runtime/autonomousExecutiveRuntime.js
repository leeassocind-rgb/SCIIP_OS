import { createGovernedExecutiveEventStream } from '../event-stream/index.js';
import { createExecutiveOrchestrationEngine } from '../orchestration/index.js';
import { instantiateExecutivePlaybook } from '../playbooks/index.js';
import { evaluateExecutiveConditions } from '../monitoring/index.js';
import { createEnterpriseObservabilitySnapshot } from '../observability/index.js';

const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createMemoryAutonomousExecutiveStorage(seed={}) {
  const map=new Map(Object.entries(seed).map(([key,value])=>[key,clone(value)]));
  return freeze({
    get:key=>clone(map.get(key)),
    set:(key,value)=>{map.set(key,clone(value));return clone(value)},
    remove:key=>map.delete(key)
  });
}

export function createAutonomousExecutiveRuntime({
  storage=createMemoryAutonomousExecutiveStorage(),
  storageKey='sciip.phase9.autonomous-executive-runtime.v1'
}={}) {
  const stream=createGovernedExecutiveEventStream();
  const orchestration=createExecutiveOrchestrationEngine();
  let state=storage.get(storageKey)||{
    revision:0,
    events:[],
    runs:[],
    playbooks:[],
    alerts:[],
    observability:{health:'OPERATIONAL'},
    updatedAt:null,
    productionExecutionAuthorized:false
  };
  const listeners=new Set();

  const persist=next=>{
    state={...next,revision:Number(state.revision||0)+1,updatedAt:new Date().toISOString()};
    storage.set(storageKey,state);
    listeners.forEach(listener=>listener());
    return freeze(clone(state));
  };

  const publishEvent=event=>{
    const result=stream.publish(event);
    if(result.status==='DUPLICATE_SKIPPED')return freeze({result,state:freeze(clone(state))});
    return freeze({result,state:persist({...state,events:[...state.events,clone(result.event)]})});
  };

  const planEvent=({event,handlers}={})=>{
    const run=orchestration.orchestrate({event,handlers});
    return persist({...state,runs:[...state.runs,clone(run)]});
  };

  const createPlaybook=({template,context}={})=>{
    const playbook=instantiateExecutivePlaybook({template,context});
    return persist({...state,playbooks:[...state.playbooks,clone(playbook)]});
  };

  const evaluateAlerts=({signals,rules}={})=>{
    const result=evaluateExecutiveConditions({signals,rules});
    return persist({...state,alerts:[...state.alerts,...clone(result.alerts)]});
  };

  const refreshObservability=()=>{
    const snapshot=createEnterpriseObservabilitySnapshot({
      events:state.events,runs:state.runs,playbooks:state.playbooks,alerts:state.alerts
    });
    return persist({...state,observability:clone(snapshot)});
  };

  return freeze({
    publishEvent,planEvent,createPlaybook,evaluateAlerts,refreshObservability,
    getSnapshot:()=>freeze(clone(state)),
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      persistent:true,
      revision:state.revision,
      events:state.events.length,
      runs:state.runs.length,
      playbooks:state.playbooks.length,
      alerts:state.alerts.length,
      productionExecutionAuthorized:false
    })
  });
}
