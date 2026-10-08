#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,classifyLog,extractEnvContract,sha
} from "./M419D4QStartupRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4p-repaired-proxy-runtime-configuration-restore-self-test.json");
const logPath=path.join(ev,"m4-19d4p-repaired-proxy-self-test-runtime.log");
const auditPath=path.join(ev,"m4-19d4p-runtime-configuration-source-audit.json");
const configPath=path.join(app,"server/lightbox/config.mjs");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4q-repaired-proxy-startup-failure-forensics.json");
const forensicPath=path.join(ev,"m4-19d4q-repaired-proxy-startup-forensic-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,logPath,auditPath,configPath,proxyPath]){
  if(!fs.existsSync(p)) block("M419D4Q_PREREQUISITE_MISSING",{path:p});
}

const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4P_RUNTIME_CONFIGURATION_RECOVERED_BUT_REPAIRED_PROXY_SELF_TEST_NOT_READY")
  block("M419D4Q_M419D4P_STARTUP_FAILURE_STATE_REQUIRED",{observed:priorDoc?.state??null});

const log=fs.readFileSync(logPath,"utf8");
const cfg=fs.readFileSync(configPath,"utf8");
const proxy=fs.readFileSync(proxyPath,"utf8");
const sourceAudit=JSON.parse(fs.readFileSync(auditPath,"utf8"));

const logClasses=classifyLog(log);
const configEnv=extractEnvContract(cfg);
const proxyEnv=extractEnvContract(proxy);
const required=[...new Set([...configEnv,...proxyEnv])].sort();

const auditMap=new Map(
  (sourceAudit?.configuredVariableAudit||[]).map(x=>[x.name,!!x.configured])
);
const unresolved=required.filter(n=>/LIGHTBOX/i.test(n) && !auditMap.get(n) && !["LIGHTBOX_PROXY_PORT"].includes(n));

const configHasConfiguredFunction=/configured|isConfigured|readiness/i.test(cfg);
const configHasApiKey=/LIGHTBOX_API_KEY/.test(cfg);
const configHasOauth=/LIGHTBOX_CLIENT_ID/.test(cfg)&&/LIGHTBOX_CLIENT_SECRET/.test(cfg);
const baseUrlRequired=/LIGHTBOX_BASE_URL/.test(cfg);

const likelySilentStartup =
  log.trim()==="" ||
  (logClasses.length===0 && priorDoc?.selfTest?.httpStatus===null);

let classification;
if(logClasses.includes("PORT_CONFLICT")) classification="ISOLATED_PROXY_PORT_CONFLICT";
else if(logClasses.includes("MODULE_LOAD_FAILURE")||logClasses.includes("SYNTAX_FAILURE")||logClasses.includes("RUNTIME_EXCEPTION"))
  classification="PROXY_BOOTSTRAP_RUNTIME_EXCEPTION";
else if(logClasses.includes("CREDENTIAL_OR_AUTH_FAILURE")||logClasses.includes("CONFIGURATION_NOT_READY"))
  classification="SERVER_CONFIGURATION_REJECTED_AT_STARTUP";
else if(unresolved.length>0)
  classification="REQUIRED_LIGHTBOX_RUNTIME_VARIABLES_UNRESOLVED";
else if(likelySilentStartup)
  classification="PROXY_PROCESS_ALIVE_BUT_LISTENER_NOT_REACHED_WITHIN_GATE";
else
  classification="STARTUP_FAILURE_REQUIRES_BOOTSTRAP_INSTRUMENTATION";

const forensic={
  contract:"SCIIP_EXPLORER_4_M4_19D4Q_REPAIRED_PROXY_STARTUP_FORENSIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  priorState:priorDoc.state,
  log:{
    sha256:sha(log),
    byteLength:Buffer.byteLength(log),
    classifications:logClasses,
    empty:log.trim()===""
  },
  sourceContract:{
    configEnvironmentNames:configEnv,
    proxyEnvironmentNames:proxyEnv,
    requiredEnvironmentNames:required,
    unresolvedLightBoxEnvironmentNames:unresolved,
    configHasReadinessLogic:configHasConfiguredFunction,
    apiKeyModeDeclared:configHasApiKey,
    oauthModeDeclared:configHasOauth,
    baseUrlDeclared:baseUrlRequired
  },
  classification,
  secretValuesExposed:false
};
write(forensicPath,forensic);

let next;
if(classification==="REQUIRED_LIGHTBOX_RUNTIME_VARIABLES_UNRESOLVED" || classification==="SERVER_CONFIGURATION_REJECTED_AT_STARTUP")
  next="M4.19D4R_LIGHTBOX_SERVER_RUNTIME_VARIABLE_BINDING_GATE";
else if(classification==="PROXY_BOOTSTRAP_RUNTIME_EXCEPTION")
  next="M4.19D4R_LIGHTBOX_PROXY_BOOTSTRAP_EXCEPTION_REPAIR_POLICY";
else
  next="M4.19D4R_LIGHTBOX_PROXY_BOOTSTRAP_INSTRUMENTATION_AND_LISTENER_READINESS_GATE";

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4Q_REPAIRED_PROXY_STARTUP_FAILURE_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    runtimeLogClassifications:logClasses,
    runtimeLogEmpty:log.trim()==="",
    requiredLightBoxEnvironmentNames:required.filter(n=>/LIGHTBOX/i.test(n)),
    unresolvedLightBoxEnvironmentNames:unresolved,
    selfTestHttpStatus:priorDoc?.selfTest?.httpStatus??null,
    selfTestConfigured:priorDoc?.selfTest?.configured??null,
    sourceMutationPerformed:false,
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    secretValuesExposed:false
  },
  policy:{
    noBlindRestart:true,
    noEnrichmentRetry:true,
    bootstrapInstrumentationBeforeNextLiveAttempt:true,
    canonicalTemporalIdentityWritesRemainOff:true
  },
  artifacts:{startupForensicAudit:forensicPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
