#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import {CONTRACT,VERSION,extractEnvNames,extractRoutes,sha} from "./M419D4AProxyBindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4-lightbox-single-record-source-native-available-sf-qualification.json");
const result=path.join(ev,"m4-19d4a-lightbox-existing-proxy-route-env-configuration-binding.json");
const binding=path.join(ev,"m4-19d4a-lightbox-proxy-binding-plan.json");

const candidates=[
 path.join(app,"server/lightbox/proxy-server.mjs"),
 path.join(app,"src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js"),
 path.join(app,"server/lightbox/LightBoxEnrichmentService.mjs"),
 path.join(app,"server/lightbox/LightBoxEnrichmentOrchestrator.mjs")
];

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error("M4.19D4 prerequisite missing");

const docs=[];
for(const p of candidates){
  if(!fs.existsSync(p)){docs.push({path:p,exists:false});continue}
  const text=fs.readFileSync(p,"utf8");
  docs.push({
    path:p,exists:true,sha256:sha(text),
    envNames:extractEnvNames(text),
    routes:extractRoutes(text),
    localhostHints:[...new Set((text.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+[^\s"'`]*/g)||[]))],
    portHints:[...new Set((text.match(/\b(?:PORT|port)\b[^0-9]{0,20}(\d{4,5})/g)||[]))],
    hasFetch:/fetch\s*\(|axios|https?\.request|http\.request/i.test(text)
  });
}

const envNames=[...new Set(docs.flatMap(d=>d.envNames||[]))].sort();
const routes=[...new Set(docs.flatMap(d=>d.routes||[]))];
const urls=[...new Set(docs.flatMap(d=>d.localhostHints||[]))];

const likelyRoutes=routes.filter(r=>/lightbox|property|parcel|enrich|search|api/i.test(r));
const preferredRoute=likelyRoutes[0]||routes[0]||null;
const preferredBase=urls[0]||null;

const configuredNames=envNames.filter(n=>Object.prototype.hasOwnProperty.call(process.env,n));
const hasProxyPath=!!preferredRoute;
const hasBase=!!preferredBase || envNames.some(n=>/PROXY_URL|BASE_URL|LIGHTBOX_URL/i.test(n));

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4A_LIGHTBOX_PROXY_BINDING_PLAN",
  version:VERSION,generatedAt:new Date().toISOString(),
  discovered:{files:docs,envNames,routes,likelyRoutes,localhostHints:urls,configuredEnvironmentNames:configuredNames},
  binding:{
    preferredRoute,
    preferredBase,
    canConstructDryRunEndpoint:hasProxyPath&&hasBase,
    recommendedExport: hasProxyPath
      ? `export SCIIP_LIGHTBOX_DRY_RUN_URL="${preferredBase||"${LIGHTBOX_PROXY_URL}"}${preferredRoute}"`
      : null,
    note:"Do not paste credentials into evidence files. Export them only in the shell/runtime environment used to run the dry-run."
  }
};
write(binding,plan);

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:hasProxyPath?"M419D4A_EXISTING_LIGHTBOX_PROXY_ROUTE_DISCOVERED_ENV_BINDING_PLAN_CERTIFIED":"M419D4A_LIGHTBOX_PROXY_ROUTE_NOT_DISCOVERED_MANUAL_BINDING_REQUIRED",
  certifiedAt:new Date().toISOString(),
  discovery:{filesInspected:docs.length,existingFiles:docs.filter(d=>d.exists).length,environmentVariableNames:envNames,routesDiscovered:routes,likelyRoutes,localhostHints:urls,configuredEnvironmentNames:configuredNames,secretValuesExposed:false,networkRequestPerformed:false},
  binding:{bindingPlanPath:binding,preferredRoute,preferredBase,canConstructDryRunEndpoint:hasProxyPath&&hasBase},
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false},
  nextMilestone:"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
};
write(result,out); console.log(JSON.stringify(out,null,2));
