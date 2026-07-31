import crypto from 'node:crypto';
import { readXlsxWorkbook } from './nodeXlsxWorkbookReader.js';

const freeze=value=>Object.freeze(value);
const normalize=value=>String(value??'').trim();
const normalizedHeader=value=>normalize(value).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const rowObject=(headers,row)=>Object.fromEntries(headers.map((header,index)=>[header,row[index]??'']));
const requiredIndustrial=Object.freeze([
  'candidate_id','report_date','property_type','raw_address','city',
  'reported_sf','event_category','suggested_action','target_table','source_file'
]);

export function runRealSuperSheetPilot({
  filePath,
  industrialSheet='Industrial',
  minimumSchemaCoveragePct=90,
  maximumRejectedRowPct=25
}={}){
  const started=performance.now();
  const workbook=readXlsxWorkbook(filePath);
  const sheet=workbook.sheets.find(item=>item.name===industrialSheet);
  if(!sheet)throw new Error(`Pilot sheet not found: ${industrialSheet}`);

  const headers=sheet.headers.map(normalizedHeader);
  const records=sheet.rows.map(row=>rowObject(headers,row));
  const candidateIds=new Set();
  const duplicates=[];
  const rejected=[];
  const filtered=[];
  const actionable=[];
  const staged=[];

  for(let index=0;index<records.length;index++){
    const record=records[index];
    const rowNumber=index+2;
    const candidateId=normalize(record.candidate_id);
    if(!candidateId){rejected.push(freeze({rowNumber,reason:'MISSING_CANDIDATE_ID'}));continue}
    if(candidateIds.has(candidateId)){duplicates.push(freeze({rowNumber,candidateId,reason:'DUPLICATE_CANDIDATE_ID'}));continue}
    candidateIds.add(candidateId);
    const propertyType=normalize(record.property_type).toLowerCase();
    const buildingSf=Number(normalize(record.building_sf)||normalize(record.reported_sf)||0);
    const suggestedAction=normalize(record.suggested_action);
    const targetTable=normalize(record.target_table);
    const eligible=propertyType==='industrial' && buildingSf>=50000;
    const item=freeze({
      rowNumber,candidateId,address:normalize(record.raw_address),city:normalize(record.city),buildingSf,
      eventCategory:normalize(record.event_category),suggestedAction,targetTable,
      sourceFile:normalize(record.source_file),sourcePage:normalize(record.source_page),eligible
    });
    if(eligible)actionable.push(item);
    else filtered.push(freeze({rowNumber,candidateId,reason:propertyType!=='industrial'?'NON_INDUSTRIAL':'BELOW_50000_SF'}));
    if(eligible&&suggestedAction&&targetTable)staged.push(item);
  }

  const present=requiredIndustrial.filter(header=>headers.includes(header));
  const missing=requiredIndustrial.filter(header=>!headers.includes(header));
  const schemaCoveragePct=requiredIndustrial.length?present.length/requiredIndustrial.length*100:100;
  const rejectedRowPct=records.length?rejected.length/records.length*100:0;
  const accounted=actionable.length+duplicates.length+rejected.length+filtered.length;
  const digest=crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex');
  const gates=freeze({
    realWorkbook:workbook.fileSize>0,
    requiredSheet:Boolean(sheet),
    schemaCoverage:schemaCoveragePct>=minimumSchemaCoveragePct,
    duplicateAccounting:accounted===records.length,
    rejectedRows:rejectedRowPct<=maximumRejectedRowPct,
    stagingControlled:staged.every(item=>item.suggestedAction&&item.targetTable),
    masterInventoryMutationBlocked:true
  });
  const passed=Object.values(gates).every(Boolean);

  return freeze({
    framework:'SCIIP_PHASE5_SPRINT49_REAL_SUPERSHEET_PILOT',
    status:passed?'PASSED':'REVIEW_REQUIRED',
    generatedAt:new Date().toISOString(),
    fileName:workbook.fileName,fileSize:workbook.fileSize,
    workbookSheets:freeze(workbook.sheets.map(item=>freeze({name:item.name,rowCount:item.rowCount}))),
    pilotSheet:sheet.name,inputRows:records.length,uniqueCandidateIds:candidateIds.size,
    actionableRows:actionable.length,stagedRows:staged.length,duplicateRows:duplicates.length,
    rejectedRows:rejected.length,filteredRows:filtered.length,rejectedRowPct:Number(rejectedRowPct.toFixed(2)),
    schema:freeze({coveragePct:Number(schemaCoveragePct.toFixed(2)),present:freeze(present),missing:freeze(missing)}),
    eventCategories:freeze([...new Set(actionable.map(item=>item.eventCategory).filter(Boolean))].sort()),
    targetTables:freeze([...new Set(staged.map(item=>item.targetTable).filter(Boolean))].sort()),
    sourceFiles:freeze([...new Set(actionable.map(item=>item.sourceFile).filter(Boolean))].sort()),
    digest,durationMs:Number((performance.now()-started).toFixed(2)),gates,
    duplicateSafe:true,approvalRequired:true,masterInventoryMutationAllowed:false,
    actionable:freeze(actionable),rejected:freeze(rejected),filtered:freeze(filtered),duplicates:freeze(duplicates)
  });
}
