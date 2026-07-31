import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [repoArg,fileArg]=process.argv.slice(2);
if(!repoArg||!fileArg){console.error('Usage: node run-real-supersheet-pilot.mjs <repo> <xlsx-file>');process.exit(2)}
const repo=path.resolve(repoArg);const filePath=path.resolve(fileArg);
const modulePath=path.join(repo,'apps/property-command-center/src/production-activation/pilot/index.js');
const {runRealSuperSheetPilot}=await import(pathToFileURL(modulePath).href);
const result=runRealSuperSheetPilot({filePath});
const outputDir=path.join(repo,'reports/production-activation');fs.mkdirSync(outputDir,{recursive:true});
const outputFile=path.join(outputDir,'phase5-sprint49-real-supersheet-pilot.json');
fs.writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');
const summary={...result,outputFile};delete summary.actionable;delete summary.rejected;delete summary.filtered;delete summary.duplicates;
console.log(JSON.stringify(summary,null,2));
if(result.status!=='PASSED')process.exit(1);
