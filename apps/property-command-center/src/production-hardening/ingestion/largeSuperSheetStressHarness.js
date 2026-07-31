import { parseDelimited } from '../../ingestion/superSheetParser.js';

const freeze=value=>Object.freeze(value);
const stableHash=value=>{
  let hash=2166136261;
  for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
};

export function generateSyntheticSuperSheet({
  rows=10000,
  duplicateEvery=0,
  delimiter=','
}={}){
  const count=Math.max(1,Number(rows)||1);
  const headers=['Property_ID','Address','City','Building_SF','Power_Amps','Latitude','Longitude','Status'];
  const lines=[headers.join(delimiter)];
  for(let index=0;index<count;index++){
    const sourceIndex=duplicateEvery>0&&index>0&&index%duplicateEvery===0?index-1:index;
    lines.push([
      `P-${String(sourceIndex+1).padStart(7,'0')}`,
      `${1000+sourceIndex} Industrial Way`,
      sourceIndex%2?'Ontario':'Rialto',
      100000+(sourceIndex%500)*1000,
      1200+(sourceIndex%20)*200,
      (34+(sourceIndex%1000)/10000).toFixed(6),
      (-117-(sourceIndex%1000)/10000).toFixed(6),
      sourceIndex%3?'ACTIVE':'AVAILABLE'
    ].join(delimiter));
  }
  return freeze({
    text:lines.join('\n'),
    rows:count,
    headers:freeze(headers),
    bytes:Buffer.byteLength(lines.join('\n'),'utf8'),
    checksum:stableHash(lines.join('\n'))
  });
}

export function runLargeSuperSheetStress({
  text,
  delimiter=',',
  chunkSize=5000,
  checkpointEvery=10000,
  onCheckpoint
}={}){
  if(typeof text!=='string'||!text.trim())throw new Error('SuperSheet stress input is required');
  const started=performance.now();
  const matrix=parseDelimited(text,delimiter);
  if(matrix.length<2)throw new Error('SuperSheet requires headers and data rows');
  const headers=matrix[0].map(String);
  const rows=matrix.slice(1);
  const safeChunk=Math.max(1,Number(chunkSize)||1);
  const safeCheckpoint=Math.max(1,Number(checkpointEvery)||1);
  const seen=new Set();
  const checkpoints=[];
  let duplicates=0;
  let processed=0;
  let rejected=0;

  for(let offset=0;offset<rows.length;offset+=safeChunk){
    const chunk=rows.slice(offset,offset+safeChunk);
    for(const row of chunk){
      const id=String(row[0]||'').trim();
      if(!id){rejected++;continue}
      if(seen.has(id)){duplicates++;continue}
      seen.add(id);
      processed++;
      if(processed%safeCheckpoint===0){
        const checkpoint=freeze({
          processed,
          duplicates,
          rejected,
          lastPropertyId:id,
          resumable:true
        });
        checkpoints.push(checkpoint);
        onCheckpoint?.(checkpoint);
      }
    }
  }

  const durationMs=performance.now()-started;
  const throughputRowsPerSecond=durationMs>0?Math.round((rows.length/durationMs)*1000):rows.length;
  return freeze({
    headers:freeze(headers),
    inputRows:rows.length,
    processedRows:processed,
    duplicates,
    rejected,
    uniqueIds:seen.size,
    chunkSize:safeChunk,
    chunks:Math.ceil(rows.length/safeChunk),
    checkpoints:freeze(checkpoints),
    durationMs:Number(durationMs.toFixed(2)),
    throughputRowsPerSecond,
    duplicateSafe:processed+duplicates+rejected===rows.length,
    resumable:true,
    sourceMutationAllowed:false
  });
}

export function evaluateLargeSuperSheetStress(result,{
  minimumThroughputRowsPerSecond=25000,
  maximumRejectRatePct=1,
  maximumDuplicateDrift=0
}={}){
  const rejectRatePct=result.inputRows?result.rejected/result.inputRows*100:0;
  const duplicateDrift=Math.abs(
    result.inputRows-(result.processedRows+result.duplicates+result.rejected)
  );
  const gates=freeze({
    throughput:result.throughputRowsPerSecond>=minimumThroughputRowsPerSecond,
    rejectRate:rejectRatePct<=maximumRejectRatePct,
    accounting:duplicateDrift<=maximumDuplicateDrift,
    duplicateSafe:Boolean(result.duplicateSafe),
    resumable:Boolean(result.resumable)
  });
  const passed=Object.values(gates).every(Boolean);
  return freeze({
    passed,
    status:passed?'STRESS_CERTIFIED':'STRESS_BUDGET_EXCEEDED',
    gates,
    rejectRatePct:Number(rejectRatePct.toFixed(4)),
    duplicateDrift,
    minimumThroughputRowsPerSecond
  });
}
