const freeze = value => Object.freeze(value);
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

export function createMemoryEnterpriseStateStorage(seed={}) {
  const map = new Map(Object.entries(seed).map(([key,value])=>[key,clone(value)]));
  return freeze({
    get:key=>clone(map.get(key)),
    set:(key,value)=>{map.set(key,clone(value));return clone(value)},
    remove:key=>map.delete(key)
  });
}

export function createGlobalStateSynchronizer({
  storage=createMemoryEnterpriseStateStorage(),
  storageKey='sciip.phase11.global-state.v1',
  conflictResolver
}={}) {
  const listeners=new Set();
  let state=storage.get(storageKey)||{
    revision:0,
    vector:{},
    workspaces:{},
    selectedPropertyId:null,
    selectedEntityId:null,
    activeQuery:'',
    offlineQueue:[],
    updatedAt:null,
    productionExecutionAuthorized:false
  };

  const resolveConflict=conflictResolver||((current,incoming)=>{
    const currentClock=Number(current?.clock||0);
    const incomingClock=Number(incoming?.clock||0);
    if(incomingClock>currentClock)return incoming;
    if(incomingClock<currentClock)return current;
    return String(incoming?.workspace||'').localeCompare(String(current?.workspace||''))>=0?incoming:current;
  });

  const persist=next=>{
    state={...next,revision:Number(state.revision||0)+1,updatedAt:new Date().toISOString()};
    storage.set(storageKey,state);
    listeners.forEach(listener=>listener());
    return freeze(clone(state));
  };

  const applyUpdate=({workspace,clock,patch={},online=true}={})=>{
    if(!workspace)throw new Error('workspace is required');
    const incoming=freeze({workspace,clock:Number(clock||0),patch:freeze(clone(patch))});
    if(!online){
      return persist({...state,offlineQueue:[...state.offlineQueue,clone(incoming)]});
    }

    const current=state.workspaces[workspace];
    const resolved=resolveConflict(current,incoming);
    const nextVector={...state.vector,[workspace]:Math.max(Number(state.vector[workspace]||0),Number(clock||0))};
    const nextWorkspaces={...state.workspaces,[workspace]:clone(resolved)};
    const merged={...state,...patch,vector:nextVector,workspaces:nextWorkspaces};
    return persist(merged);
  };

  const flushOfflineQueue=()=>{
    const queued=[...state.offlineQueue];
    state={...state,offlineQueue:[]};
    for(const item of queued){
      state=clone(applyUpdate({...item,online:true}));
    }
    return freeze(clone(state));
  };

  const reconcile=({snapshots=[]}={})=>{
    let current=state;
    for(const snapshot of snapshots){
      const workspace=snapshot.workspace;
      const existing=current.workspaces[workspace];
      const resolved=resolveConflict(existing,snapshot);
      current={
        ...current,
        ...resolved.patch,
        vector:{...current.vector,[workspace]:Math.max(Number(current.vector[workspace]||0),Number(resolved.clock||0))},
        workspaces:{...current.workspaces,[workspace]:clone(resolved)}
      };
    }
    return persist(current);
  };

  return freeze({
    applyUpdate,
    flushOfflineQueue,
    reconcile,
    getSnapshot:()=>freeze(clone(state)),
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      persistent:true,
      revision:state.revision,
      workspaces:Object.keys(state.workspaces).length,
      queuedOfflineUpdates:state.offlineQueue.length,
      deterministicReconciliation:true,
      offlineRecovery:true,
      productionExecutionAuthorized:false
    })
  });
}
