const freeze=value=>Object.freeze(value);

export function createExecutiveAIMemory(){
  const records=[];
  const seen=new Set();

  const remember=record=>{
    if(!record?.memoryId) throw new Error('memoryId is required');
    if(seen.has(record.memoryId)) return freeze({status:'DUPLICATE_SKIPPED',memoryId:record.memoryId});
    seen.add(record.memoryId);
    const saved=freeze({
      ...record,
      preservedAt:record.preservedAt||new Date().toISOString(),
      permanent:true
    });
    records.push(saved);
    return freeze({status:'PRESERVED',memory:saved});
  };

  const recall=({scope,subjectId,limit=20}={})=>{
    const matches=records
      .filter(item=>(!scope||item.scope===scope)&&(!subjectId||item.subjectId===subjectId))
      .slice(-limit);
    return freeze({
      records:freeze([...matches]),
      count:matches.length,
      persistent:true,
      traceable:true
    });
  };

  return freeze({
    remember,
    recall,
    snapshot:()=>freeze({
      memories:records.length,
      duplicateSafe:true,
      persistent:true,
      autonomousExecutionAllowed:false
    })
  });
}
