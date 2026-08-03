const freeze=v=>Object.freeze(v);
const clone=v=>JSON.parse(JSON.stringify(v));

function normalizeFile(file,index){
  if(!file||typeof file!=='object')throw new Error(`Invalid batch file at index ${index}`);
  return freeze({
    batchItemId:file.batchItemId||`BATCH-${String(index+1).padStart(3,'0')}`,
    fileName:String(file.fileName||`supersheet-${index+1}`),
    format:String(file.format||'UNKNOWN').toUpperCase(),
    fileSize:Number(file.fileSize||0),
    rows:Number(file.rows||file.rowCount||0),
    checksum:file.checksum||null,
    status:file.status||'QUEUED',
    attemptCount:Number(file.attemptCount||0),
    duplicateOf:file.duplicateOf||null
  });
}

export function createBatchSuperSheetIntake({activationRuntime,maxBatchSize=50}={}){
  if(!activationRuntime?.patch||!activationRuntime?.getSnapshot)throw new Error('Activation runtime is required');
  const batches=new Map();

  const publish=batch=>{
    const state=activationRuntime.getSnapshot();
    activationRuntime.patch({...state,batchIntake:{status:batch.status,latest:clone(batch),batchCount:batches.size,productionWritesEnabled:false,sourceMutationAllowed:false}});
  };

  const stage=({batchId,files=[],source='MANUAL_BATCH'}={})=>{
    if(!batchId)throw new Error('batchId is required');
    if(!Array.isArray(files)||!files.length)throw new Error('At least one SuperSheet is required');
    if(files.length>maxBatchSize)throw new Error(`Batch exceeds maximum size of ${maxBatchSize}`);
    const normalized=files.map(normalizeFile);
    const checksumIndex=new Map();
    const items=normalized.map(item=>{
      if(!item.checksum)return item;
      if(checksumIndex.has(item.checksum))return freeze({...item,status:'DUPLICATE',duplicateOf:checksumIndex.get(item.checksum)});
      checksumIndex.set(item.checksum,item.batchItemId);
      return item;
    });
    const batch=freeze({
      batchId,source,status:'STAGED',
      fileCount:items.length,
      totalRows:items.reduce((sum,item)=>sum+item.rows,0),
      duplicates:items.filter(item=>item.status==='DUPLICATE').length,
      queued:items.filter(item=>item.status==='QUEUED').length,
      items:freeze(items),
      productionWritesEnabled:false,
      sourceMutationAllowed:false,
      createdAt:new Date().toISOString()
    });
    batches.set(batchId,batch);publish(batch);return batch;
  };

  const begin=({batchId}={})=>{
    const batch=batches.get(batchId);
    if(!batch)throw new Error(`Unknown batch: ${batchId}`);
    const next=freeze({...batch,status:'PROCESSING',items:freeze(batch.items.map(item=>item.status==='QUEUED'?freeze({...item,status:'READY'}):item))});
    batches.set(batchId,next);publish(next);return next;
  };

  const complete=({batchId,results=[]}={})=>{
    const batch=batches.get(batchId);
    if(!batch)throw new Error(`Unknown batch: ${batchId}`);
    const byId=new Map(results.map(r=>[r.batchItemId,r]));
    const items=batch.items.map(item=>{
      const result=byId.get(item.batchItemId);
      if(!result||item.status==='DUPLICATE')return item;
      return freeze({...item,status:result.status||'COMPLETED',accepted:Number(result.accepted||0),warnings:Number(result.warnings||0),rejected:Number(result.rejected||0),attemptCount:item.attemptCount+1});
    });
    const completed=items.filter(i=>['COMPLETED','PROMOTED'].includes(i.status)).length;
    const failed=items.filter(i=>i.status==='FAILED').length;
    const next=freeze({...batch,status:failed?'ATTENTION_REQUIRED':'COMPLETED',completed,failed,items:freeze(items),completedAt:new Date().toISOString()});
    batches.set(batchId,next);publish(next);return next;
  };

  return freeze({stage,begin,complete,read:batchId=>batches.get(batchId)||null,list:()=>freeze([...batches.values()])});
}
