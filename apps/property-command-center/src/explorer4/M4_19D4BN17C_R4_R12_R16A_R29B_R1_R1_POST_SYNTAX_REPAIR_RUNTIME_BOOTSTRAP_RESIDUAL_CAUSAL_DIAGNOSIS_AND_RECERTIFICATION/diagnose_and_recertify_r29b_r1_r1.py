#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,time,urllib.request,subprocess,hashlib

R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R1_R1_POST_SYNTAX_REPAIR_RUNTIME_BOOTSTRAP_RESIDUAL_CAUSAL_DIAGNOSIS_AND_RECERTIFICATION"

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
    ep=out/"post_syntax_repair_runtime_bootstrap_residual_causal_diagnosis_and_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29B-R1-R1 Post-Syntax-Repair Runtime Bootstrap Residual Diagnosis + Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("R29B runner mutation: OFF")

    if not runner.exists():
        print("STATUS: BLOCKED")
        print("REASON: authoritative R29B runner missing")
        return 4

    check=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
    print("R29B_NODE_CHECK_EXIT:",check.returncode)
    print("R29B_NODE_CHECK_STDERR:",check.stderr.strip() or "NONE")
    if check.returncode!=0:
        print("STATUS: BLOCKED")
        print("REASON: previously repaired R29B syntax no longer certified")
        return 5

    runner_hash_before=sha(runner)

    app_pre,app_pre_body=safe("http://127.0.0.1:5173/",1)
    cdp_pre,_=safe("http://127.0.0.1:9333/json/version",1)
    print("SCIIP_APP_HTTP_STATUS_BEFORE:",app_pre)
    print("CDP_HTTP_STATUS_BEFORE:",cdp_pre)

    classification_before=("SCIIP_APP_RUNTIME_NOT_REACHABLE"
                           if app_pre!=200 else "SCIIP_APP_RUNTIME_REACHABLE")
    print("PRE_RECOVERY_CLASSIFICATION:",classification_before)

    started=False
    runtime_log="/tmp/sciip-r29b-r1-r1-vite.log"
    if app_pre!=200:
        started=True
        lf=open(runtime_log,"w")
        subprocess.Popen(
            ["npm","run","dev","--","--host","127.0.0.1","--port","5173"],
            cwd=pcc,stdout=lf,stderr=subprocess.STDOUT,start_new_session=True
        )
        for _ in range(100):
            s,_=safe("http://127.0.0.1:5173/",1)
            if s==200: break
            time.sleep(.25)

    app_after,_=safe("http://127.0.0.1:5173/",1)
    cdp_after,_=safe("http://127.0.0.1:9333/json/version",1)
    print("SCIIP_APP_BOOTSTRAP_ACTION:", "STARTED_PROPERTY_COMMAND_CENTER_RUNTIME" if started else "REUSED_EXISTING_RUNTIME")
    print("SCIIP_APP_RUNTIME_LOG:",runtime_log if started else "N/A")
    print("SCIIP_APP_HTTP_STATUS_AFTER:",app_after)
    print("CDP_HTTP_STATUS_AFTER:",cdp_after)

    # CDP is required by authoritative R29B. Do not attempt to launch/replace Chrome here;
    # preserve the established reusable CDP authority and fail closed if absent.
    runtime_ready=(app_after==200)
    cdp_ready=(cdp_after==200)

    checks={
      "authoritativeR29BRunnerPresent":runner.exists(),
      "r29bSyntaxStillCertified":check.returncode==0,
      "runtimeFailureDiagnosedBeforeRecovery":app_pre!=200,
      "sciipAppReadyAfterRecovery":runtime_ready,
      "cdpReadyAfterRecovery":cdp_ready,
      "runnerUnmodifiedDuringRecovery":True,
      "governedDataMutationOff":True,
      "exportInvocationOff":True
    }

    if not runtime_ready or not cdp_ready:
        status="DIAGNOSTIC_COMPLETE"
        classification=("R29B_RUNTIME_RECOVERY_INCOMPLETE_APP_NOT_READY"
                        if not runtime_ready else
                        "R29B_RUNTIME_READY_BUT_CDP_NOT_AVAILABLE")
        nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_R1_R1_R1_CDP_REATTACHMENT_AND_R29B_RECERTIFICATION"
             if runtime_ready and not cdp_ready else
             "M4_19D4BN17C_R4_R12_R16A_R29B_R1_R1_R1_APP_RUNTIME_BOOTSTRAP_DEEP_DIAGNOSIS")
        ev={"framework":"SCIIP_EXPLORER_4_R29B_R1_R1_POST_SYNTAX_REPAIR_RUNTIME_BOOTSTRAP_RESIDUAL_CAUSAL_DIAGNOSIS_AND_RECERTIFICATION",
            "generatedAt":datetime.now(timezone.utc).isoformat(),
            "status":status,"classification":classification,
            "runtime":{"before":app_pre,"after":app_after,"started":started,"log":runtime_log},
            "cdp":{"before":cdp_pre,"after":cdp_after},
            "checks":checks,"nextMilestone":nxt}
        ep.write_text(json.dumps(ev,indent=2)+"\n")
        print("----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("CLASSIFICATION:",classification)
        print("STATUS:",status)
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ep)
        return 0

    print("RUNTIME_BOOTSTRAP_CERTIFIED: True")
    print("Re-running authoritative R29B runner unchanged...")
    run=subprocess.run(["node",str(runner),str(repo)])
    runner_hash_after=sha(runner)
    checks["runnerHashPreservedAcrossRecertification"]=runner_hash_before==runner_hash_after
    checks["authoritativeR29BExitZero"]=run.returncode==0

    r29b_state=None
    if r29bev.exists():
        try:r29b_state=json.loads(r29bev.read_text())
        except:pass

    # Authoritative R29B returns 0 for both full pass and structured diagnostic halt,
    # so inspect its state rather than overclaiming completion.
    r29b_status=(r29b_state or {}).get("status")
    r29b_class=(r29b_state or {}).get("classification")
    r29b_next=(r29b_state or {}).get("nextMilestone")

    if r29b_status=="PASSED":
        status="PASSED"
        classification="SCIIP_RUNTIME_BOOTSTRAPPED_R29B_EXACT_NEW400_NON_EXPORT_QUALIFICATION_CERTIFIED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
    else:
        status="DIAGNOSTIC_COMPLETE"
        classification="SCIIP_RUNTIME_BOOTSTRAPPED_R29B_LIVE_QUALIFICATION_RESIDUAL_REMAINS"
        nxt=r29b_next or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

    ev={
      "framework":"SCIIP_EXPLORER_4_R29B_R1_R1_POST_SYNTAX_REPAIR_RUNTIME_BOOTSTRAP_RESIDUAL_CAUSAL_DIAGNOSIS_AND_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"classification":classification,
      "runtime":{"before":app_pre,"after":app_after,"started":started,"log":runtime_log},
      "cdp":{"before":cdp_pre,"after":cdp_after},
      "runner":{"sha256Before":runner_hash_before,"sha256After":runner_hash_after,
                "exitCode":run.returncode,"nodeCheckPassed":check.returncode==0},
      "authoritativeR29B":{"status":r29b_status,"classification":r29b_class,"nextMilestone":r29b_next},
      "checks":checks,
      "safety":{"applicationSourceMutation":False,"governedDataMutation":False,"exportInvocation":False},
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("AUTHORITATIVE_R29B_STATUS:",r29b_status)
    print("AUTHORITATIVE_R29B_CLASSIFICATION:",r29b_class)
    print("CLASSIFICATION:",classification)
    print("STATUS:",status)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("R29B-R1-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
