const freeze=v=>Object.freeze(v);

export function buildIncrementalDeltaPlan({previous=[],current=[],key='id'}={}) {
  const before=new Map(previous.map(row=>[String(row[key]),row]));
  const after=new Map(current.map(row=>[String(row[key]),row]));

  const inserts=[];
  const updates=[];
  const unchanged=[];
  const deletes=[];

  for(const [id,row] of after){
    if(!before.has(id)) inserts.push(row);
    else if(JSON.stringify(before.get(id))!==JSON.stringify(row)) updates.push(row);
    else unchanged.push(row);
  }
  for(const [id,row] of before){
    if(!after.has(id)) deletes.push(row);
  }

  return freeze({
    inserts:freeze(inserts),
    updates:freeze(updates),
    unchanged:freeze(unchanged),
    deletes:freeze(deletes),
    counts:freeze({
      inserts:inserts.length,
      updates:updates.length,
      unchanged:unchanged.length,
      deletes:deletes.length
    }),
    idempotent:true,
    deleteExecutionAllowed:false,
    autonomousCommitAllowed:false
  });
}
