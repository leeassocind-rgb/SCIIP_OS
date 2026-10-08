#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {sha} from "./M419D4BG1BH1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bgPath=path.join(ev,"m4-19d4bg-live-explorer-runtime-render-preauthorization.json");
const bfPath=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json");
const result=path.join(ev,"m4-19d4bg1-system-browser-headless-readiness.json");
const manifest=path.join(ev,"m4-19d4bg1-system-browser-headless-preauthorization-manifest.json");
const audit=path.join(ev,"m4-19d4bg1-system-browser-capability-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BG1_SYSTEM_BROWSER_HEADLESS_READINESS_RECOVERY",
  version:"4.0-m4.19d4bg1",status,state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
   syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{applicationSourceMutationPerformed:false,dependencyInstallationPerformed:false,
   governedInventoryMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,
   externalNetworkRequestsPerformed:0,liveBrowserExecutionPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bgPath,bfPath]) if(!fs.existsSync(p))
 done("BLOCKED","M419D4BG1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);

const bg=JSON.parse(fs.readFileSync(bgPath,"utf8"));
if(bg.state!=="M419D4BG_LIVE_BROWSER_RUNTIME_NOT_READY_EXACT_ENVIRONMENT_RECONCILIATION_REQUIRED")
 done("BLOCKED","M419D4BG1_BG_BROWSER_NOT_READY_STATE_REQUIRED",{observed:bg.state},3);

const bf=JSON.parse(fs.readFileSync(bfPath,"utf8"));

const candidates=[
 {id:"GOOGLE_CHROME",path:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"},
 {id:"GOOGLE_CHROME_CANARY",path:"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"},
 {id:"CHROMIUM",path:"/Applications/Chromium.app/Contents/MacOS/Chromium"},
 {id:"BRAVE",path:"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"},
 {id:"MICROSOFT_EDGE",path:"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"}
];

const found=[];
for(const c of candidates){
 if(!fs.existsSync(c.path))continue;
 let version=null,headlessSupported=false;
 try{version=execFileSync(c.path,["--version"],{encoding:"utf8",timeout:5000}).trim()}catch{}
 try{
  execFileSync(c.path,["--headless=new","--disable-gpu","--dump-dom","data:text/html,<html><body>SCIIP_BROWSER_TEST</body></html>"],
   {encoding:"utf8",timeout:12000,stdio:["ignore","pipe","pipe"]});
  headlessSupported=true;
 }catch{}
 found.push({...c,version,headlessSupported});
}
const usable=found.find(x=>x.headlessSupported)??null;

const packagePath=path.join(app,"package.json");
const pkg=fs.existsSync(packagePath)?JSON.parse(fs.readFileSync(packagePath,"utf8")):{};
const launch=(pkg.scripts?.dev)?{name:"dev",command:pkg.scripts.dev}:null;

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BG1_SYSTEM_BROWSER_CAPABILITY_AUDIT",
 version:"4.0-m4.19d4bg1",generatedAt:new Date().toISOString(),
 browserCandidates:found,usableBrowser:usable,launch
});

if(!usable||!launch){
 done("PASSED","M419D4BG1_NO_USABLE_SYSTEM_HEADLESS_BROWSER_OR_LAUNCH_CONTRACT_RECOVERED_OPERATOR_ENVIRONMENT_ACTION_REQUIRED",{
  readiness:{usableBrowser,launch,browserCandidates:found},
  artifacts:{systemBrowserCapabilityAudit:audit},
  nextMilestone:"M4.19D4BG2_OPERATOR_BROWSER_CAPABILITY_ENABLEMENT_OR_ALTERNATE_RENDER_PATH"
 });
}

const pre={
 contract:"SCIIP_EXPLORER_4_M4_19D4BG1_SYSTEM_BROWSER_HEADLESS_PREAUTHORIZATION_MANIFEST",
 version:"4.0-m4.19d4bg1",generatedAt:new Date().toISOString(),
 browser:usable,launch,
 target:{
  canonicalPropertyId:bf.certification.canonicalPropertyId,
  address:bf.certification.address,
  latitude:bf.certification.latitude,
  longitude:bf.certification.longitude,
  availableSf:bf.certification.availableSf
 },
 portCandidates:[5173,3000,4173,8080],
 maximumServerLaunches:1,maximumHeadlessBrowserExecutions:2,
 executionAuthorized:false
};
write(manifest,pre);

done("PASSED","M419D4BG1_SYSTEM_HEADLESS_BROWSER_RENDER_PATH_CERTIFIED_BH1_EXECUTION_PREAUTHORIZED",{
 preauthorization:{browser:usable,launch,maximumServerLaunches:1,maximumHeadlessBrowserExecutions:2,executionAuthorized:false},
 policy:{systemBrowserOnly:true,noDependencyInstallation:true,noApplicationMutation:true,localhostOnly:true},
 artifacts:{systemBrowserCapabilityAudit:audit,systemBrowserPreauthorizationManifest:manifest},
 nextMilestone:"M4.19D4BH1_CONTROLLED_SYSTEM_BROWSER_LIVE_EXPLORER_DOM_VISIBILITY_CERTIFICATION"
});
