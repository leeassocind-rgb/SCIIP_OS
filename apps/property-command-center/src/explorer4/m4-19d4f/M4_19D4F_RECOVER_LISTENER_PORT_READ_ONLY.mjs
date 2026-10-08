#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import {CONTRACT,VERSION,extractPorts,extractEnvNames,extractLaunchCommands,sha} from "./M419D4FPortRecoveryRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4e-lightbox-proxy-bootstrap-single-record-dry-run-binding.json");
const resultPath=path.join(ev,"m4-19d4f-lightbox-listener-port-source-of-truth-runtime-bootstrap-recovery.json");
const bindingPath=path.join(ev,"m4-19d4f-lightbox-listener-port-binding-plan.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);

const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4E_LIGHTBOX_PROXY_PORT_NOT_PROVEN")
  throw new Error(`unexpected prior state: ${priorDoc?.state}`);

const roots=[
  repo,
  path.join(repo,"tools"),
  path.join(repo,"scripts"),
  path.join(app,"server"),
  path.join(app,"src"),
  path.join(app,"config")
];
const deny=new Set(["node_modules",".git","dist","build",".next","coverage",".cache"]);
const files=[];
const interesting=/(lightbox|proxy|server|package\.json|\.env|vite|launch|start|dev|config)/i;

function walk(d,depth=0){
  if(depth>6||!fs.existsSync(d)) return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    if(deny.has(e.name)) continue;
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p,depth+1);continue}
    if(!e.isFile() || !interesting.test(e.name)) continue;
    if(!/\.(js|mjs|cjs|ts|tsx|json|sh|command|env|example|md|txt)$/i.test(e.name) && !e.name.startsWith(".env")) continue;
    files.push(p);
  }
}
roots.forEach(r=>walk(r));

const seen=new Set(), docs=[];
for(const p of files){
  const rp=path.resolve(p); if(seen.has(rp)) continue; seen.add(rp);
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(text.length>3_000_000) continue;
  const low=text.toLowerCase();
  if(!low.includes("lightbox") && !low.includes("proxy-server")) continue;

  const ports=extractPorts(text);
  const envNames=extractEnvNames(text);
  const launchCommands=extractLaunchCommands(text);
  const rel=path.relative(repo,p);

  const relevantPortMentions=[];
  for(const line of text.split(/\r?\n/)){
    if(/LIGHTBOX_PROXY_PORT|proxy.*port|port.*proxy|localhost:\d+|127\.0\.0\.1:\d+/.test(line))
      relevantPortMentions.push(line.trim().slice(0,500));
  }

  docs.push({
    relativePath:rel,
    sha256:sha(text),
    ports,
    envNames,
    launchCommands,
    relevantPortMentions:relevantPortMentions.slice(0,100),
    hasProxyServerRef:/proxy-server\.mjs/.test(text),
    hasLightBoxProxyPort:/LIGHTBOX_PROXY_PORT/.test(text)
  });
}

const portEvidence=new Map();
for(const d of docs){
  for(const p of d.ports){
    if(!portEvidence.has(p)) portEvidence.set(p,[]);
    portEvidence.get(p).push(d.relativePath);
  }
}

const explicitEnvDocs=docs.filter(d=>d.hasLightBoxProxyPort);
const proxyRefDocs=docs.filter(d=>d.hasProxyServerRef);

let selectedPort=null;
let selectionBasis=null;

/* strongest evidence: LIGHTBOX_PROXY_PORT appears in same file as a numeric port */
for(const d of explicitEnvDocs){
  const candidates=d.ports.filter(p=>![5173,5174].includes(p));
  if(candidates.length===1){
    selectedPort=candidates[0];
    selectionBasis=`LIGHTBOX_PROXY_PORT_AND_SINGLE_NON_VITE_PORT_IN_${d.relativePath}`;
    break;
  }
}

/* second: same non-vite port repeated across two+ lightbox/proxy files */
if(!selectedPort){
  for(const [p,files] of [...portEvidence.entries()].sort((a,b)=>a[0]-b[0])){
    if([5173,5174].includes(p)) continue;
    if(files.length>=2){
      selectedPort=p;
      selectionBasis=`REPEATED_NON_VITE_PORT_ACROSS_${files.length}_LIGHTBOX_FILES`;
      break;
    }
  }
}

/* third: launch wrapper explicitly sets LIGHTBOX_PROXY_PORT=<n> */
if(!selectedPort){
  for(const d of docs){
    const joined=[...d.launchCommands,...d.relevantPortMentions].join("\n");
    const m=joined.match(/LIGHTBOX_PROXY_PORT\s*=\s*(\d{4,5})/);
    if(m){
      selectedPort=Number(m[1]);
      selectionBasis=`EXPLICIT_LAUNCH_WRAPPER_ASSIGNMENT_IN_${d.relativePath}`;
      break;
    }
  }
}

const portAgnostic=explicitEnvDocs.length>0 && !selectedPort;
const chosenPort=selectedPort || 8787;
const safeDefaultIntroduced=portAgnostic && !selectedPort;

const baseUrl=`http://127.0.0.1:${chosenPort}`;
const enrichUrl=`${baseUrl}/api/lightbox/enrich`;

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4F_LIGHTBOX_LISTENER_PORT_BINDING_PLAN",
  version:VERSION,generatedAt:new Date().toISOString(),
  inspection:{
    filesInspected:docs.length,
    explicitLightBoxProxyPortFiles:explicitEnvDocs.map(d=>d.relativePath),
    proxyServerReferenceFiles:proxyRefDocs.map(d=>d.relativePath),
    portEvidence:[...portEvidence.entries()].map(([port,files])=>({port,files}))
  },
  conclusion:{
    listenerPortSourceOfTruthProven:!!selectedPort,
    selectedPort:selectedPort,
    selectionBasis,
    runtimePortAgnostic:portAgnostic,
    safeExplicitLaunchPort:portAgnostic?8787:null,
    safeDefaultIntroduced,
    explanation: selectedPort
      ? "A concrete listener port was recovered from existing runtime/bootstrap evidence."
      : portAgnostic
        ? "The existing LightBox runtime expects LIGHTBOX_PROXY_PORT to be supplied externally; no repository-native numeric source-of-truth was proven. Port 8787 may be explicitly assigned by the operator for the isolated local dry-run, but is not claimed as historical source-of-truth."
        : "Neither a concrete listener port nor a proven runtime port variable was recovered."
  },
  dryRunBinding: portAgnostic||selectedPort ? {
    launchCommand:`cd ${app} && LIGHTBOX_PROXY_PORT=${chosenPort} node server/lightbox/proxy-server.mjs`,
    exports:[
      `export LIGHTBOX_PROXY_URL="${baseUrl}"`,
      `export SCIIP_LIGHTBOX_DRY_RUN_URL="${enrichUrl}"`
    ],
    authorizationArgument:"AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ",
    note:"Starting the local proxy and performing the single external read remain separate operator actions."
  } : null
};
write(bindingPath,plan);

let state,next;
if(selectedPort){
  state="M419D4F_LIGHTBOX_LISTENER_PORT_SOURCE_OF_TRUTH_RECOVERED_DRY_RUN_BINDING_READY";
  next="M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION";
}else if(portAgnostic){
  state="M419D4F_LIGHTBOX_RUNTIME_PORT_AGNOSTIC_EXPLICIT_LOCAL_DRY_RUN_PORT_BINDING_CERTIFIED";
  next="M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION";
}else{
  state="M419D4F_LIGHTBOX_LISTENER_PORT_SOURCE_OF_TRUTH_NOT_RECOVERED";
  next="M4.19D5_LIGHTBOX_RUNTIME_BINDING_GAP_DECISION_POLICY";
}

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",state,certifiedAt:new Date().toISOString(),
  recovery:{
    filesInspected:docs.length,
    explicitLightBoxProxyPortFiles:explicitEnvDocs.length,
    selectedPort,
    selectionBasis,
    runtimePortAgnostic:portAgnostic,
    explicitLocalDryRunPort:portAgnostic?8787:null,
    sourceOfTruthClaimedFor8787:selectedPort===8787,
    networkRequestPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{listenerPortBindingPlan:bindingPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,automaticRetry:false
  },
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
