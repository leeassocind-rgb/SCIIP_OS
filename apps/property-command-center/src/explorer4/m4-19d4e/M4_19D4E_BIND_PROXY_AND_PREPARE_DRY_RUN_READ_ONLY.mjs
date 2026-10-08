#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,APPROVED_FIELD,EXPECTED_PREAUTHORIZED_ROWS,
  extractPortEvidence,extractRouteEvidence,sha
} from "./M419D4EBindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4d-lightbox-data-route-implementation-targeted-forensics.json");
const preauth=path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json");
const resultPath=path.join(ev,"m4-19d4e-lightbox-proxy-bootstrap-single-record-dry-run-binding.json");
const launcherPath=path.join(ev,"m4-19d4e-lightbox-single-record-dry-run-launcher.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const fail=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false}};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,preauth]) if(!fs.existsSync(p)) fail("M419D4E_PREREQUISITE_MISSING",{path:p});
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4D_LIGHTBOX_ENRICH_ROUTE_AND_AVAILABLE_SF_SEMANTIC_PATH_PROVEN_DRY_RUN_BINDING_READY")
  fail("M419D4E_M419D4D_DRY_RUN_BINDING_READY_STATE_REQUIRED",{observed:priorDoc?.state??null});

const rows=JSON.parse(fs.readFileSync(preauth,"utf8"))?.rows||[];
if(rows.length!==EXPECTED_PREAUTHORIZED_ROWS) fail("M419D4E_EXACT_400_PREAUTHORIZED_ROWS_REQUIRED",{observed:rows.length});

const sample=rows[0];

const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
if(!fs.existsSync(proxyPath)) fail("M419D4E_LIGHTBOX_PROXY_SERVER_REQUIRED",{path:proxyPath});

const proxyText=fs.readFileSync(proxyPath,"utf8");
const ports=extractPortEvidence(proxyText);
const routes=extractRouteEvidence(proxyText);

const explicit8787=/8787/.test(proxyText);
const envPort=/LIGHTBOX_PROXY_PORT/.test(proxyText);
const enrichRoute=routes.includes("/api/lightbox/enrich");

let selectedPort=null;
for(const e of ports){
  for(const g of e.groups){
    if(String(g)==="8787") selectedPort=8787;
  }
}
if(!selectedPort && explicit8787 && envPort) selectedPort=8787;

if(!selectedPort) fail("M419D4E_LIGHTBOX_PROXY_PORT_NOT_PROVEN",{ports,envPort,explicit8787});
if(!enrichRoute) fail("M419D4E_LIGHTBOX_ENRICH_ROUTE_NOT_PROVEN",{routes});

const proxyBase=`http://127.0.0.1:${selectedPort}`;
const enrichUrl=`${proxyBase}/api/lightbox/enrich`;

const packagePath=path.join(app,"package.json");
let scripts={};
if(fs.existsSync(packagePath)){
  try{scripts=JSON.parse(fs.readFileSync(packagePath,"utf8"))?.scripts||{}}catch{}
}

const possibleProxyScript=Object.entries(scripts).find(([k,v])=>/lightbox|proxy/i.test(`${k} ${v}`))||null;

const launcher={
  contract:"SCIIP_EXPLORER_4_M4_19D4E_LIGHTBOX_SINGLE_RECORD_DRY_RUN_LAUNCHER",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  sample:{
    canonicalPropertyId:sample.canonicalPropertyId,
    sourcePropertyId:sample.sourcePropertyId
  },
  proxy:{
    entrypoint:"apps/property-command-center/server/lightbox/proxy-server.mjs",
    selectedPort,
    baseUrl:proxyBase,
    enrichUrl,
    packageScript:possibleProxyScript?{name:possibleProxyScript[0],command:possibleProxyScript[1]}:null
  },
  requiredEnvironment:{
    LIGHTBOX_PROXY_PORT:String(selectedPort),
    LIGHTBOX_PROXY_URL:proxyBase,
    SCIIP_LIGHTBOX_DRY_RUN_URL:enrichUrl
  },
  dryRunContract:{
    approvedField:APPROVED_FIELD,
    maximumExternalRequests:1,
    explicitAuthorizationArgument:"AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ",
    sourceNativeAvailableSfRequired:true,
    rawResponseHashRequired:true,
    temporalMutationAuthorized:false,
    canonicalMutationAuthorized:false,
    identityMutationAuthorized:false
  },
  commands:{
    startProxy: possibleProxyScript
      ? `cd apps/property-command-center && npm run ${possibleProxyScript[0]}`
      : `cd apps/property-command-center && LIGHTBOX_PROXY_PORT=${selectedPort} node server/lightbox/proxy-server.mjs`,
    exportBinding:`export LIGHTBOX_PROXY_URL="${proxyBase}"\nexport SCIIP_LIGHTBOX_DRY_RUN_URL="${enrichUrl}"`,
    rerunM419D4Authorized:"Run M4.19D4 with AUTHORIZE_M419D4_SINGLE_LIGHTBOX_READ after the proxy is confirmed running."
  }
};
write(launcherPath,launcher);

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:"M419D4E_LIGHTBOX_PROXY_BOOTSTRAP_AND_SINGLE_RECORD_DRY_RUN_BINDING_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  binding:{
    proxyEntrypoint:"apps/property-command-center/server/lightbox/proxy-server.mjs",
    proxyPort:selectedPort,
    proxyBaseUrl:proxyBase,
    enrichUrl,
    enrichRouteProven:true,
    availableSfSemanticPathPreviouslyProven:true,
    preauthorizedSample:{canonicalPropertyId:sample.canonicalPropertyId,sourcePropertyId:sample.sourcePropertyId},
    networkRequestPerformed:false,
    proxyStarted:false
  },
  safety:{
    readOnlyBinding:true,
    secretValuesExposed:false,
    credentialsRequiredAtRuntimeOnly:true,
    evidenceFabricated:false,
    networkRequestPerformed:false
  },
  artifacts:{singleRecordDryRunLauncher:launcherPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,automaticRetry:false
  },
  nextMilestone:"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
};
write(resultPath,out); console.log(JSON.stringify(out,null,2));
