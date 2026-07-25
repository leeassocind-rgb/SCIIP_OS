const fs=require("fs"),path=require("path");
const repo=process.cwd(),dist=path.join(repo,"dist","apps-script"),fn="sciipTestV8ProductionReadinessSprint1SuperSheetValidation";
if(!fs.existsSync(dist)){console.error("Missing compiled Apps Script directory: "+dist);process.exit(1);}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const files=walk(dist).filter(f=>f.endsWith(".gs"));let found=files.find(f=>fs.readFileSync(f,"utf8").includes("function "+fn));
if(found){console.log("Production Readiness Sprint 1 certification already compiled in "+path.relative(repo,found));process.exit(0);}
const source=path.join(repo,"src/applications/production-readiness/SCIIP_V8_Production_Readiness_SuperSheet_Validation.gs");
if(!fs.existsSync(source)){console.error("Missing Production Readiness Sprint 1 source application.");process.exit(1);}
const target=files.find(f=>path.basename(f)==="11_other_001.gs")||files.find(f=>path.basename(f).startsWith("11_other"))||files[files.length-1];
if(!target){console.error("No compiled .gs target found.");process.exit(1);}
const code=fs.readFileSync(source,"utf8"),start=code.indexOf("var SCIIP_V8_PRODUCTION_READINESS_SUPERSHEET_VALIDATION=");
if(start<0){console.error("Production readiness namespace not found.");process.exit(1);}
fs.appendFileSync(target,"\n\n/** SCIIP_OS v8.0 Production Readiness Sprint 1 explicit compiled application and certification wrapper. */\n"+code.slice(start)+"\n");
if(!fs.readFileSync(target,"utf8").includes("function "+fn)){console.error("Injection verification failed.");process.exit(1);}
console.log("Injected and verified "+fn+" in "+path.relative(repo,target));
