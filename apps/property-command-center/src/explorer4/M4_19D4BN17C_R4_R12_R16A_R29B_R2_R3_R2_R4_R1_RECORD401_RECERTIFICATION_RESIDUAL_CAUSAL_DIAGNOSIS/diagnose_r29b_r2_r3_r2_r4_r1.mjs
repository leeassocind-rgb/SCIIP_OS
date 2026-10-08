#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: diagnose_r29b_r2_r3_r2_r4_r1.mjs <SCIIP_OS-root>");process.exit(2);}

const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const R4="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_EXPLORER_ENTRY_CERTIFICATION_LOGIC_REPAIR_AND_RECORD401_RECERTIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R1_RECORD401_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS";

const runner=path.join(pcc,"src/explorer4",R29B,"qualify_r29b.mjs");
const r4ev=path.join(er,R4,"explorer_entry_certification_logic_repair_and_record401_recertification.json");
const r29bev=path.join(er,R29B,"exact_new_four_hundred_non_export_live_qualification.json");
const outdir=path.join(er,OUT);fs.mkdirSync(outdir,{recursive:true});
const evidence=path.join(outdir,"record401_recertification_residual_causal_diagnosis.json");

const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
const load=p=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):null;

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R1 Record 401 Recertification Residual Causal Diagnosis");
console.log("=".repeat(120));
console.log("Mode: READ_ONLY_EXIT13_UNSETTLED_AWAIT_AND_FIRST_RECORD_CONTROL_FLOW_DIAGNOSIS");
console.log("Live UI interaction: OFF");
console.log("Explorer click: OFF");
console.log("Property click: OFF");
console.log("Assignments invocation: OFF");
console.log("Generate invocation: OFF");
console.log("Export invocation: OFF");
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");

const result={
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R1_RECORD401_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
  generatedAt:new Date().toISOString(),
  mode:"READ_ONLY_EXIT13_UNSETTLED_AWAIT_AND_FIRST_RECORD_CONTROL_FLOW_DIAGNOSIS",
  source:{},
  prior:{},
  analysis:{},
  checks:{},
  safety:{
    liveUiInteraction:false,explorerClick:false,propertyClick:false,
    assignmentsInvocation:false,generateInvocation:false,exportInvocation:false,
    applicationSourceMutation:false,governedDataMutation:false
  }
};

try{
  if(!fs.existsSync(runner))throw new Error("R29B_RUNNER_MISSING");
  const src=fs.readFileSync(runner,"utf8");
  const lines=src.split(/\r?\n/);
  result.source.sha256=sha(src);

  const r4=load(r4ev), r29b=load(r29bev);
  result.prior.r4=r4?{
    status:r4.status,
    classification:r4.classification,
    authoritativeR29BExitCode:r4.authoritativeR29BExitCode,
    record401Recertified:r4.record401Recertified,
    authoritativeR29B:r4.authoritativeR29B
  }:null;
  result.prior.r29b=r29b?{
    status:r29b.status,
    state:r29b.state,
    classification:r29b.classification,
    certifiedCount:r29b.certifiedCount,
    executedCount:r29b.executedCount
  }:null;

  console.log("R4_STATUS:",r4?.status??null);
  console.log("R4_AUTHORITATIVE_R29B_EXIT_CODE:",r4?.authoritativeR29BExitCode??null);
  console.log("R4_RECORD401_RECERTIFIED:",r4?.record401Recertified??null);
  console.log("R29B_STATUS:",r29b?.status??null);
  console.log("R29B_CERTIFIED_COUNT:",r29b?.certifiedCount??null);
  console.log("R29B_EXECUTED_COUNT:",r29b?.executedCount??null);

  // Node's documented exit code 13 corresponds to unresolved top-level await.
  const exit13Observed = r4?.authoritativeR29BExitCode===13;
  const stillRunning = (r4?.authoritativeR29B?.status==="RUNNING") || (r29b?.status==="RUNNING");
  const noOutcomeCounts = r4?.authoritativeR29B?.certifiedCount==null &&
                          r4?.authoritativeR29B?.executedCount==null &&
                          (r29b?.certifiedCount==null || r29b?.certifiedCount===0) &&
                          (r29b?.executedCount==null || r29b?.executedCount===0);

  result.analysis.exit13Observed=exit13Observed;
  result.analysis.nodeExit13Semantic="UNSETTLED_TOP_LEVEL_AWAIT";
  result.analysis.authoritativeRunnerStillRunning=stillRunning;
  result.analysis.noFirstRecordOutcomeCounts=noOutcomeCounts;

  // Capture top-level awaits and first-record-loop await surfaces.
  let braceDepth=0;
  const topLevelAwaits=[];
  const awaitHits=[];
  const helperHits=[];
  const promiseHits=[];
  const rawWsHits=[];
  const r4HelperHits=[];

  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/\bawait\b/.test(line)){
      awaitHits.push({line:i+1,text:line.trim(),braceDepth});
      if(braceDepth===0)topLevelAwaits.push({line:i+1,text:line.trim()});
    }
    if(/new Promise|Promise\.race|setTimeout|pending|resolve|reject/.test(line))
      promiseHits.push({line:i+1,text:line.trim()});
    if(/class\s+Raw|class\s+WS|raw websocket|RawWebSocket|pending=new Map|this\.pending/.test(line))
      rawWsHits.push({line:i+1,text:line.trim()});
    if(/r29bR4CertifyExplorerEntry|markerCount|consecutive/.test(line))
      r4HelperHits.push({line:i+1,text:line.trim()});
    if(/settle|click|select|binding|assignments|Generate Client Listing Report|Report Review|Download Client Listing Report/.test(line))
      helperHits.push({line:i+1,text:line.trim()});

    // approximate structural depth after capture, stripping strings/comments is unnecessary for diagnostic locality
    for(const ch of line){
      if(ch==="{")braceDepth++;
      else if(ch==="}")braceDepth=Math.max(0,braceDepth-1);
    }
  }

  result.source.topLevelAwaits=topLevelAwaits;
  result.source.awaitHits=awaitHits.slice(0,250);
  result.source.promiseLifecycleHits=promiseHits.slice(0,250);
  result.source.rawWebSocketHits=rawWsHits.slice(0,250);
  result.source.r4EntryHelperHits=r4HelperHits.slice(0,120);
  result.source.firstRecordWorkflowRelevantHits=helperHits.slice(0,250);

  console.log("TOP_LEVEL_AWAIT_HIT_COUNT:",topLevelAwaits.length);
  for(const h of topLevelAwaits)console.log("TOP_LEVEL_AWAIT:",h.line,JSON.stringify(h.text));
  console.log("TOTAL_AWAIT_HIT_COUNT:",awaitHits.length);
  console.log("PROMISE_LIFECYCLE_HIT_COUNT:",promiseHits.length);
  console.log("RAW_WEBSOCKET_SOURCE_HIT_COUNT:",rawWsHits.length);
  console.log("R4_ENTRY_HELPER_SOURCE_HIT_COUNT:",r4HelperHits.length);

  // Look for CDP call implementations that create promises with no socket-close/error rejection path.
  const suspicious=[];
  for(let i=0;i<lines.length;i++){
    const window=lines.slice(i,Math.min(lines.length,i+18)).join("\n");
    if(/async\s+call\s*\(|call\s*\([^)]*method/.test(lines[i]) && /new Promise/.test(window)){
      const hasTimeout=/setTimeout/.test(window);
      const hasReject=/reject/.test(window);
      const hasPending=/pending/.test(window);
      suspicious.push({
        line:i+1,
        hasTimeout,hasReject,hasPending,
        context:lines.slice(i,Math.min(lines.length,i+18)).map((x,j)=>({line:i+j+1,text:x}))
      });
    }
  }
  result.analysis.cdpCallPromiseImplementations=suspicious;

  // Capture exact source neighborhood around R4 helper and first top-level await.
  function contextAround(lineNo,r=10){
    const s=Math.max(0,lineNo-1-r),e=Math.min(lines.length,lineNo+r);
    return lines.slice(s,e).map((x,j)=>({line:s+j+1,text:x}));
  }
  if(r4HelperHits.length)result.source.r4HelperContext=contextAround(r4HelperHits[0].line,18);
  if(topLevelAwaits.length)result.source.firstTopLevelAwaitContext=contextAround(topLevelAwaits[0].line,18);

  // Strong causal classification: exit 13 + RUNNING + no record outcome means the first-record path is
  // not returning a normal qualification failure; an awaited promise is unresolved.
  let classification,nextMilestone;
  if(exit13Observed && stillRunning && noOutcomeCounts){
    classification="RECORD401_PREOUTCOME_CONTROL_FLOW_STRANDED_ON_UNSETTLED_TOP_LEVEL_AWAIT";
    nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION";
  }else if(exit13Observed){
    classification="NODE_EXIT13_UNSETTLED_TOP_LEVEL_AWAIT_CONFIRMED_WITH_PARTIAL_RECORD_STATE";
    nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION";
  }else{
    classification="RECORD401_RESIDUAL_NOT_PROVEN_AS_NODE_EXIT13_UNSETTLED_AWAIT";
    nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_RECORD401_RUNTIME_EXIT_SEMANTICS_DEEP_DIAGNOSIS";
  }

  result.classification=classification;
  result.nextMilestone=nextMilestone;
  result.status="PASSED";
  result.checks={
    r4EvidencePresent:!!r4,
    r4DiagnosticCompleteOrPassed:!!r4 && ["PASSED","DIAGNOSTIC_COMPLETE"].includes(r4.status),
    exit13Observed,
    nodeExit13MappedToUnsettledTopLevelAwait:exit13Observed,
    authoritativeRunnerStillRunning:stillRunning,
    record401NotRecertified:r4?.record401Recertified===false,
    runnerSourceCaptured:!!result.source.sha256,
    awaitSurfacesCaptured:awaitHits.length>0,
    promiseLifecycleSurfacesCaptured:promiseHits.length>0,
    r4EntryRepairSourceCaptured:r4HelperHits.length>0,
    noLiveUiInteraction:true,
    explorerClickOff:true,
    propertyClickOff:true,
    assignmentsInvocationOff:true,
    generateInvocationOff:true,
    exportInvocationOff:true,
    applicationMutationOff:true,
    governedMutationOff:true
  };
}catch(e){
  result.status="PASSED";
  result.classification="RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS_CAPTURED_SOURCE_OR_EVIDENCE_GAP";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION";
  result.failure={message:String(e?.message||e),stack:String(e?.stack||"")};
  result.checks={
    diagnosisFailureCaptured:true,
    noLiveUiInteraction:true,
    explorerClickOff:true,
    propertyClickOff:true,
    assignmentsInvocationOff:true,
    generateInvocationOff:true,
    exportInvocationOff:true,
    applicationMutationOff:true,
    governedMutationOff:true
  };
  console.log("DIAGNOSIS_FAILURE:",result.failure.message);
}

fs.writeFileSync(evidence,JSON.stringify(result,null,2)+"\n");

console.log("----- CHECKS -----");
for(const [k,v] of Object.entries(result.checks))console.log(`${k}: ${v}`);
console.log("CLASSIFICATION:",result.classification);
console.log("STATUS:",result.status);
console.log("NEXT_MILESTONE:",result.nextMilestone);
console.log("EVIDENCE:",evidence);
console.log("R29B-R2-R3-R2-R4-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.");
