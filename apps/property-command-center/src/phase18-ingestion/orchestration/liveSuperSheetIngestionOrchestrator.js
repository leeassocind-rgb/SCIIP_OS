const freeze=v=>Object.freeze(v);

export function orchestrateLiveSuperSheetIngestion({sheets=[],mode='DRY_RUN'}={}) {
  const jobs=sheets.map((sheet,index)=>freeze({
    jobId:`INGEST-${String(index+1).padStart(3,'0')}`,
    sheetId:sheet.sheetId,
    name:sheet.name,
    rowCount:Number(sheet.rowCount||0),
    mode,
    status:sheet.validationPassed===false?'BLOCKED':'QUEUED',
    idempotencyKey:`${sheet.sheetId}:${sheet.version||'v1'}`,
    destructiveWritesAllowed:false
  }));

  return freeze({
    jobs:freeze(jobs),
    total:jobs.length,
    queued:jobs.filter(j=>j.status==='QUEUED').length,
    blocked:jobs.filter(j=>j.status==='BLOCKED').length,
    totalRows:jobs.reduce((sum,j)=>sum+j.rowCount,0),
    mode,
    idempotent:true,
    duplicateSafe:true,
    autonomousProductionCommitAllowed:false
  });
}
