const fs=require("fs"),path=require("path");
const repo=process.cwd(),dist=path.join(repo,"dist","apps-script");
const fn="sciipTestV8Sprint12EnterpriseSearchKnowledgeDiscoveryUnifiedActivityTimeline";
if(!fs.existsSync(dist)){console.error("Missing compiled Apps Script directory: "+dist);process.exit(1);}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const files=walk(dist).filter(f=>f.endsWith(".gs"));
const found=files.find(f=>fs.readFileSync(f,"utf8").includes("function "+fn));
if(found){console.log("Sprint 12 test already compiled in "+path.relative(repo,found));process.exit(0);}
let target=files.find(f=>path.basename(f)==="11_other_001.gs")||files.find(f=>path.basename(f).startsWith("11_other"))||files[files.length-1];
if(!target){console.error("No compiled .gs target found.");process.exit(1);}
const wrapper=`\n/** SCIIP_OS v8.0 Sprint 12 explicit compiled certification wrapper. */
function ${fn}(){
  if(typeof SCIIP_V8_ENTERPRISE_SEARCH==="undefined"||!SCIIP_V8_ENTERPRISE_SEARCH||typeof SCIIP_V8_ENTERPRISE_SEARCH.certify!=="function"){
    throw new Error("SCIIP V8 Sprint 12 enterprise search application is unavailable.");
  }
  var result=SCIIP_V8_ENTERPRISE_SEARCH.certify();
  if(!result||result.status!=="PASSED"){throw new Error("SCIIP V8 Sprint 12 certification failed: "+JSON.stringify(result));}
  console.log(JSON.stringify(result));return result;
}\n`;
fs.appendFileSync(target,wrapper);
if(!fs.readFileSync(target,"utf8").includes("function "+fn)){console.error("Injection failed.");process.exit(1);}
console.log("Injected "+fn+" into "+path.relative(repo,target));