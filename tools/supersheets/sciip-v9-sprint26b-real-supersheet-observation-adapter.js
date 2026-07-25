#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');
const { compareSnapshots } = require('./sciip-v9-sprint26-market-observation-delta-engine.js');

function text(v) { return String(v ?? '').trim(); }
function checksum(filePath) { return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex'); }
function normalize(v) { return text(v).toUpperCase().replace(/\bSTREET\b/g,'ST').replace(/\bAVENUE\b/g,'AVE').replace(/\bBOULEVARD\b/g,'BLVD').replace(/\bROAD\b/g,'RD').replace(/\bDRIVE\b/g,'DR').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }
function normalizeApn(v) { return text(v).toUpperCase().replace(/[^A-Z0-9]/g,''); }
function numeric(v) {
  if (v === null || v === undefined || text(v) === '') return null;
  const match = text(v).replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}
function parseRate(v) {
  const raw = text(v);
  return { askingRate: numeric(raw), askingRateType: (raw.match(/\b(NNN|NET|GROSS|G|IG|MG|FS|MODIFIED GROSS)\b/i)||[])[1]?.toUpperCase() || null };
}
function splitAddressCity(value) {
  const raw = text(value).replace(/\s+/g,' ');
  const m = raw.match(/^(.*?),?\s+([A-Za-z .'-]+),?\s+CA\s+(\d{5})(?:-\d{4})?$/i);
  return m ? { address:m[1].trim(), city:m[2].trim(), postalCode:m[3] } : { address:raw, city:'', postalCode:'' };
}
function findValue(row, names) {
  const entries = Object.entries(row || {});
  for (const name of names) {
    const wanted = normalize(name);
    const found = entries.find(([k]) => normalize(k) === wanted);
    if (found) return found[1];
  }
  return null;
}
function parseCsv(content) {
  const rows=[]; let row=[]; let cell=''; let quoted=false;
  for (let i=0;i<content.length;i++) {
    const c=content[i];
    if (c==='"') { if (quoted && content[i+1]==='"') { cell+='"'; i++; } else quoted=!quoted; }
    else if (c===',' && !quoted) { row.push(cell); cell=''; }
    else if ((c==='\n' || c==='\r') && !quoted) { if (c==='\r' && content[i+1]==='\n') i++; row.push(cell); if (row.some(x=>text(x))) rows.push(row); row=[]; cell=''; }
    else cell+=c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const headers=rows.shift().map(text);
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
function readStructuredRows(filePath) {
  const ext=path.extname(filePath).toLowerCase();
  if (ext==='.json') {
    const value=JSON.parse(fs.readFileSync(filePath,'utf8'));
    return Array.isArray(value) ? value : value.rows || value.records || [];
  }
  if (ext==='.csv') return parseCsv(fs.readFileSync(filePath,'utf8'));
  if (ext==='.xls' || ext==='.xlsx') {
    let XLSX;
    try { XLSX=require('xlsx'); }
    catch (_) {
      const e=new Error('Excel input requires the optional "xlsx" package. Run: npm install xlsx@0.18.5 --save-exact, or export the AIR report as CSV. No canonical writes were attempted.');
      e.code='SCIIP_XLSX_DEPENDENCY_REQUIRED'; throw e;
    }
    const workbook=XLSX.readFile(filePath,{cellDates:false,raw:false});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});
  }
  throw new Error(`Unsupported structured format: ${ext}`);
}
function parseKml(kml) {
  const folders=[];
  const folderRe=/<(?:kml:)?Folder>([\s\S]*?)<\/(?:kml:)?Folder>/gi;
  let fm;
  while ((fm=folderRe.exec(kml))) {
    const block=fm[1];
    const name=(block.match(/<(?:kml:)?name>([\s\S]*?)<\/(?:kml:)?name>/i)||[])[1] || '';
    const points=[...block.matchAll(/<(?:kml:)?coordinates>\s*([-\d.]+),([-\d.]+)/gi)];
    if (!points.length) continue;
    const apns=[...block.matchAll(/<(?:kml:)?Placemark>[\s\S]*?<(?:kml:)?name>([\d-]{8,})<\/(?:kml:)?name>[\s\S]*?<\/(?:kml:)?Placemark>/gi)].map(x=>x[1]);
    folders.push({ address:text(name), normalizedAddress:normalize(name), latitude:Number(points[0][2]), longitude:Number(points[0][1]), apns });
  }
  return folders;
}
function readKmz(filePath) {
  const ext=path.extname(filePath).toLowerCase();
  let kml;
  if (ext==='.kml') kml=fs.readFileSync(filePath,'utf8');
  else if (ext==='.kmz') {
    const run=childProcess.spawnSync('unzip',['-p',filePath],{encoding:'utf8',maxBuffer:32*1024*1024});
    if (run.status!==0) throw new Error(`Unable to read KMZ: ${run.stderr}`);
    kml=run.stdout;
  } else throw new Error('Geographic evidence must be .kmz or .kml');
  return parseKml(kml);
}
function mapAirRow(row, index, options={}) {
  const addressRaw=findValue(row,['Property Location','Address','Property','Location']);
  const parsed=splitAddressCity(addressRaw);
  const city=findValue(row,['City']) || parsed.city;
  const postalCode=findValue(row,['Zip','ZIP Code','Postal Code']) || parsed.postalCode;
  const listingStatus=findValue(row,['Listing Status','Status','Change Type','Activity']);
  const transactionType=findValue(row,['Transaction Type','For Lease/Sale','Type','Offering']);
  const rate=parseRate(findValue(row,['Rate/SF','Asking Rate','Lease Rate','Rate']));
  const notes=[findValue(row,['Listing Notes','Notes','Comments']),findValue(row,['Property Name'])].map(text).filter(Boolean).join(' | ');
  return {
    listingNumber:text(findValue(row,['Listing #','Listing Number','Listing ID','AIR Listing #'])),
    apn:text(findValue(row,['APN','APNs','Parcel Number'])),
    address:text(findValue(row,['Address'])) || parsed.address,
    city:text(city), postalCode:text(postalCode),
    region:text(findValue(row,['Region','Market'])) || options.region || 'South Bay',
    submarket:text(findValue(row,['Submarket','AIR Area','Area'])),
    unit:text(findValue(row,['Unit','Suite','Bldg/Unit'])),
    transactionType:text(transactionType), listingStatus:text(listingStatus),
    askingRate:rate.askingRate, askingRateType:rate.askingRateType,
    askingPrice:numeric(findValue(row,['Price/SF','Asking Price/SF','Sale Price/SF'])),
    availableSf:numeric(findValue(row,['Available SF','Avail SF','Space Available'])),
    buildingSf:numeric(findValue(row,['Bldg SF','Building SF','Building Size'])),
    officeSf:numeric(findValue(row,['Office SF','Office Size'])),
    clearHeightFt:numeric(findValue(row,['Clear Height','Clear Ht'])),
    powerAmps:numeric(findValue(row,['Amps','Power Amps','Power'])),
    dockHighDoors:numeric(findValue(row,['DH','Dock High','DH Doors'])),
    gradeLevelDoors:numeric(findValue(row,['GL','Grade Level','GL Doors'])),
    availabilityDate:text(findValue(row,['Possession','Availability Date','Available Date'])),
    brokerage:text(findValue(row,['Brokerage','Listing Broker','Broker'])), notes,
    rowNumber:index+2, sourceRow:row
  };
}
function joinGeography(records, geographies) {
  return records.map(record=>{
    const apns=text(record.apn).split(/[|,;]/).map(normalizeApn).filter(Boolean);
    const address=normalize(record.address);
    const match=geographies.find(g=>g.apns.some(a=>apns.includes(normalizeApn(a)))) || geographies.find(g=>g.normalizedAddress===address || g.normalizedAddress.includes(address) || address.includes(g.normalizedAddress));
    return match ? {...record,latitude:match.latitude,longitude:match.longitude,geographicMatch:{method:apns.length&&match.apns.length?'APN':'ADDRESS',sourceAddress:match.address}} : record;
  });
}
function buildObservationPackage(input) {
  const snapshotDate=text(input.snapshotDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) throw new Error('snapshotDate must be YYYY-MM-DD');
  const rows=readStructuredRows(input.structuredFile);
  const mapped=rows.map((r,i)=>mapAirRow(r,i,{region:input.region})).filter(r=>r.address && (r.availableSf!==null || r.listingNumber || r.apn));
  const geographies=input.kmzFile ? readKmz(input.kmzFile) : [];
  const records=joinGeography(mapped,geographies);
  const evidence={
    structured:{fileName:path.basename(input.structuredFile),format:path.extname(input.structuredFile).slice(1).toUpperCase(),checksum:checksum(input.structuredFile)},
    pdf:input.pdfFile ? {fileName:path.basename(input.pdfFile),format:'PDF',checksum:checksum(input.pdfFile)} : null,
    geography:input.kmzFile ? {fileName:path.basename(input.kmzFile),format:path.extname(input.kmzFile).slice(1).toUpperCase(),checksum:checksum(input.kmzFile),features:geographies.length} : null
  };
  const observations=records.map(r=>({...r,sourceFile:evidence.structured.fileName,sourceFormat:evidence.structured.format,sourceChecksum:evidence.structured.checksum,evidence}));
  return {framework:'SCIIP_V9_SPRINT26B_REAL_SUPERSHEET_OBSERVATION_ADAPTER',version:'v9.0-sprint26b.0',status:'PASSED',snapshotDate,region:input.region||'South Bay',summary:{sourceRows:rows.length,acceptedObservations:observations.length,rejectedRows:rows.length-observations.length,geographicMatches:observations.filter(x=>Number.isFinite(x.latitude)).length,pdfEvidenceAttached:Boolean(evidence.pdf)},evidence,observations,governance:{structuredSourceAuthoritative:true,pdfIsVisualNarrativeEvidence:true,kmzIsGeographicEvidence:true,snapshotIsStatusObservation:true,canonicalWrites:0,commitEnabled:false,approvalRequired:true}};
}
function buildComparisonPackage(input) {
  const previous=buildObservationPackage(input.previous);
  const current=buildObservationPackage(input.current);
  const delta=compareSnapshots({previousSnapshot:{date:previous.snapshotDate,records:previous.observations,source:previous.evidence.structured},currentSnapshot:{date:current.snapshotDate,records:current.observations,source:current.evidence.structured},priorAbsenceStreaks:input.priorAbsenceStreaks||{},policy:{absenceConfirmationDays:input.absenceConfirmationDays||2}});
  return {framework:'SCIIP_V9_SPRINT26B_REAL_SUPERSHEET_COMPARISON_PACKAGE',version:'v9.0-sprint26b.0',status:'PASSED',previous,current,delta,review:{required:true,canonicalWrites:0,commitEnabled:false}};
}
function parseArgs(argv) { const o={}; for(let i=2;i<argv.length;i++){if(!argv[i].startsWith('--'))continue; const k=argv[i].slice(2); o[k]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;} return o; }
function cli() {
  const args=parseArgs(process.argv);
  if (!args.config || !args.output) throw new Error('Usage: --config <comparison-config.json> --output <review-package.json>');
  const input=JSON.parse(fs.readFileSync(args.config,'utf8'));
  const result=input.previous&&input.current ? buildComparisonPackage(input) : buildObservationPackage(input);
  fs.mkdirSync(path.dirname(args.output),{recursive:true}); fs.writeFileSync(args.output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({framework:result.framework,status:result.status,summary:result.delta?.summary||result.summary,canonicalWrites:0,commitEnabled:false}));
}
module.exports={buildObservationPackage,buildComparisonPackage,readKmz,parseKml,mapAirRow,joinGeography,parseCsv};
if(require.main===module){try{cli();}catch(e){console.error(e.stack||e);process.exit(1);}}
