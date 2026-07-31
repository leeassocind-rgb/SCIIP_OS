const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createLiveSuperSheetRuntime({activationRuntime}={}){
  if(!activationRuntime?.patch||!activationRuntime?.getSnapshot)throw new Error('Activation runtime is required');
  const history=[];
  const publish=({parsed,mapping,required,results=[],promoted=false,duplicate=false,error=null}={})=>{
    if(!parsed&&!error)throw new Error('Parsed SuperSheet or error is required');
    const summary=results.reduce((acc,row)=>{
      const status=row.status||'REJECTED';
      acc[status]=(acc[status]||0)+1;
      return acc;
    },{ACCEPTED:0,WARNING:0,REJECTED:0});
    const event=freeze({
      eventId:`LIVE-SS-${history.length+1}`,
      fileName:parsed?.fileName||null,
      format:parsed?.format||null,
      fileSize:Number(parsed?.fileSize||0),
      inputRows:Number(parsed?.rows?.length||0),
      schemaCoveragePct:Number(((mapping?.coverage||0)*100).toFixed(2)),
      requiredHeadersValid:Boolean(required?.valid),
      missingHeaders:freeze([...(required?.missing||[])]),
      accepted:Number(summary.ACCEPTED||0),
      warnings:Number(summary.WARNING||0),
      rejected:Number(summary.REJECTED||0),
      promoted:Boolean(promoted),
      duplicate:Boolean(duplicate),
      error:error?String(error):null,
      productionWritesEnabled:false,
      sourceMutationAllowed:false,
      occurredAt:new Date().toISOString()
    });
    history.push(event);
    const current=activationRuntime.getSnapshot();
    activationRuntime.patch({
      ...current,
      ingestion:{
        status:error?'ERROR':promoted?'PROMOTED':required?.valid?'VALIDATED':'SCHEMA_BLOCKED',
        latest:event,
        history:clone(history),
        totalRuns:history.length,
        productionWritesEnabled:false,
        sourceMutationAllowed:false
      }
    });
    return event;
  };
  return Object.freeze({
    publish,
    history:()=>freeze([...history]),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      events:history.length,
      liveParserConnected:true,
      liveNormalizerConnected:true,
      productionWritesEnabled:false,
      sourceMutationAllowed:false
    })
  });
}
