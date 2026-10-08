#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {sha} from "./M419D4BGBHRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bfPath=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json");
const bfManifest=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-certification-manifest.json");
const result=path.join(ev,"m4-19d4bg-live-explorer-runtime-render-preauthorization.json");
const manifest=path.join(ev,"m4-19d4bg-live-runtime-render-preauthorization-manifest.json");
const audit=path.join(ev,"m4-19d4bg-local-runtime-and-browser-capability-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BG_LIVE_EXPLORER_RUNTIME_RENDER_PREAUTHORIZATION_AND_READINESS",
  version:"4.0-m4.19d4bg",status,state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
   syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{applicationSourceMutationPerformed:false,governedInventoryMutationPerformed:false,
   canonicalMutationPerformed:false,identityMutationPerformed:false,externalNetworkRequestsPerformed:0,
   liveBrowserExecutionPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bfPath,bfManifest]) if(!fs.existsSync(p))
 done("BLOCKED","M419D4BG_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bf=JSON.parse(fs.readFileSync(bfPath,"utf8"));
if(bf.state!=="M419D4BF_RUNTIME_EXPLORER_DATA_VISIBILITY_AND_UI_BINDING_CERTIFIED_LIVE_BROWSER_RENDER_NOT_YET_CERTIFIED")
 done("BLOCKED","M419D4BG_BF_RUNTIME_UI_BINDING_STATE_REQUIRED",{observed:bf.state},3);

const pkgPath=path.join(app,"package.json");
if(!fs.existsSync(pkgPath)) done("BLOCKED","M419D4BG_PROPERTY_COMMAND_CENTER_PACKAGE_JSON_MISSING",{pkgPath},3);
const pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8"));
const scripts=pkg.scripts??{};
const launchCandidates=[];
for(const [name,cmd] of Object.entries(scripts)){
 const score=(/^dev$|^start$|serve|preview/i.test(name)?5:0)+
  (/vite|next dev|react-scripts start|webpack.*serve|node .*server|npm-run-all|concurrently/i.test(cmd)?3:0);
 if(score>=5) launchCandidates.push({name,command:cmd,score});
}
launchCandidates.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));

const deps={...(pkg.dependencies??{}),...(pkg.devDependencies??{})};
const browserCapabilities=[];
for(const [id,mods] of [
 ["PLAYWRIGHT",["playwright","@playwright/test"]],
 ["PUPPETEER",["puppeteer","puppeteer-core"]]
]){
 const found=mods.filter(m=>deps[m]!==undefined);
 if(found.length) browserCapabilities.push({id,modules:found,declared:true});
}
const nodeModulesBrowser=[];
for(const m of ["playwright","@playwright/test","puppeteer","puppeteer-core"]){
 if(fs.existsSync(path.join(app,"node_modules",m)))nodeModulesBrowser.push(m);
}
for(const b of browserCapabilities)b.installed=b.modules.some(m=>nodeModulesBrowser.includes(m));

/* Recover likely local port from Vite/Next config, package script, env files. */
const evidenceTexts=[];
for(const p of [
 pkgPath,path.join(app,"vite.config.js"),path.join(app,"vite.config.mjs"),path.join(app,"vite.config.ts"),
 path.join(app,".env.local"),path.join(app,".env"),path.join(app,"server","index.mjs"),
 path.join(app,"server","proxy-server.mjs")
].filter(fs.existsSync)){
 try{evidenceTexts.push({path:p,text:fs.readFileSync(p,"utf8")})}catch{}
}
const ports=[];
for(const e of evidenceTexts){
 for(const m of e.text.matchAll(/(?:PORT\s*=\s*|port\s*:\s*|--port(?:=|\s+))["']?(\d{4,5})/gi))
  ports.push({port:Number(m[1]),path:e.path,match:m[0]});
}
for(const p of [5173,3000,4173,8080]) if(!ports.some(x=>x.port===p))ports.push({port:p,path:"DEFAULT_CANDIDATE",match:null});
const uniquePorts=[...new Map(ports.map(x=>[x.port,x])).values()];

const preferredLaunch=launchCandidates.length===1?launchCandidates[0]:
 launchCandidates.find(x=>x.name==="dev")??null;
const installedBrowser=browserCapabilities.find(x=>x.installed)??null;

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BG_LOCAL_RUNTIME_AND_BROWSER_CAPABILITY_AUDIT",
 version:"4.0-m4.19d4bg",generatedAt:new Date().toISOString(),
 packageJson:pkgPath,packageSha256:sha(JSON.stringify(pkg)),
 launchCandidates,preferredLaunch,browserCapabilities,nodeModulesBrowser,
 portCandidates:uniquePorts
});

const ready=!!preferredLaunch && !!installedBrowser;
const pre={
 contract:"SCIIP_EXPLORER_4_M4_19D4BG_LIVE_RUNTIME_RENDER_PREAUTHORIZATION_MANIFEST",
 version:"4.0-m4.19d4bg",generatedAt:new Date().toISOString(),
 canonicalPropertyId:bf.certification.canonicalPropertyId,address:bf.certification.address,
 latitude:bf.certification.latitude,longitude:bf.certification.longitude,availableSf:bf.certification.availableSf,
 launch:preferredLaunch,browser:installedBrowser,portCandidates:uniquePorts,
 maximumServerLaunches:1,maximumBrowserSessions:1,executionAuthorized:false,
 liveBrowserReadiness:ready
};
write(manifest,pre);

if(!ready){
 done("PASSED","M419D4BG_LIVE_BROWSER_RUNTIME_NOT_READY_EXACT_ENVIRONMENT_RECONCILIATION_REQUIRED",{
  readiness:{launchReady:!!preferredLaunch,browserAutomationReady:!!installedBrowser,
   preferredLaunch,browserCapabilities,portCandidates:uniquePorts},
  artifacts:{runtimeBrowserCapabilityAudit:audit,liveRuntimePreauthorizationManifest:manifest},
  nextMilestone:"M4.19D4BG1_LOCAL_BROWSER_AUTOMATION_OR_RUNTIME_LAUNCH_READINESS_RECOVERY"
 });
}

done("PASSED","M419D4BG_LIVE_EXPLORER_RUNTIME_RENDER_PREAUTHORIZED_BROWSER_EXECUTION_NOT_AUTHORIZED",{
 preauthorization:{launch:preferredLaunch,browser:installedBrowser,portCandidates:uniquePorts,
  maximumServerLaunches:1,maximumBrowserSessions:1,executionAuthorized:false},
 policy:{existingAppLaunchOnly:true,existingBrowserAutomationOnly:true,noDependencyInstall:true,
  noApplicationMutation:true,liveRenderEvidenceRequired:true},
 artifacts:{runtimeBrowserCapabilityAudit:audit,liveRuntimePreauthorizationManifest:manifest},
 nextMilestone:"M4.19D4BH_CONTROLLED_LIVE_EXPLORER_BROWSER_VISIBILITY_CERTIFICATION"
});
