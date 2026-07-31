const freeze=v=>Object.freeze(v);const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
export function createMemoryCommandStorage(seed={}){const m=new Map(Object.entries(seed));return freeze({get:k=>clone(m.get(k)),set:(k,v)=>(m.set(k,clone(v)),clone(v))});}
export function createUnifiedCommandRuntime({storage=createMemoryCommandStorage(),key='sciip.phase7.command.v1'}={}){
 let state=storage.get(key)||{revision:0,query:'',selectedPropertyId:null,selectedEntityId:null,workspace:'Executive Command Center',history:[],handoffs:[],productionExecutionAuthorized:false};const listeners=new Set();
 const persist=next=>{state={...next,revision:state.revision+1,updatedAt:new Date().toISOString()};storage.set(key,state);listeners.forEach(f=>f());return freeze(clone(state));};
 const dispatch=({type,payload={}}={})=>{const event=freeze({eventId:`CMD-${state.history.length+1}`,type,payload:freeze({...payload}),occurredAt:new Date().toISOString()});let next={...state,history:[...state.history,event]};
  if(type==='SET_QUERY')next.query=String(payload.query||'');if(type==='SELECT_PROPERTY')next.selectedPropertyId=payload.propertyId||null;if(type==='SELECT_ENTITY')next.selectedEntityId=payload.entityId||null;if(type==='NAVIGATE')next.workspace=payload.workspace||next.workspace;if(type==='HANDOFF')next.handoffs=[...state.handoffs,freeze({...payload})];return persist(next);};
 return freeze({dispatch,getSnapshot:()=>freeze(clone(state)),subscribe:f=>(listeners.add(f),()=>listeners.delete(f)),snapshot:()=>freeze({status:'OPERATIONAL',persistent:true,revision:state.revision,productionExecutionAuthorized:false})});
}
