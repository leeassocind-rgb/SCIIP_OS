const fs=require("fs"),path=require("path");
const repo=process.cwd(),dist=path.join(repo,"dist","apps-script");
const fn="sciipTestV8Sprint14EnterpriseDataGovernanceMasterDataQualityLineageStewardship";
if(!fs.existsSync(dist)){console.error("Missing compiled Apps Script directory: "+dist);process.exit(1);}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const files=walk(dist).filter(f=>f.endsWith(".gs"));
let found=files.find(f=>fs.readFileSync(f,"utf8").includes("function "+fn));
if(found){console.log("Sprint 14 certification already compiled in "+path.relative(repo,found));process.exit(0);}
const source=path.join(repo,"src","applications","enterprise-data-governance","SCIIP_V8_Enterprise_Data_Governance_Master_Data_Quality_Lineage_Stewardship.gs");
if(!fs.existsSync(source)){console.error("Missing Sprint 14 source application.");process.exit(1);}
let target=files.find(f=>path.basename(f)==="11_other_001.gs")||files.find(f=>path.basename(f).startsWith("11_other"))||files[files.length-1];
if(!target){console.error("No compiled .gs target found.");process.exit(1);}
const code=fs.readFileSync(source,"utf8"),start=code.indexOf("var SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE=");
if(start<0){console.error("Sprint 14 namespace not found in source.");process.exit(1);}
fs.appendFileSync(target,"\n\n/** SCIIP_OS v8.0 Sprint 14 explicit compiled application and certification wrapper. */\n"+code.slice(start)+"\n");
found=files.find(f=>fs.readFileSync(f,"utf8").includes("function "+fn));
if(!found){console.error("Injection verification failed.");process.exit(1);}
console.log("Injected and verified "+fn+" in "+path.relative(repo,found));
