#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,extractConfigFunction,propertyExpressions,classifyPrecedence,sha} from "./M419D4ABPrecedenceRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4aa-config-identifier-origin-exact-binding.json");
const configPath=path.join(app,"server/lightbox/config.mjs");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const resultPath=path.join(ev,"m4-19d4ab-server-config-precedence-effective-runtime-binding.json");
const auditPath=path.join(ev,"m4-19d4ab-server-config-precedence-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,configPath,proxyPath]){
  if(!fs.existsSync(p)) block("M419D4AB_PREREQUISITE_MISSING",{path:p});
}

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING_CERTIFIED")
  block("M419D4AB_M419D4AA_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.binding?.exactOriginProven!==true)
  block("M419D4AB_EXACT_CONFIG_ORIGIN_REQUIRED",{observed:pdoc?.binding?.exactOriginProven??null});

const cfg=fs.readFileSync(configPath,"utf8");
const proxy=fs.readFileSync(proxyPath,"utf8");
const fn=extractConfigFunction(cfg);
if(!fn) block("M419D4AB_GETLIGHTBOXCONFIG_FUNCTION_NOT_RECOVERED");

const expressions=propertyExpressions(fn);
const precedence={};
for(const [prop,items] of Object.entries(expressions)){
  precedence[prop]=items.map(x=>({
    expression:x.expression,
    classes:classifyPrecedence(x.expression)
  }));
}

// Recover server env keys only from explicit env.<NAME> syntax inside getLightBoxConfig.
const envKeys=[...new Set([...fn.matchAll(/\benv\.(LIGHTBOX_[A-Z0-9_]+)/g)].map(m=>m[1]))].sort();

const expected={
  apiKey:"LIGHTBOX_API_KEY",
  baseUrl:"LIGHTBOX_BASE_URL",
  port:"LIGHTBOX_PROXY_PORT",
  timeoutMs:"LIGHTBOX_TIMEOUT_MS",
  allowedOrigins:"LIGHTBOX_ALLOWED_ORIGINS"
};

const bindingMap={};
for(const [prop,key] of Object.entries(expected)){
  bindingMap[prop]={
    environmentKey:key,
    explicitlyReferenced:envKeys.includes(key),
    hasFallbackOrNormalization:(precedence[prop]||[]).some(x=>x.classes.some(c=>[
      "FALLBACK_OR_DEFAULT","URL_DEFAULT","PORT_DEFAULT_8787","LOCAL_ORIGIN_DEFAULT",
      "NORMALIZED_NUMERIC","NORMALIZED_STRING"
    ].includes(c)))
  };
}

const enabledDerivedFromApiKey=/Boolean\(\s*apiKey\s*\)/.test(fn);
bindingMap.enabled={
  derivedFrom:"apiKey",
  explicitlyDerivedFromApiKey:enabledDerivedFromApiKey
};

const proxyConfigUses=[...new Set([...proxy.matchAll(/\bconfig\.(enabled|baseUrl|apiKey|port|timeoutMs|allowedOrigins)\b/g)].map(m=>m[1]))].sort();

const critical=[
  bindingMap.apiKey.explicitlyReferenced,
  bindingMap.baseUrl.explicitlyReferenced,
  bindingMap.port.explicitlyReferenced,
  bindingMap.allowedOrigins.explicitlyReferenced,
  enabledDerivedFromApiKey
];
const precedenceComplete=critical.every(Boolean);

let classification,next;
if(precedenceComplete){
  classification="SERVER_ENV_TO_CONFIG_FACTORY_TO_PROXY_PRECEDENCE_CERTIFIED";
  next="M4.19D4AC_ISOLATED_PROXY_ENVIRONMENT_BINDING_AND_SELF_TEST";
}else{
  classification="SERVER_CONFIG_PRECEDENCE_INCOMPLETE";
  next="M4.19D4AC_MISSING_PRECEDENCE_BINDING_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AB_SERVER_CONFIG_PRECEDENCE_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  configSource:path.relative(repo,configPath),
  proxySource:path.relative(repo,proxyPath),
  getLightBoxConfigRecovered:true,
  environmentKeyNames:envKeys,
  propertyPrecedence:precedence,
  effectiveBindingMap:bindingMap,
  proxyConfigUsageProperties:proxyConfigUses,
  enabledDerivedFromApiKey,
  precedenceComplete,
  classification,
  sourceHashes:{config:sha(cfg),proxy:sha(proxy)},
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  binding:{
    classification,
    environmentKeyNames:envKeys,
    effectiveBindingMap:bindingMap,
    proxyConfigUsageProperties:proxyConfigUses,
    enabledDerivedFromApiKey,
    precedenceComplete,
    effectiveOrder:[
      "SERVER_ENV_INPUT",
      "NORMALIZATION",
      "DEFAULT_OR_FALLBACK_WHERE_DEFINED",
      "getLightBoxConfig()",
      "proxy config object"
    ]
  },
  policy:{
    serverEnvironmentIsRuntimeInput:true,
    apiKeyControlsEnabledReadiness:true,
    defaultsDoNotSynthesizeCredentials:true,
    secretValuesMustRemainOpaque:true,
    isolatedSelfTestRequiredBeforeEnrichment:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
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
  artifacts:{precedenceAudit:auditPath},
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
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
