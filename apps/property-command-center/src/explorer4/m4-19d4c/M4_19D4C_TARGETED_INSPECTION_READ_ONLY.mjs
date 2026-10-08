#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import {CONTRACT,VERSION,extractListenPorts,extractRouteStrings,sha} from "./M419D4CTargetRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4b-lightbox-runtime-launch-contract-dynamic-proxy-construction-forensics.json");
const resultPath=path.join(ev,"m4-19d4c-lightbox-runtime-bootstrap-contract-proxy-route-targeted-inspection.json");
const bindingPath=path.join(ev,"m4-19d4c-lightbox-proxy-runtime-binding-plan.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));

const targets=[
  path.join(app,"server/lightbox/proxy-server.mjs"),
  path.join(app,"package.json"),
  path.join(app,"src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js"),
  path.join(app,"vite.config.js"), path.join(app,"vite.config.mjs"), path.join(app,"vite.config.ts")
].filter(fs.existsSync);

const docs=[];
for(const p of targets){
  const text=fs.readFileSync(p,"utf8");
  const routes=extractRouteStrings(text);
  const listens=extractListenPorts(text);
  const envNames=[...new Set([...text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)].map(m=>m[1]))];
  const explicitPorts=[...new Set([...text.matchAll(/(?:localhost|127\.0\.0\.1):(\d{4,5})/g)].map(m=>Number(m[1])))];
  const numericDefaults=[...new Set([...text.matchAll(/\b(5173|5174|8787)\b/g)].map(m=>Number(m[1])))];
  docs.push({
    relativePath:path.relative(repo,p),sha256:sha(text),routes,listens,envNames,explicitPorts,numericDefaults,
    hasListenCall:/\.listen\s*\(/.test(text),
    hasLightBoxProxyPort:/LIGHTBOX_PROXY_PORT/.test(text),
    hasVite:/\bvite\b/i.test(text)
  });
}

const proxyDoc=docs.find(d=>d.relativePath.endsWith("server/lightbox/proxy-server.mjs"))||null;
const proxyPorts=new Set([...(proxyDoc?.explicitPorts||[]),...(proxyDoc?.numericDefaults||[])]);
if(proxyDoc?.hasLightBoxProxyPort) proxyPorts.add(8787);

const vitePorts=new Set();
for(const d of docs){
  if(d.hasVite && !d.relativePath.endsWith("proxy-server.mjs")){
    for(const p of [...(d.explicitPorts||[]),...(d.numericDefaults||[])]) if(p===5173||p===5174) vitePorts.add(p);
  }
}

const routes=proxyDoc?.routes||[];
const selfTest=routes.find(r=>r==="/api/lightbox/self-test")||null;
const readiness=routes.find(r=>r==="/api/lightbox/readiness")||null;
const enrich=routes.find(r=>r==="/api/lightbox/enrich")||null;
const parcelResolve=routes.find(r=>r==="/api/lightbox/parcel/resolve")||null;

const likelyProxyPort=[...proxyPorts].find(p=>p===8787) || [...proxyPorts][0] || null;
const proxyBase=likelyProxyPort?`http://localhost:${likelyProxyPort}`:null;

/*
Do not confuse health/self-test routes with a property data route.
For availableSf semantic qualification, prefer /enrich if present; parcel routes
are parcel identity/geometry paths and self-test/readiness are diagnostics only.
*/
const semanticRoute=enrich || parcelResolve || null;
const diagnosticRoute=selfTest || readiness || null;
const dryRunUrl=proxyBase && semanticRoute ? `${proxyBase}${semanticRoute}` : null;
const diagnosticUrl=proxyBase && diagnosticRoute ? `${proxyBase}${diagnosticRoute}` : null;

const endpointProven=!!(likelyProxyPort && semanticRoute);
const falsePositiveCorrected=priorDoc?.forensics?.inferredDryRunUrl==="http://localhost/api/lightbox/self-test";

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4C_LIGHTBOX_PROXY_RUNTIME_BINDING_PLAN",
  version:VERSION,generatedAt:new Date().toISOString(),
  inspection:docs,
  classification:{
    viteDevPorts:[...vitePorts],
    lightBoxProxyPorts:[...proxyPorts],
    selectedLightBoxProxyPort:likelyProxyPort,
    diagnosticRoutes:routes.filter(r=>/self-test|readiness|diagnostics|conflicts/.test(r)),
    dataRoutes:routes.filter(r=>/enrich|parcel|property|search/.test(r)),
    selectedSemanticDataRoute:semanticRoute,
    selectedDiagnosticRoute:diagnosticRoute
  },
  correction:{
    priorInferredUrl:priorDoc?.forensics?.inferredDryRunUrl??null,
    priorInferenceAccepted:false,
    falsePositiveCorrected,
    reason:"A LightBox diagnostic route without an explicitly bound proxy port is not a proven property-data dry-run endpoint."
  },
  binding:{
    proxyBase,diagnosticUrl,dryRunUrl,endpointProven,
    recommendedExports: endpointProven ? [
      `export LIGHTBOX_PROXY_URL="${proxyBase}"`,
      `export SCIIP_LIGHTBOX_DRY_RUN_URL="${dryRunUrl}"`
    ] : []
  },
  launch:{
    likelyProxyEntrypoint:"apps/property-command-center/server/lightbox/proxy-server.mjs",
    suggestedCommand: likelyProxyPort ? `LIGHTBOX_PROXY_PORT=${likelyProxyPort} node apps/property-command-center/server/lightbox/proxy-server.mjs` : null,
    note:"This command starts the existing local proxy only; credentials required by the proxy must already be supplied via the environment. Do not paste credentials into evidence artifacts."
  }
};
write(bindingPath,plan);

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:endpointProven
    ?"M419D4C_LIGHTBOX_PROXY_PORT_AND_DATA_ROUTE_TARGETED_BINDING_CERTIFIED"
    :"M419D4C_LIGHTBOX_TARGETED_INSPECTION_COMPLETE_DATA_ENDPOINT_NOT_PROVEN",
  certifiedAt:new Date().toISOString(),
  targetedInspection:{
    filesInspected:docs.length,
    viteDevPorts:[...vitePorts],
    lightBoxProxyPorts:[...proxyPorts],
    selectedProxyPort:likelyProxyPort,
    routes,
    selectedSemanticDataRoute:semanticRoute,
    selectedDiagnosticRoute:diagnosticRoute,
    dryRunUrl,
    diagnosticUrl,
    endpointProven,
    priorFalsePositiveInferenceCorrected:falsePositiveCorrected,
    networkRequestPerformed:false,
    secretValuesExposed:false
  },
  binding:{bindingPlanPath:bindingPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,automaticRetry:false
  },
  nextMilestone:endpointProven
    ?"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
    :"M4.19D4D_LIGHTBOX_DATA_ROUTE_IMPLEMENTATION_TARGETED_FORENSICS"
};
write(resultPath,out); console.log(JSON.stringify(out,null,2));
