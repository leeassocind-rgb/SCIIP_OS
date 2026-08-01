import { createExecutiveMissionControlModel } from './executiveMissionControlModel.js';

const freeze=value=>Object.freeze(value);

export function createLiveMissionControlAdapter({runtime}={}) {
  if(!runtime?.getSnapshot)throw new Error('Enterprise OS runtime is required');

  const read=()=>{
    const state=runtime.getSnapshot();
    const enterprise=state.enterprise||{};
    const model=createExecutiveMissionControlModel({
      twin:{status:runtime.snapshot().synchronized?'SYNCHRONIZED':'INITIALIZING'},
      commandBus:{status:'OPERATIONAL'},
      stateSync:{status:'OPERATIONAL'},
      portfolio:{assets:(enterprise.portfolio||[]).length},
      workflows:enterprise.workflows||[],
      recommendations:enterprise.recommendations||[],
      approvals:enterprise.approvals||[],
      risks:enterprise.risks||[],
      opportunities:enterprise.opportunities||[],
      capital:enterprise.capital||{}
    });
    return freeze({
      ...model,
      runtimeRevision:state.revision,
      synchronizedAt:state.synchronizedAt,
      liveData:true,
      stale:false,
      productionExecutionAuthorized:false
    });
  };

  return freeze({
    read,
    subscribe:listener=>runtime.subscribe(listener),
    snapshot:()=>freeze({
      status:'WIRED',
      liveData:true,
      reactive:true,
      productionExecutionAuthorized:false
    })
  });
}
