const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),target=path.join(root,'dist/apps-script/11_other_001.gs');
const marker='function sciipTestV8ProductionReadinessSprint2RealSuperSheetProfiling';
if(!fs.existsSync(target)){console.error('Missing compiled target: '+target);process.exit(1);}
let text=fs.readFileSync(target,'utf8');
if(text.includes(marker)){console.log('Production Readiness Sprint 2 certification already compiled in dist/apps-script/11_other_001.gs');process.exit(0);}
const wrapper='\nfunction sciipTestV8ProductionReadinessSprint2RealSuperSheetProfiling(){var result=SCIIP_V8_PRODUCTION_READINESS_REAL_SUPERSHEET_PROFILING.certify();console.log(JSON.stringify(result));return result;}\n';
fs.appendFileSync(target,wrapper);
console.log('Injected Production Readiness Sprint 2 certification into dist/apps-script/11_other_001.gs');
