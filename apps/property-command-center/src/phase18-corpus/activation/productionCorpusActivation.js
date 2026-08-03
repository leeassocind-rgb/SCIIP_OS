const freeze=v=>Object.freeze(v);

export function activateProductionCorpus({datasets=[],mode='DRY_RUN'}={}) {
  const rows=datasets.map((dataset,index)=>{
    const eligible=dataset.certified===true&&Number(dataset.rowCount||0)>0;
    return freeze({
      activationId:`CORPUS-${String(index+1).padStart(3,'0')}`,
      datasetId:dataset.datasetId,
      name:dataset.name,
      rowCount:Number(dataset.rowCount||0),
      mode,
      eligible,
      status:eligible?'READY_FOR_ACTIVATION':'BLOCKED',
      immutableSourceRequired:true
    });
  });

  return freeze({
    datasets:freeze(rows),
    total:rows.length,
    ready:rows.filter(r=>r.eligible).length,
    blocked:rows.filter(r=>!r.eligible).length,
    totalRows:rows.reduce((sum,r)=>sum+r.rowCount,0),
    mode,
    activationGoverned:true,
    autonomousActivationAllowed:false
  });
}
