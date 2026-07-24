#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto'), cp=require('child_process');
function sha(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}
function j(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function mkdir(p){fs.mkdirSync(p,{recursive:true})}
function dateFromName(n){const m=n.match(/(?:^|[^0-9])(\d{1,2})[-_](\d{1,2})[-_](\d{4})(?:[^0-9]|$)/);return m?`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`:null}
function files(dir,exts){return fs.readdirSync(dir).filter(x=>exts.includes(path.extname(x).toLowerCase())).map(x=>path.join(dir,x))}
function assertFile(p,label){if(!p||!fs.existsSync(p))throw new Error(`${label} not found: ${p||'(missing)'}`)}
function assertDir(p,label){if(!p||!fs.existsSync(p)||!fs.statSync(p).isDirectory())throw new Error(`${label} not found: ${p||'(missing)'}`)}
function run(cfg){
 assertDir(cfg.baselineXlsxDirectory,'baselineXlsxDirectory'); assertDir(cfg.baselineKmzDirectory,'baselineKmzDirectory'); assertDir(cfg.superSheetPdfDirectory,'superSheetPdfDirectory'); assertFile(cfg.currentAirZip,'currentAirZip'); assertFile(cfg.leeProFile,'leeProFile');
 const baselineXlsx=files(cfg.baselineXlsxDirectory,['.xlsx']); const baselineKmz=files(cfg.baselineKmzDirectory,['.kmz','.kml']); const pdfs=files(cfg.superSheetPdfDirectory,['.pdf']).map(p=>({path:p,date:dateFromName(path.basename(p))})).filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date));
 if(baselineXlsx.length!==6)throw new Error(`Expected 6 baseline XLSX files; found ${baselineXlsx.length}`);
 if(baselineKmz.length!==6)throw new Error(`Expected 6 baseline KMZ/KML files; found ${baselineKmz.length}`);
 if(!pdfs.length||pdfs[0].date!=='2026-06-05')throw new Error(`First SuperSheet must be 2026-06-05; found ${pdfs[0]?.date||'none'}`);
 const dates=new Set(); for(const p of pdfs){if(dates.has(p.date))throw new Error(`Duplicate SuperSheet date ${p.date}`);dates.add(p.date)}
 const normalizedDir=cfg.normalizedSnapshotDirectory; const normalized=normalizedDir&&fs.existsSync(normalizedDir)?files(normalizedDir,['.json']).map(p=>({path:p,date:dateFromName(path.basename(p))||j(p).snapshotDate||j(p).observationDate||j(p).date})):[];
 const missingNormalized=pdfs.filter(p=>!normalized.some(n=>n.date===p.date)).map(p=>({date:p.date,file:path.basename(p.path)}));
 const outDir=path.resolve(cfg.outputDirectory||'outputs/sprint27c'); mkdir(outDir);
 const manifest={framework:'SCIIP_V9_SPRINT27C_REAL_PRODUCTION_REPLAY_RUNNER',version:'v9.0-sprint27c.0',status:missingNormalized.length?'NORMALIZATION_REQUIRED':'EXECUTION_READY',generatedAt:new Date().toISOString(),timeline:{baselineDate:'2026-06-04',firstSuperSheetDate:pdfs[0].date,lastSuperSheetDate:pdfs.at(-1).date,superSheets:pdfs.length},sources:{baselineXlsx:baselineXlsx.map(p=>({file:path.basename(p),sha256:sha(p)})),baselineKmz:baselineKmz.map(p=>({file:path.basename(p),sha256:sha(p)})),superSheets:pdfs.map(x=>({date:x.date,file:path.basename(x.path),sha256:sha(x.path)})),currentAir:{file:path.basename(cfg.currentAirZip),sha256:sha(cfg.currentAirZip)},leePro:{file:path.basename(cfg.leeProFile),sha256:sha(cfg.leeProFile)}},normalization:{normalizedSnapshots:normalized.length,missingSnapshots:missingNormalized},governance:{readOnly:true,canonicalWrites:0,commitEnabled:false,humanApprovalRequired:true,sourceFilesImmutable:true}};
 fs.writeFileSync(path.join(outDir,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 if(missingNormalized.length){fs.writeFileSync(path.join(outDir,'normalization-queue.json'),JSON.stringify({status:'REVIEW_REQUIRED',items:missingNormalized},null,2)+'\n');return manifest}
 assertFile(cfg.baselineObservationFile,'baselineObservationFile'); assertFile(cfg.currentAirObservationFile,'currentAirObservationFile');
 const replayConfig={baselineFile:path.resolve(cfg.baselineObservationFile),snapshotsDirectory:path.resolve(normalizedDir),currentAirFile:path.resolve(cfg.currentAirObservationFile),leeProFile:path.resolve(cfg.leeProFile),absenceConfirmationDays:Number(cfg.absenceConfirmationDays||2)};
 const replayConfigPath=path.join(outDir,'replay-config.json');fs.writeFileSync(replayConfigPath,JSON.stringify(replayConfig,null,2)+'\n');
 const runner=path.join(__dirname,'sciip-v9-sprint27b-real-data-replay-reconciliation.js');assertFile(runner,'Sprint 27B runner');
 const review=path.join(outDir,'real-production-review-package.json');const r=cp.spawnSync(process.execPath,[runner,'--config',replayConfigPath,'--output',review],{encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout||'Sprint 27B replay failed');
 manifest.status='REVIEW_READY';manifest.outputs={reviewPackage:review,replayConfig:replayConfigPath};manifest.governance.canonicalWrites=0;fs.writeFileSync(path.join(outDir,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
function args(){const o={};for(let i=2;i<process.argv.length;i++)if(process.argv[i].startsWith('--')){const k=process.argv[i].slice(2);o[k]=process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[++i]:true}return o}
if(require.main===module){try{const a=args();if(!a.config)throw new Error('Usage: --config <sprint27c-config.json>');const cfg=j(path.resolve(a.config));for(const k of ['baselineXlsxDirectory','baselineKmzDirectory','superSheetPdfDirectory','currentAirZip','leeProFile','normalizedSnapshotDirectory','baselineObservationFile','currentAirObservationFile','outputDirectory'])if(cfg[k])cfg[k]=path.resolve(path.dirname(path.resolve(a.config)),cfg[k]);const r=run(cfg);console.log(JSON.stringify({framework:r.framework,status:r.status,timeline:r.timeline,normalization:r.normalization,canonicalWrites:0,commitEnabled:false}))}catch(e){console.error(e.stack||e);process.exit(1)}}
module.exports={run,dateFromName};
