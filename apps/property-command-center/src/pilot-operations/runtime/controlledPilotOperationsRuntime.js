const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createMemoryPilotStorage(seed={}) {
  const map=new Map(Object.entries(seed).map(([k,v])=>[k,clone(v)]));
  return freeze({
    get:key=>clone(map.get(key)),
    set:(key,value)=>{map.set(key,clone(value));return clone(value)}
  });
}

export function createControlledPilotOperationsRuntime({
  storage=createMemoryPilotStorage(),
  storageKey='sciip.phase13.controlled-pilot-operations.v1'
}={}) {
  let state=storage.get(storageKey)||{
    revision:0,
    sessions:[],
    activeSessionId:null,
    users:[],
    datasets:[],
    approvals:[],
    startedAt:null,
    productionExecutionAuthorized:false
  };
  const listeners=new Set();

  const persist=next=>{
    state={...next,revision:Number(state.revision||0)+1};
    storage.set(storageKey,state);
    listeners.forEach(listener=>listener());
    return freeze(clone(state));
  };

  const startPilot=({pilotId,users=[],datasets=[],approvals=[]}={})=>{
    if(!pilotId)throw new Error('pilotId is required');
    if(!approvals.some(item=>item.status==='APPROVED'))throw new Error('Pilot approval required');
    const session=freeze({
      pilotId,
      status:'ACTIVE',
      startedAt:new Date().toISOString(),
      productionExecutionAuthorized:false
    });
    return persist({
      ...state,
      sessions:[...state.sessions,session],
      activeSessionId:pilotId,
      users:clone(users),
      datasets:clone(datasets),
      approvals:clone(approvals),
      startedAt:session.startedAt
    });
  };

  const stopPilot=({pilotId,reason,approvedBy}={})=>{
    if(!pilotId||!approvedBy)throw new Error('pilotId and approvedBy are required');
    const sessions=state.sessions.map(item=>item.pilotId===pilotId?freeze({
      ...item,status:'STOPPED',reason,approvedBy,stoppedAt:new Date().toISOString()
    }):item);
    return persist({...state,sessions,activeSessionId:null});
  };

  return freeze({
    startPilot,
    stopPilot,
    getSnapshot:()=>freeze(clone(state)),
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},
    snapshot:()=>freeze({
      status:state.activeSessionId?'ACTIVE':'IDLE',
      persistent:true,
      revision:state.revision,
      sessions:state.sessions.length,
      activeSessionId:state.activeSessionId,
      governed:true,
      productionExecutionAuthorized:false
    })
  });
}
