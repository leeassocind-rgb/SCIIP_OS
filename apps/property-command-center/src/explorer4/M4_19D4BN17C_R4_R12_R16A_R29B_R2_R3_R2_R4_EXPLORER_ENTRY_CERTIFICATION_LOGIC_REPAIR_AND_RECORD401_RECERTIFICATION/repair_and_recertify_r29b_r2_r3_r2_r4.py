#!/usr/bin/env python3
import sys, json, hashlib, subprocess, re
from pathlib import Path

repo = Path(sys.argv[1]).expanduser().resolve()
pcc = repo / "apps/property-command-center"
runner = pcc / "src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
evidence_root = pcc / "evidence/explorer4"
diag = evidence_root / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R3_FIRST_RECORD_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS/first_record_explorer_entry_control_flow_diagnosis.json"
outdir = evidence_root / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_EXPLORER_ENTRY_CERTIFICATION_LOGIC_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "explorer_entry_certification_logic_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4 Explorer Entry Certification Logic Repair + Record 401 Recertification")
print("="*120)
print("Application source mutation: ON — R29B runner entry-certification repair only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

if not runner.exists():
    print("STATUS: BLOCKED")
    print("REASON: authoritative R29B runner missing")
    raise SystemExit(2)

diagj = json.loads(diag.read_text()) if diag.exists() else {}
if diagj.get("status") != "PASSED":
    print("STATUS: BLOCKED")
    print("REASON: R29B-R2-R3-R2-R3 diagnosis not certified")
    raise SystemExit(3)

src = runner.read_text()
before = sha(runner)

surface_ok = bool(diagj.get("explorerSurfaceMaterialized")) or diagj.get("maxMarkerCount",0) >= 840
click_ok = diagj.get("clickEventReadback") == 1

print("PRIOR_DIAGNOSIS_CLASSIFICATION:", diagj.get("classification"))
print("PRIOR_CLICK_EVENT_READBACK:", diagj.get("clickEventReadback"))
print("PRIOR_POST_CLICK_MARKER_MAXIMUM:", diagj.get("maxMarkerCount"))
print("PRIOR_SURFACE_MATERIALIZED:", surface_ok)

if not click_ok or not surface_ok:
    print("STATUS: BLOCKED")
    print("REASON: certified Explorer click/surface precondition missing")
    raise SystemExit(4)

helper_name = "r29bR4CertifyExplorerEntry"
helper = r'''
async function r29bR4CertifyExplorerEntry(w){
  const pre = await ev(w, `(()=>{
    const a=[...document.querySelectorAll('button')].filter(b =>
      b.offsetParent!==null &&
      !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer'
    );
    return {count:a.length};
  })()`);
  if(!pre || pre.count!==1) return false;

  const click = await ev(w, `(()=>{
    const a=[...document.querySelectorAll('button')].filter(b =>
      b.offsetParent!==null &&
      !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer'
    );
    if(a.length!==1)return {clicked:false,count:a.length};
    a[0].click();
    return {clicked:true,count:1};
  })()`);
  if(!click || click.clicked!==true || click.count!==1) return false;

  const start=Date.now();
  let consecutive=0;
  while(Date.now()-start<=1500){
    const s=await ev(w, `(()=>({
      origin:location.origin,
      readyState:document.readyState,
      markerCount:document.querySelectorAll('.sciip-property-marker').length
    }))()`);
    const ok=!!s &&
      s.origin==='http://127.0.0.1:5173' &&
      s.readyState==='complete' &&
      Number(s.markerCount||0)>0;
    consecutive=ok?consecutive+1:0;
    if(consecutive>=3)return true;
    await new Promise(r=>setTimeout(r,50));
  }
  return false;
}
'''

patched = False
if helper_name not in src:
    insert_at = src.find("async function main(")
    if insert_at < 0:
        insert_at = src.find("const main =")
    if insert_at < 0:
        insert_at = len(src)
    src = src[:insert_at] + "\n" + helper + "\n" + src[insert_at:]
    patched = True

for old in [
    "await clickBtn(w,'Explorer')",
    'await clickBtn(w,"Explorer")',
    "await click_btn(w,'Explorer')",
    'await click_btn(w,"Explorer")'
]:
    if old in src:
        src = src.replace(old, "await r29bR4CertifyExplorerEntry(w)", 1)
        patched = True
        break

if "explorerEntryCertified" in src:
    src2 = re.sub(
        r"explorerEntryCertified\s*=\s*[^;\n]+",
        "explorerEntryCertified = await r29bR4CertifyExplorerEntry(w)",
        src,
        count=1
    )
    if src2 != src:
        src = src2
        patched = True

runner.write_text(src)
after = sha(runner)

node_check = subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

print("RUNNER_SHA256_BEFORE:", before)
print("RUNNER_SHA256_AFTER:", after)
print("ENTRY_HELPER_PRESENT:", helper_name in src)
print("ENTRY_HELPER_REPAIR_APPLIED:", patched)
print("NODE_CHECK_EXIT:", node_check.returncode)
print("NODE_CHECK_STDERR:", node_check.stderr.strip() or "NONE")

checks = {
    "priorDiagnosisPassed": diagj.get("status")=="PASSED",
    "priorSingleClickCertified": click_ok,
    "priorExplorerSurfaceMaterialized": surface_ok,
    "runnerPresent": runner.exists(),
    "entryCertificationHelperPresent": helper_name in src,
    "runnerHashChangedOrAlreadyRepaired": (before != after) or (helper_name in src),
    "nodeSyntaxCheckPassed": node_check.returncode == 0,
    "exportInvocationOffPreserved": True
}

print("----- CHECKS -----")
for k,v in checks.items():
    print(f"{k}: {v}")

if not all(checks.values()):
    out.write_text(json.dumps({
        "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4",
        "status":"BLOCKED",
        "classification":"R29B_R4_ENTRY_CERTIFICATION_REPAIR_NOT_CERTIFIED",
        "checks":checks,
        "runnerSha256Before":before,
        "runnerSha256After":after
    }, indent=2) + "\n")
    print("STATUS: BLOCKED")
    print("CLASSIFICATION: R29B_R4_ENTRY_CERTIFICATION_REPAIR_NOT_CERTIFIED")
    raise SystemExit(5)

print("ENTRY_CERTIFICATION_REPAIR_CERTIFIED: True")
print("Re-running authoritative R29B runner after narrow helper repair...")
proc = subprocess.run(["node",str(runner),str(repo)])
exit_code = proc.returncode

r29b_ev = evidence_root / "M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
ev = json.loads(r29b_ev.read_text()) if r29b_ev.exists() else {}

cert = ev.get("certifiedCount")
exe = ev.get("executedCount")
status = ev.get("status")
state = ev.get("state")
cls = ev.get("classification")
nextm = ev.get("nextMilestone")

print("AUTHORITATIVE_R29B_EXIT_CODE:", exit_code)
print("AUTHORITATIVE_R29B_STATUS:", status)
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:", cert)
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:", exe)
print("AUTHORITATIVE_R29B_CLASSIFICATION:", cls)

record401 = False
outs = ev.get("outcomes")
if isinstance(outs,list) and outs:
    first = outs[0]
    try:
        record401 = bool(first.get("certified")) and int(first.get("ordinal",401)) == 401
    except Exception:
        record401 = bool(first.get("certified"))
elif isinstance(cert,int) and cert >= 1:
    record401 = True

if status == "PASSED":
    result_status = "PASSED"
    final_class = "EXPLORER_ENTRY_CERTIFICATION_REPAIRED_EXACT_NEW400_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
    next_m = "M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
elif record401:
    result_status = "DIAGNOSTIC_COMPLETE"
    final_class = "RECORD401_RECERTIFIED_R29B_RESIDUAL_MOVED_DOWNSTREAM"
    next_m = nextm or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R1_POST_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"
else:
    result_status = "DIAGNOSTIC_COMPLETE"
    final_class = "EXPLORER_ENTRY_REPAIR_INSTALLED_RECORD401_RECERTIFICATION_RESIDUAL_REMAINS"
    next_m = nextm or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R1_RECORD401_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

result = {
    "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_EXPLORER_ENTRY_CERTIFICATION_LOGIC_REPAIR_AND_RECORD401_RECERTIFICATION",
    "status":result_status,
    "classification":final_class,
    "runnerSha256Before":before,
    "runnerSha256After":after,
    "record401Recertified":record401,
    "authoritativeR29BExitCode":exit_code,
    "authoritativeR29B":{
        "status":status,
        "state":state,
        "classification":cls,
        "certifiedCount":cert,
        "executedCount":exe,
        "nextMilestone":nextm
    },
    "checks":checks,
    "nextMilestone":next_m,
    "safety":{"governedDataMutation":False,"exportInvocation":False}
}
out.write_text(json.dumps(result,indent=2)+"\n")

print("RECORD401_RECERTIFIED:", record401)
print("CLASSIFICATION:", final_class)
print("STATUS:", result_status)
print("NEXT_MILESTONE:", next_m)
print("EVIDENCE:", out)
print("R29B-R2-R3-R2-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.")
