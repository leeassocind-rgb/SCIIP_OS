#!/usr/bin/env python3
import sys,json,hashlib,subprocess,time
from pathlib import Path
repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R2_CDP_OPEN_TRANSPORT_RESIDUAL_DIAGNOSIS/cdp_open_transport_residual_diagnosis.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_CDP_CALL_TRANSPORT_METHOD_BINDING_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"cdp_call_transport_method_binding_repair_and_record401_recertification.json"
print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R3 CDP.call Transport Method Binding Repair + Record401 Recertification")
print("="*120)
print("Application source mutation: ON — CDP raw-socket WebSocket text-frame send adapter only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")
pj=json.loads(prior.read_text()) if prior.exists() else {}
expected="RAW_NET_SOCKET_ASSIGNED_TO_THIS_WS_WITH_DUAL_SEND_APIS_CDP_CALL_BOUND_TO_WRONG_TRANSPORT_METHOD"
if pj.get("classification")!=expected: raise SystemExit("BLOCKED: expected R5-R1-R2 transport classification absent")
if not runner.exists(): raise SystemExit("BLOCKED: authoritative runner missing")
src=runner.read_text()
before=hashlib.sha256(src.encode()).hexdigest()
if subprocess.run(["node","--check",str(runner)],capture_output=True).returncode: raise SystemExit("BLOCKED: baseline syntax invalid")
old='this.ws.send(JSON.stringify({id,method,params}));'
if old not in src: raise SystemExit("BLOCKED: exact CDP.call this.ws.send source not found")
new='''{
        const __r29bPayload=Buffer.from(JSON.stringify({id,method,params}),"utf8");
        const __r29bMask=crypto.randomBytes(4);
        let __r29bHeader;
        if(__r29bPayload.length<126){
          __r29bHeader=Buffer.alloc(2); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|__r29bPayload.length;
        }else if(__r29bPayload.length<=0xffff){
          __r29bHeader=Buffer.alloc(4); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|126; __r29bHeader.writeUInt16BE(__r29bPayload.length,2);
        }else{
          __r29bHeader=Buffer.alloc(10); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|127; __r29bHeader.writeBigUInt64BE(BigInt(__r29bPayload.length),2);
        }
        const __r29bMasked=Buffer.alloc(__r29bPayload.length);
        for(let __r29bI=0;__r29bI<__r29bPayload.length;__r29bI++) __r29bMasked[__r29bI]=__r29bPayload[__r29bI]^__r29bMask[__r29bI&3];
        this.socket.write(Buffer.concat([__r29bHeader,__r29bMask,__r29bMasked]));
      }'''
src2=src.replace(old,new,1)
runner.write_text(src2)
after=hashlib.sha256(runner.read_bytes()).hexdigest()
checks={"exactWsSendReplaced":old not in src2,"maskedClientFramePresent":"0x80|__r29bPayload.length" in src2,
"finTextOpcodePresent":"__r29bHeader[0]=0x81" in src2,"randomMaskPresent":"crypto.randomBytes(4)" in src2,
"socketWritePresent":"this.socket.write(Buffer.concat" in src2,"extended16LengthPresent":"writeUInt16BE" in src2,
"extended64LengthPresent":"writeBigUInt64BE" in src2}
nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("RUNNER_SHA256_BEFORE:",before); print("RUNNER_SHA256_AFTER:",after)
for k,v in checks.items(): print(f"{k}: {v}")
print("NODE_CHECK_EXIT:",nc.returncode); print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if not all(checks.values()) or nc.returncode: raise SystemExit("BLOCKED: transport adapter repair failed certification")
print("Re-running authoritative R29B...")
to=False; ec=None; t0=time.time()
try:
 p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=30); ec=p.returncode
except subprocess.TimeoutExpired: to=True
secs=round(time.time()-t0,3)
r29bev=er/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
rj={}
if r29bev.exists():
 try:rj=json.loads(r29bev.read_text())
 except:pass
o401=next((x for x in (rj.get("outcomes") or []) if x.get("ordinal")==401),None)
failure=(o401 or {}).get("failure"); fresh=bool((o401 or {}).get("freshTargetCreated"))
settle=bool((o401 or {}).get("explorerSettleCertified")); entry=bool((o401 or {}).get("explorerEntryCertified")); cert=bool((o401 or {}).get("certified"))
cleared=failure!="this.ws.send is not a function"
print("AUTHORITATIVE_R29B_TIMED_OUT:",to); print("AUTHORITATIVE_R29B_EXIT_CODE:",ec); print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",rj.get("status")); print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",rj.get("certifiedCount")); print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",rj.get("executedCount"))
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)
print("WS_SEND_REFERENCE_ERROR_CLEARED:",cleared); print("RECORD401_FRESH_TARGET_CREATED:",fresh)
print("RECORD401_EXPLORER_SETTLE_CERTIFIED:",settle); print("RECORD401_EXPLORER_ENTRY_CERTIFIED:",entry); print("RECORD401_RECERTIFIED:",cert)
if cert:
 classification="CDP_CALL_TRANSPORT_REPAIRED_RECORD401_RECERTIFIED"; status="PASSED"; nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R6_EXACT_NEW400_NON_EXPORT_QUALIFICATION_RESUME"
elif fresh or settle or entry:
 classification="CDP_CALL_TRANSPORT_REPAIRED_RECORD401_ADVANCED_NEXT_RESIDUAL_CAPTURED"; status="DIAGNOSTIC_COMPLETE"; nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R2_POST_CDP_TRANSPORT_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"
elif cleared:
 classification="CDP_CALL_TRANSPORT_REPAIRED_SEND_ERROR_CLEARED_NEXT_TRANSPORT_RESIDUAL_CAPTURED"; status="DIAGNOSTIC_COMPLETE"; nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R4_CDP_FRAME_RECEIVE_OR_CALL_LIFECYCLE_DIAGNOSIS"
else:
 classification="CDP_CALL_TRANSPORT_REPAIR_DID_NOT_CLEAR_SEND_ERROR"; status="DIAGNOSTIC_COMPLETE"; nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R4_CDP_TRANSPORT_ADAPTER_REPAIR_DIAGNOSIS"
result={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R3","status":status,"classification":classification,"runnerSha256Before":before,"runnerSha256After":after,
"sourceChecks":checks,"authoritativeR29B":{"timedOut":to,"exitCode":ec,"seconds":secs,"status":rj.get("status"),"certifiedCount":rj.get("certifiedCount"),"executedCount":rj.get("executedCount")},
"wsSendReferenceErrorCleared":cleared,"record401FreshTargetCreated":fresh,"record401ExplorerSettleCertified":settle,"record401ExplorerEntryCertified":entry,
"record401Recertified":cert,"record401Outcome":o401,"governedDataMutationOff":True,"exportInvocationOff":True,"strictSequential":True,"haltOnFirstFailure":True,"nextMilestone":nextm}
ev.write_text(json.dumps(result,indent=2)+"\n")
print("CLASSIFICATION:",classification); print("STATUS:",status); print("NEXT_MILESTONE:",nextm); print("EVIDENCE:",ev)
print("R29B-R5-R1-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
