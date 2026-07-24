const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),target=path.join(root,'dist/apps-script/11_other_001.gs');
const wrapper='function sciipTestV8ProductionReadinessSprint3CommandCenter(){var result=SCIIP_V8_PRODUCTION_READINESS_COMMAND_CENTER.certify();console.log(JSON.stringify(result));return result;}';
if(!fs.existsSync(target))throw new Error('Missing compiled target: '+target);
let text=fs.readFileSync(target,'utf8');
if(text.includes('function sciipTestV8ProductionReadinessSprint3CommandCenter')){console.log('Production Readiness Sprint 3 certification already compiled in dist/apps-script/11_other_001.gs');process.exit(0);}
fs.appendFileSync(target,'\n'+wrapper+'\n');console.log('Injected Production Readiness Sprint 3 certification wrapper into dist/apps-script/11_other_001.gs');
