#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {CONTRACT,VERSION,analyzeBoundary,sha} from "./M419D4NCrashRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const d4i=path.join(ev,"m4-19d4i-lightbox-single-record-post-dry-run-qualification.json");
const d4j=path.join(ev,"m4-19d4j-lightbox-post-socket-hangup-failure-forensics.json");
const d4m=path.join(ev,"m4-19d4m-healthy-8787-runtime-environment-contract-recovery.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4n-lightbox-proxy-crash-confirmation-error-boundary-repair-qualification.json");
const planPath=path.join(ev,"m4-19d4n-lightbox-proxy-error-boundary-repair-plan.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
for(const p of [d4i,d4j,d4m,proxyPath]) if(!fs.existsSync(p)) throw new Error(`missing prerequisite: ${p}`);

const i=JSON.parse(fs.readFileSync(d4i,"utf8"));
const j=JSON.parse(fs.readFileSync(d4j,"utf8"));
const m=JSON.parse(fs.readFileSync(d4m,"utf8"));
const proxy=fs.readFileSync(proxyPath,"utf8");
const boundary=analyzeBoundary(proxy);

let listenerPresent=false;
try{
  const out=execFileSync("lsof",["-nP","-iTCP:8787","-sTCP:LISTEN"],{encoding:"utf8"});
  listenerPresent=out.trim().split(/\r?\n/).length>1;
}catch{}

const socketHangup=i?.state==="M419D4I_SINGLE_LIGHTBOX_POST_READ_FAILED" && i?.error==="socket hang up";
const priorHealthy=j?.failure?.requestContractWasPOST===true;
const listenerGone=m?.state==="M419D4M_HEALTHY_8787_LISTENER_NOT_FOUND" && !listenerPresent;
const crashSequenceCertified=socketHangup && priorHealthy && listenerGone;

const repairNeeded=boundary.routePresent && boundary.awaitsOrchestrator && !boundary.localTryCatch;

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4N_LIGHTBOX_PROXY_ERROR_BOUNDARY_REPAIR_PLAN",
  version:VERSION,generatedAt:new Date().toISOString(),
  crashSequence:{
    priorPostSocketHangup:socketHangup,
    subsequentListenerAbsent:listenerGone,
    crashSequenceCertified
  },
  boundaryAnalysis:boundary,
  proposedRepair: repairNeeded ? {
    scope:"/api/lightbox/enrich only",
    behavior:[
      "Wrap orchestrator.enrichSelectedProperty(...) in a local try/catch.",
      "Return structured JSON HTTP 502/500 instead of allowing the request exception to escape.",
      "Capture error code/classification without exposing secrets.",
      "Do not alter canonical, temporal, identity, or ingestion state.",
      "Add process-level uncaughtException/unhandledRejection logging for diagnostics only; do not auto-restart."
    ],
    mutationAuthorized:false,
    requiresSeparateExplicitAuthorization:true,
    isolatedValidationPort:8788
  } : {
    scope:"NONE",
    reason:"A local route error boundary already appears present; deeper upstream failure isolation is required.",
    mutationAuthorized:false
  }
};
write(planPath,plan);

const state = crashSequenceCertified && repairNeeded
  ? "M419D4N_PROXY_CRASH_SEQUENCE_CERTIFIED_ENRICH_ERROR_BOUNDARY_REPAIR_QUALIFIED"
  : crashSequenceCertified
    ? "M419D4N_PROXY_CRASH_SEQUENCE_CERTIFIED_DEEPER_UPSTREAM_REPAIR_FORENSICS_REQUIRED"
    : "M419D4N_PROXY_CRASH_SEQUENCE_NOT_FULLY_CERTIFIED";

const next = crashSequenceCertified && repairNeeded
  ? "M4.19D4O_LIGHTBOX_ENRICH_ERROR_BOUNDARY_REPAIR_AND_ISOLATED_VALIDATION"
  : "M4.19D4O_LIGHTBOX_UPSTREAM_EXCEPTION_ROOT_CAUSE_FORENSICS";

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",state,certifiedAt:new Date().toISOString(),
  crashCertification:{
    priorSocketHangup:socketHangup,
    listener8787CurrentlyPresent:listenerPresent,
    listenerGoneAfterFailure:listenerGone,
    crashSequenceCertified
  },
  errorBoundaryQualification:{
    ...boundary,
    repairNeeded,
    repairAuthorized:false
  },
  safety:{
    networkRequestsPerformed:0,
    proxyRestartPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
  artifacts:{repairPlan:planPath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
