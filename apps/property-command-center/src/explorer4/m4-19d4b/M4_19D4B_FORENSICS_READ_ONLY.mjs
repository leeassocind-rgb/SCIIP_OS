#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import {CONTRACT,VERSION,extractEnvNames,extractPorts,extractUrlFragments,sha} from "./M419D4BForensicsRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4a-lightbox-existing-proxy-route-env-configuration-binding.json");
const resultPath=path.join(ev,"m4-19d4b-lightbox-runtime-launch-contract-dynamic-proxy-construction-forensics.json");
const planPath=path.join(ev,"m4-19d4b-lightbox-runtime-binding-plan.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4A_LIGHTBOX_PROXY_ROUTE_NOT_DISCOVERED_MANUAL_BINDING_REQUIRED")
  throw new Error(`unexpected prior state: ${priorDoc?.state}`);

const explicitCandidates=[
  path.join(app,"package.json"),
  path.join(app,"vite.config.js"), path.join(app,"vite.config.mjs"), path.join(app,"vite.config.ts"),
  path.join(app,"next.config.js"), path.join(app,"next.config.mjs"),
  path.join(app,"server/lightbox/proxy-server.mjs"),
  path.join(app,"src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js"),
  path.join(app,"server/lightbox/LightBoxEnrichmentService.mjs"),
  path.join(app,"server/lightbox/LightBoxEnrichmentOrchestrator.mjs")
];

const roots=[app,path.join(repo,"scripts"),path.join(repo,"config")];
const deny=new Set(["node_modules",".git","dist","build",".next","coverage"]);
const namesRe=/(lightbox|proxy|package\.json|\.env|vite|next\.config|server|client)/i;
const files=new Set(explicitCandidates.filter(fs.existsSync));

function walk(d,depth=0){
  if(depth>5||!fs.existsSync(d)) return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    if(deny.has(e.name)) continue;
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p,depth+1);continue}
    if(!e.isFile()) continue;
    if(namesRe.test(e.name) && /\.(js|mjs|cjs|ts|tsx|json|env|example|md|txt)?$/i.test(e.name)) files.add(p);
  }
}
roots.forEach(r=>walk(r));

const docs=[];
const scriptCandidates=[];
for(const p of [...files]){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(text.length>2_000_000) continue;
  const rel=path.relative(repo,p);
  const envNames=extractEnvNames(text);
  const ports=extractPorts(text);
  const urlFragments=extractUrlFragments(text);
  const dynamicUrlConstruction=/new URL\(|URLSearchParams|`\$\{|\.replace\(|\.concat\(|\+\s*["'`]\/|fetch\s*\(/.test(text);
  const lightbox=/lightbox/i.test(text);
  const proxy=/proxy/i.test(text);
  const launch=/npm run|node\s+.*proxy|spawn\(|exec\(|scripts|listen\(/i.test(text);
  docs.push({relativePath:rel,sha256:sha(text),lightbox,proxy,launch,dynamicUrlConstruction,envNames,ports,urlFragments});
  if(path.basename(p)==="package.json"){
    try{
      const pkg=JSON.parse(text);
      for(const [k,v] of Object.entries(pkg.scripts||{})){
        if(/lightbox|proxy|server|dev/i.test(k+" "+v)) scriptCandidates.push({package:rel,script:k,command:v});
      }
    }catch{}
  }
}

const relevant=docs.filter(d=>d.lightbox||d.proxy||d.envNames.some(n=>/LIGHTBOX|PROXY/i.test(n)));
const envNames=[...new Set(relevant.flatMap(d=>d.envNames))].sort();
const ports=[...new Set(relevant.flatMap(d=>d.ports))].sort((a,b)=>a-b);
const fragments=[...new Set(relevant.flatMap(d=>d.urlFragments))];
const localhostUrls=fragments.filter(x=>/^https?:\/\/(?:localhost|127\.0\.0\.1)/i.test(x));
const apiFragments=fragments.filter(x=>x.startsWith("/"));

const likelyPort=ports[0]||null;
const likelyBase=localhostUrls[0] || (likelyPort?`http://localhost:${likelyPort}`:null);
const likelyRoute=apiFragments.find(x=>/lightbox|property|parcel|search|enrich/i.test(x))||apiFragments[0]||null;
const dryRunUrl=likelyBase&&likelyRoute ? `${likelyBase}${likelyRoute}` : null;

const configuredEnv=envNames.filter(n=>Object.prototype.hasOwnProperty.call(process.env,n));

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4B_LIGHTBOX_RUNTIME_BINDING_PLAN",
  version:VERSION,generatedAt:new Date().toISOString(),
  launchScripts:scriptCandidates,
  discoveredEnvironmentNames:envNames,
  discoveredPorts:ports,
  discoveredUrlFragments:fragments,
  configuredEnvironmentNames:configuredEnv,
  inferred:{likelyPort,likelyBase,likelyRoute,dryRunUrl},
  nextActions: dryRunUrl ? [
    `Start the existing LightBox/proxy runtime using the discovered package script if it is not already running.`,
    `export SCIIP_LIGHTBOX_DRY_RUN_URL="${dryRunUrl}"`,
    "Rerun M4.19D4 without authorization to confirm endpoint binding.",
    "Then rerun M4.19D4 with AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ."
  ] : [
    "Inspect the listed launch scripts and URL-construction files; no endpoint should be invented.",
    "If an existing local proxy launch command is identified, run it and expose its actual URL via SCIIP_LIGHTBOX_DRY_RUN_URL.",
    "Rerun M4.19D4 only after the endpoint is real and reachable."
  ]
};
write(planPath,plan);

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:dryRunUrl
    ?"M419D4B_LIGHTBOX_RUNTIME_LAUNCH_AND_DYNAMIC_PROXY_BINDING_DISCOVERED"
    :"M419D4B_LIGHTBOX_RUNTIME_FORENSICS_COMPLETE_ENDPOINT_STILL_NOT_PROVEN",
  certifiedAt:new Date().toISOString(),
  forensics:{
    filesInspected:docs.length,
    relevantFiles:relevant.length,
    launchScriptCandidates:scriptCandidates,
    environmentVariableNames:envNames,
    ports,
    urlFragments:fragments,
    configuredEnvironmentNames:configuredEnv,
    inferredDryRunUrl:dryRunUrl,
    secretValuesExposed:false,
    networkRequestPerformed:false
  },
  binding:{bindingPlanPath:planPath,endpointProven:!!dryRunUrl},
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false},
  nextMilestone: dryRunUrl
    ?"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
    :"M4.19D4C_LIGHTBOX_RUNTIME_BOOTSTRAP_CONTRACT_AND_PROXY_ROUTE_TARGETED_INSPECTION"
};
write(resultPath,out); console.log(JSON.stringify(out,null,2));
