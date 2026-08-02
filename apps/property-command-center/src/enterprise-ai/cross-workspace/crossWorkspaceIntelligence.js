const freeze=value=>Object.freeze(value);

export function createCrossWorkspaceIntelligence(){
  let revision=0;
  let context=freeze({});
  const history=[];
  const subscribers=new Set();

  const publish=next=>{
    revision+=1;
    context=freeze({...context,...next,revision});
    history.push(context);
    for(const subscriber of subscribers) subscriber(context);
    return context;
  };

  const subscribe=subscriber=>{
    subscribers.add(subscriber);
    return()=>subscribers.delete(subscriber);
  };

  return freeze({
    publish,
    subscribe,
    snapshot:()=>freeze({
      context,
      revision,
      history:freeze([...history]),
      crossWorkspace:true,
      persistentContext:true,
      eventOrchestrated:true,
      autonomousExecutionAllowed:false
    })
  });
}
