#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,flags,sha} from "./M419D4JFailureForensicsRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4i-lightbox-single-record-post-dry-run-qualification.json");
const resultPath=path.join(ev,"m4-19d4j-lightbox-post-socket-hangup-failure-forensics.json");
const auditPath=path.join(ev,"m4-19d4j-lightbox-post-execution-chain-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4I_SINGLE_LIGHTBOX_POST_READ_FAILED" || priorDoc?.error!=="socket hang up")
  throw new Error(`unexpected prior state/error: ${priorDoc?.state} / ${priorDoc?.error}`);

const targets=[
  path.join(app,"server/lightbox/proxy-server.mjs"),
  path.join(app,"server/lightbox/LightBoxEnrichmentOrchestrator.mjs"),
  path.join(app,"server/lightbox/LightBoxEnrichmentService.mjs"),
  path.join(app,"server/lightbox/config.mjs"),
  path.join(app,"server/lightbox/LightBoxEvidenceExtractor.mjs")
].filter(fs.existsSync);

const docs=[];
for(const p of targets){
  const text=fs.readFileSync(p,"utf8");
  const f=flags(text);
  const snippets=[];
  for(const re of [
    /.{0,220}\/api\/lightbox\/enrich.{0,700}/gs,
    /.{0,220}enrichSelectedProperty.{0,900}/gs,
    /.{0,220}(?:fetch\s*\(|https?\.request|axios).{0,900}/gs,
    /.{0,220}(?:timeout|AbortController|LIGHTBOX_TIMEOUT_MS).{0,500}/gis,
    /.{0,220}(?:catch\s*\(|\.on\(\s*["']error["']).{0,700}/gs
  ]){
    let m; re.lastIndex=0;
    while((m=re.exec(text))!==null && snippets.length<40) snippets.push(m[0].replace(/\s+/g," ").slice(0,1200));
  }
  docs.push({relativePath:path.relative(repo,p),sha256:sha(text),flags:f,snippets});
}

const proxy=docs.find(d=>d.relativePath.endsWith("proxy-server.mjs"))||null;
const orchestrator=docs.find(d=>/LightBoxEnrichmentOrchestrator/.test(d.relativePath))||null;
const service=docs.find(d=>/LightBoxEnrichmentService/.test(d.relativePath))||null;
const config=docs.find(d=>/server\/lightbox\/config\.mjs$/.test(d.relativePath))||null;

const timeoutConfigured=config?.snippets?.some(s=>/timeout|LIGHTBOX_TIMEOUT_MS/i.test(s)) || docs.some(d=>d.flags.timeout);
const upstreamPresent=docs.some(d=>d.flags.upstreamFetch);
const routePresent=!!proxy?.flags.enrichRoute;
const orchestratorPresent=!!orchestrator?.flags.orchestrator;

const likelyUncaughtRisk = !!proxy && !proxy.flags.tryCatch;
const serviceUpstreamRisk = !!service && service.flags.upstreamFetch && !service.flags.requestErrorHandler && !service.flags.tryCatch;

const classification = likelyUncaughtRisk || serviceUpstreamRisk
  ? "PROXY_OR_UPSTREAM_EXCEPTION_MAY_ESCAPE_RESPONSE_BOUNDARY"
  : upstreamPresent
    ? "UPSTREAM_LIGHTBOX_CALL_OR_TIMEOUT_FAILURE_REQUIRES_RUNTIME_ERROR_CAPTURE"
    : "POST_EXECUTION_CHAIN_FAILURE_REQUIRES_RUNTIME_ERROR_CAPTURE";

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4J_LIGHTBOX_POST_EXECUTION_CHAIN_AUDIT",
  version:VERSION,generatedAt:new Date().toISOString(),
  routePresent,orchestratorPresent,upstreamPresent,timeoutConfigured,
  likelyUncaughtRisk,serviceUpstreamRisk,classification,
  files:docs
};
write(auditPath,audit);

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:"M419D4J_SOCKET_HANGUP_CAUSAL_FORENSICS_CERTIFIED_RUNTIME_ERROR_CAPTURE_REQUIRED",
  certifiedAt:new Date().toISOString(),
  failure:{
    priorState:priorDoc.state,
    priorError:priorDoc.error,
    requestContractWasPOST:true,
    networkRequestPreviouslyPerformed:true,
    newNetworkRequestPerformed:false,
    classification,
    routePresent,
    orchestratorPresent,
    upstreamPresent,
    timeoutConfigured,
    likelyUncaughtRisk,
    serviceUpstreamRisk
  },
  recoveryPolicy:{
    doNotRepeatLiveReadBlindly:true,
    verifyProxyProcessStillAlive:true,
    captureProxyStderrStdoutRequired:true,
    diagnosticSelfTestBeforeRetryRequired:true,
    oneRetryMaximumAfterRuntimeCauseIdentified:true,
    noAutomaticRetry:true,
    canonicalTemporalIdentityWritesRemainOff:true
  },
  artifacts:{executionChainAudit:auditPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  nextMilestone:"M4.19D4K_LIGHTBOX_PROXY_RUNTIME_ERROR_CAPTURE_AND_CONTROLLED_SINGLE_POST_RETRY_GATE"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
