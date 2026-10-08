#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,findViteRefs,findServerConfigRefs,sha} from "./M419D4UBoundaryRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4t-lightbox-readiness-implementation-targeted-forensics.json");
const resultPath=path.join(ev,"m4-19d4u-server-client-config-boundary-repair-policy.json");
const planPath=path.join(ev,"m4-19d4u-server-client-config-boundary-repair-plan.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4U_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4T_LIGHTBOX_READINESS_IMPLEMENTATION_TARGETED_FORENSICS_CERTIFIED")
  block("M419D4U_M419D4T_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="SERVER_READINESS_DEPENDS_ON_VITE_CLIENT_CONFIGURATION")
  block("M419D4U_SERVER_READINESS_VITE_DEPENDENCY_CLASSIFICATION_REQUIRED",{observed:pdoc?.forensics?.classification??null});

const roots=[
  path.join(app,"server/lightbox"),
  path.join(app,"src")
].filter(fs.existsSync);

const exts=new Set([".mjs",".js",".cjs",".ts",".tsx",".jsx"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules","dist","build","coverage",".git"].includes(ent.name)) continue;
      walk(p);
    }else if(exts.has(path.extname(ent.name))){
      files.push(p);
    }
  }
}
for(const r of roots) walk(r);

const leaks=[];
for(const p of files){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  const vite=findViteRefs(text);
  if(!vite.length) continue;
  const serverish=p.includes(`${path.sep}server${path.sep}`) || /lightbox/i.test(p);
  const configRefs=findServerConfigRefs(text);
  leaks.push({
    file:path.relative(repo,p),
    serverRelevant:serverish,
    viteReferences:vite,
    configReferences:configRefs
  });
}

const serverLeaks=leaks.filter(x=>x.serverRelevant);
const allLeakFiles=serverLeaks.map(x=>x.file);

const repairedProxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const configPath=path.join(app,"server/lightbox/config.mjs");
const repairedProxyExists=fs.existsSync(repairedProxyPath);
const configExists=fs.existsSync(configPath);

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  diagnosis:{
    serverReadinessDependsOnViteClientConfiguration:true,
    serverRelevantLeakFiles:allLeakFiles,
    serverRelevantLeakCount:serverLeaks.length,
    repairedProxyExists,
    configExists
  },
  targetArchitecture:{
    serverOwnedConfigModuleRequired:true,
    clientViteConfigMayRemainForBrowserTransportOnly:true,
    serverMustNotDependOnImportMetaEnv:true,
    serverMustNotDependOnVitePrefix:true,
    serverConfigMayUseExplicitProcessEnvOrServerConfigObject:true,
    serverReadinessMustEvaluateServerOwnedInputs:true,
    serverConfigMustSupportIsolatedProxyBootstrap:true,
    serverSecretsMustRemainServerSide:true
  },
  proposedRepair:{
    scope:[
      "server/lightbox/config.mjs",
      "server/lightbox/proxy-server.mjs if required for injection only"
    ],
    steps:[
      "Remove server-side dependency on import.meta.env / VITE_* resolution.",
      "Create or normalize a server-owned configuration loader.",
      "Map browser VITE_LIGHTBOX_PROXY_URL usage only to client transport configuration.",
      "Bind server LightBox readiness to server-side baseUrl/apiKey/enabled/port/timeout/allowedOrigins inputs.",
      "Preserve the M4.19D4O enrich-route try/catch repair.",
      "Validate on isolated port 8788 before touching any normal runtime."
    ],
    mutationAuthorized:false,
    explicitAuthorizationRequired:true
  },
  safety:{
    noSecretValuesInPlan:true,
    canonicalTemporalIdentityStateUnaffected:true
  }
};
write(planPath,plan);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_POLICY_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  boundaryInventory:{
    filesScanned:files.length,
    viteReferenceFiles:leaks.length,
    serverRelevantLeakFiles:serverLeaks.length,
    serverRelevantLeakPaths:allLeakFiles,
    boundaryDefectConfirmed:serverLeaks.length>0
  },
  policy:{
    serverOwnedConfigurationRequired:true,
    serverImportMetaEnvProhibited:true,
    serverVitePrefixDependencyProhibited:true,
    clientViteTransportConfigurationAllowed:true,
    serverSecretsMustRemainServerSide:true,
    isolatedValidationRequired:true,
    repairAuthorized:false,
    explicitAuthorizationRequired:true
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{repairPlan:planPath},
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  nextMilestone:"M4.19D4V_SERVER_OWNED_LIGHTBOX_CONFIG_BOUNDARY_REPAIR_AND_ISOLATED_SELF_TEST"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
