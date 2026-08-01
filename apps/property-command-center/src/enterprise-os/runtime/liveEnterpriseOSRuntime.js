import { createEnterpriseDigitalTwinV2 } from '../digital-twin/index.js';

const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createMemoryEnterpriseOSStorage(seed={}) {
  const map=new Map(Object.entries(seed).map(([key,value])=>[key,clone(value)]));
  return freeze({
    get:key=>clone(map.get(key)),
    set:(key,value)=>{map.set(key,clone(value));return clone(value)},
    remove:key=>map.delete(key)
  });
}

export function createLiveEnterpriseOSRuntime({
  storage=createMemoryEnterpriseOSStorage(),
  storageKey='sciip.phase12.enterprise-os-runtime.v1'
}={}) {
  const twin=createEnterpriseDigitalTwinV2();
  let state=storage.get(storageKey)||{
    revision:0,
    enterprise:{portfolio:[],markets:[],workflows:[],decisions:[],capital:{},risks:[],opportunities:[]},
    health:'OPERATIONAL',
    synchronizedAt:null,
    productionExecutionAuthorized:false
  };
  const listeners=new Set();

  const persist=next=>{
    state={...next,revision:Number(state.revision||0)+1,synchronizedAt:new Date().toISOString()};
    storage.set(storageKey,state);
    listeners.forEach(listener=>listener());
    return freeze(clone(state));
  };

  const synchronize=enterpriseState=>{
    const twinResult=twin.synchronize(enterpriseState);
    const nextEnterprise=clone(twinResult.state);
    const criticalRisks=(nextEnterprise.risks||[]).filter(item=>['CRITICAL','HIGH'].includes(item.severity)&&item.status!=='CLOSED').length;
    return persist({
      ...state,
      enterprise:nextEnterprise,
      health:criticalRisks?'WATCH':'OPERATIONAL'
    });
  };

  const ingestEnterpriseSnapshot=({
    portfolio=[],markets=[],workflows=[],decisions=[],capital={},risks=[],opportunities=[]
  }={})=>synchronize({portfolio,markets,workflows,decisions,capital,risks,opportunities});

  return freeze({
    synchronize,
    ingestEnterpriseSnapshot,
    getSnapshot:()=>freeze(clone(state)),
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},
    forecast:options=>twin.forecast(options),
    simulate:options=>twin.simulate(options),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      persistent:true,
      revision:state.revision,
      health:state.health,
      synchronized:Boolean(state.synchronizedAt),
      enterpriseDigitalTwin:true,
      productionExecutionAuthorized:false
    })
  });
}
