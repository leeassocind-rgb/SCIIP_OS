#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys, urllib.request, subprocess, time, hashlib, json

R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_RUNTIME_REBOOTSTRAP_TRANSPORT_EXERCISE_AND_NON_EXPORT_RECERTIFICATION"

def safe(url,timeout=1):
    try:
        with urllib.request.urlopen(url,timeout=timeout) as r:
            return r.status,r.read()
    except Exception as e:
        return None,repr(e).encode()

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29B/"qualify_r29b.mjs"
    r29bev=er/R29B/"exact_new_four_hundred_non_export_live_qualification.json"
    out=er/OUT
    out.mkdir(parents=True,exist_ok=True)
    ep=out/"runtime_rebootstrap_transport_exercise_and_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29B-R2-R3 Runtime Rebootstrap + Transport Exercise + Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("R29B runner mutation: OFF")

    if not runner.exists():
        print("STATUS: BLOCKED")
        print("REASON: authoritative R29B runner missing")
        return 4

    before_hash=sha(runner)
    src=runner.read_text()

    syntax=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
    checks={
      "r29bRunnerPresent":True,
      "nodeSyntaxCheckPassed":syntax.returncode==0,
      "rawStdlibWebSocketPresent":"class RawWebSocket {" in src,
      "cdpUsesRawWebSocket":"this.ws=new RawWebSocket(this.wsUrl);" in src,
      "http101RepairPresent":'startsWith("HTTP/1.1 101")' in src,
      "literalBackslashNArtifactAbsent":'\\nclass CDP {' not in src,
      "exportInvocationOffPreserved":"Export invocation: OFF" in src,
      "freshPagePerRecordPreserved":"Fresh page per record: REQUIRED" in src,
      "strictSequentialPreserved":"Strict sequential: ON" in src,
      "haltOnFirstFailurePreserved":"Halt on first failure: ON" in src,
    }

    print("R29B_NODE_CHECK_EXIT:",syntax.returncode)
    print("R29B_NODE_CHECK_STDERR:",syntax.stderr.strip() or "NONE")
    if not all(checks.values()):
        print("----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("STATUS: BLOCKED")
        print("CLASSIFICATION: R29B_TRANSPORT_OR_SYNTAX_CONTRACT_NOT_PRESERVED")
        return 5

    app_pre,_=safe("http://127.0.0.1:5173/",1)
    cdp_pre,_=safe("http://127.0.0.1:9333/json/version",1)
    print("SCIIP_APP_HTTP_STATUS_BEFORE:",app_pre)
    print("CDP_HTTP_STATUS_BEFORE:",cdp_pre)

    started=False
    runtime_log="/tmp/sciip-r29b-r2-r3-vite.log"
    if app_pre!=200:
        started=True
        lf=open(runtime_log,"w")
        subprocess.Popen(
            ["npm","run","dev","--","--host","127.0.0.1","--port","5173"],
            cwd=pcc,stdout=lf,stderr=subprocess.STDOUT,start_new_session=True
        )
        for _ in range(100):
            s,_=safe("http://127.0.0.1:5173/",1)
            if s==200:break
            time.sleep(.25)

    app_after,_=safe("http://127.0.0.1:5173/",1)
    cdp_after,_=safe("http://127.0.0.1:9333/json/version",1)
    print("SCIIP_APP_BOOTSTRAP_ACTION:", "STARTED_PROPERTY_COMMAND_CENTER_RUNTIME" if started else "REUSED_EXISTING_RUNTIME")
    print("SCIIP_APP_RUNTIME_LOG:", runtime_log if started else "N/A")
    print("SCIIP_APP_HTTP_STATUS_AFTER:",app_after)
    print("CDP_HTTP_STATUS_AFTER:",cdp_after)

    checks["sciipAppReadyAfterBootstrap"]=app_after==200
    checks["cdpReadyAfterBootstrap"]=cdp_after==200

    if app_after!=200 or cdp_after!=200:
        status="DIAGNOSTIC_COMPLETE"
        classification="R29B_R2_R3_RUNTIME_REBOOTSTRAP_INCOMPLETE"
        nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R1_CDP_REATTACHMENT_REPAIR"
             if app_after==200 and cdp_after!=200 else
             "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R1_APP_RUNTIME_BOOTSTRAP_DEEP_DIAGNOSIS")
        ev={"framework":"SCIIP_EXPLORER_4_R29B_R2_R3_RUNTIME_REBOOTSTRAP_TRANSPORT_EXERCISE_AND_NON_EXPORT_RECERTIFICATION",
            "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"classification":classification,
            "checks":checks,"nextMilestone":nxt}
        ep.write_text(json.dumps(ev,indent=2)+"\n")
        print("----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("CLASSIFICATION:",classification)
        print("STATUS:",status)
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ep)
        return 0

    print("RUNTIME_REBOOTSTRAP_CERTIFIED: True")
    print("RAW_WEBSOCKET_TRANSPORT_READY_FOR_LIVE_EXERCISE: True")
    print("Re-running authoritative R29B runner unchanged...")

    run=subprocess.run(["node",str(runner),str(repo)])
    after_hash=sha(runner)
    checks["runnerHashPreservedAcrossRecertification"]=before_hash==after_hash
    checks["authoritativeR29BExitZero"]=run.returncode==0

    st=None
    if r29bev.exists():
        try:st=json.loads(r29bev.read_text())
        except:pass

    rstatus=(st or {}).get("status")
    rclass=(st or {}).get("classification")
    cert=(st or {}).get("certifiedCount")
    exe=(st or {}).get("executedCount")
    nxt0=(st or {}).get("nextMilestone")

    print("AUTHORITATIVE_R29B_STATUS:",rstatus)
    print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",cert)
    print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",exe)
    print("AUTHORITATIVE_R29B_CLASSIFICATION:",rclass)

    if rstatus=="PASSED":
        status="PASSED"
        classification="R29B_RUNTIME_REBOOTSTRAPPED_RAW_WEBSOCKET_TRANSPORT_EXERCISED_EXACT_NEW400_NON_EXPORT_QUALIFICATION_CERTIFIED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
    else:
        status="DIAGNOSTIC_COMPLETE"
        classification="R29B_RAW_WEBSOCKET_TRANSPORT_EXERCISED_OR_NEXT_LIVE_RESIDUAL_CAPTURED"
        nxt=nxt0 or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R1_POST_TRANSPORT_EXERCISE_RESIDUAL_CAUSAL_DIAGNOSIS"

    ev={"framework":"SCIIP_EXPLORER_4_R29B_R2_R3_RUNTIME_REBOOTSTRAP_TRANSPORT_EXERCISE_AND_NON_EXPORT_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,"classification":classification,
        "runtime":{"before":app_pre,"after":app_after,"started":started,"log":runtime_log},
        "cdp":{"before":cdp_pre,"after":cdp_after},
        "runner":{"sha256Before":before_hash,"sha256After":after_hash,"nodeCheckPassed":syntax.returncode==0,"exitCode":run.returncode},
        "authoritativeR29B":{"status":rstatus,"classification":rclass,"certifiedCount":cert,"executedCount":exe,"nextMilestone":nxt0},
        "checks":checks,
        "safety":{"applicationSourceMutation":False,"governedDataMutation":False,"exportInvocation":False},
        "nextMilestone":nxt}
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",status)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("R29B-R2-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
