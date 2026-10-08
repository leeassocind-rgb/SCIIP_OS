#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,walkFiles} from "./M419D4BD12Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bdPath=path.join(ev,"m4-19d4bd-controlled-downstream-materialization-execution.json");
const bbPre=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bd1-production-consumption-path-forensics.json");
const audit=path.join(ev,"m4-19d4bd1-production-consumption-path-audit.json");
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD1_EXACT_PRODUCTION_MATERIALIZER_TARGET_AND_INVOCATION_FORENSICS",
 version:"4.0-m4.19d4bd1",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,downstreamMaterializationPerformed:false,explorerMutationPerformed:false,
 currentStateMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bdPath,bbPre]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BD1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bd=JSON.parse(fs.readFileSync(bdPath,"utf8"));
if(bd.state!=="M419D4BD_EXACT_PRODUCTION_MATERIALIZER_NOT_UNIQUELY_BOUND_EXECUTION_BLOCKED")
 done("BLOCKED","M419D4BD1_BD_MATERIALIZER_NOT_BOUND_STATE_REQUIRED",{observed:bd.state},3);

const pre=JSON.parse(fs.readFileSync(bbPre,"utf8"));
const srcRel="governed-base-inventory.json";
const roots=[path.join(app,"src"),path.join(app,"server"),path.join(app,"public"),app];
const files=walkFiles(fs,path,roots,{maxFiles:6000});
const allowedExt=new Set([".js",".mjs",".cjs",".ts",".tsx",".jsx",".json",".html"]);
const refs=[];

for(let i=0;i<files.length;i++){
 const p=files[i]; if(!allowedExt.has(path.extname(p).toLowerCase()))continue;
 let t="";try{t=fs.readFileSync(p,"utf8")}catch{continue}
 if(!/governed-base-inventory/i.test(t))continue;
 const rel=path.relative(app,p);
 if(rel.startsWith("src/explorer4/")||rel.startsWith("evidence/"))continue;
 const directFetch=/fetch\s*\([^)]*governed-base-inventory/i.test(t);
 const directImport=/import[\s\S]{0,300}governed-base-inventory/i.test(t) || /require\s*\([^)]*governed-base-inventory/i.test(t);
 const fsRead=/readFile(?:Sync)?[\s\S]{0,300}governed-base-inventory/i.test(t);
 const transform=/map\s*\(|reduce\s*\(|materializ|hydrate|normalize|project|adapter|selector|store|load.*inventory|inventory.*load/i.test(t);
 const write=/writeFile|copyFile|renameSync|outputFile|emitFile/i.test(t);
 const ui=/property-explorer|explorer|map|marker|propertycommand|property-command/i.test(rel+" "+t);
 const runtimeConsumer=(directFetch||directImport||fsRead)&&!write;
 const buildProducer=write && /governed-base-inventory/i.test(t);
 refs.push({path:p,relativePath:rel,directFetch,directImport,fsRead,transform,write,ui,runtimeConsumer,buildProducer});
}

const runtime=refs.filter(x=>x.runtimeConsumer);
const build=refs.filter(x=>x.buildProducer);

const packageScripts=[];
for(const pp of [path.join(app,"package.json"),path.join(repo,"package.json")].filter(fs.existsSync)){
 try{
  const pkg=JSON.parse(fs.readFileSync(pp,"utf8"));
  for(const [name,cmd] of Object.entries(pkg.scripts??{})){
   if(/inventory|explorer|materializ|hydrate|build|generate/i.test(name+" "+cmd))
    packageScripts.push({packageJson:pp,name,command:cmd});
  }
 }catch{}
}

let classification="UNRESOLVED";
if(runtime.length>0 && build.length===0) classification="DIRECT_RUNTIME_CONSUMPTION";
else if(build.length>0) classification="BUILD_TIME_OR_GENERATED_MATERIALIZATION";
else if(runtime.length===0&&build.length===0) classification="NO_PRODUCTION_CONSUMER_REFERENCE_RECOVERED";

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD1_PRODUCTION_CONSUMPTION_PATH_AUDIT",
 version:"4.0-m4.19d4bd1",generatedAt:new Date().toISOString(),
 filesScanned:files.length,referenceCount:refs.length,
 runtimeConsumerCount:runtime.length,buildProducerCount:build.length,
 classification,references:refs.slice(0,100),runtimeConsumers:runtime,buildProducers:build,packageScripts
});

const next=classification==="DIRECT_RUNTIME_CONSUMPTION"
 ?"M4.19D4BD2_DIRECT_RUNTIME_CONSUMPTION_PATH_CERTIFICATION"
 :classification==="BUILD_TIME_OR_GENERATED_MATERIALIZATION"
 ?"M4.19D4BD2_BUILD_MATERIALIZATION_PATH_CERTIFICATION"
 :"M4.19D4BD2_UNRESOLVED_CONSUMPTION_PATH_CERTIFICATION";

done("PASSED",
 classification==="DIRECT_RUNTIME_CONSUMPTION"
  ?"M419D4BD1_DIRECT_RUNTIME_GOVERNED_INVENTORY_CONSUMPTION_PROVEN_NO_MATERIALIZER_REQUIRED_BD2_READY"
  :classification==="BUILD_TIME_OR_GENERATED_MATERIALIZATION"
  ?"M419D4BD1_BUILD_TIME_OR_GENERATED_MATERIALIZATION_PATH_PROVEN_BD2_READY"
  :"M419D4BD1_PRODUCTION_CONSUMPTION_PATH_UNRESOLVED_BD2_FORENSIC_CERTIFICATION_READY",
 {forensics:{classification,filesScanned:files.length,referenceCount:refs.length,
 runtimeConsumerCount:runtime.length,buildProducerCount:build.length},
 artifacts:{productionConsumptionPathAudit:audit},
 nextMilestone:next});
